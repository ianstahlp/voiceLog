import { openai } from '../config/openai.js';
import type { LogFoodIntakeArgs, LogExerciseArgs } from '../../../shared/types.js';

// OpenAI tool definitions for structured data extraction
const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'log_food_intake',
      description: 'Log food items consumed by the user with calorie estimates and nutritional information',
      parameters: {
        type: 'object' as const,
        properties: {
          meal_type: {
            type: 'string',
            enum: ['breakfast', 'lunch', 'dinner', 'snack'],
            description: 'Type of meal based on context clues like "breakfast", "lunch", "dinner", or time of day mentions like "good morning" = breakfast',
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the food item (e.g., "scrambled eggs", "banana", "chicken breast")',
                },
                quantity: {
                  type: 'number',
                  description: 'Quantity of the food item',
                },
                unit: {
                  type: 'string',
                  description: 'Unit of measurement (e.g., "cups", "oz", "pieces", "grams")',
                },
                calories: {
                  type: 'integer',
                  description: 'Estimated calories for this food item',
                },
                protein: {
                  type: 'number',
                  description: 'Grams of protein',
                },
                carbs: {
                  type: 'number',
                  description: 'Grams of carbohydrates',
                },
                fat: {
                  type: 'number',
                  description: 'Grams of fat',
                },
                notes: {
                  type: 'string',
                  description: 'Any additional notes or context',
                },
              },
              required: ['name', 'calories'],
            },
          },
        },
        required: ['items'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'log_exercise',
      description: 'Log exercise activities performed by the user with calorie burn estimates',
      parameters: {
        type: 'object' as const,
        properties: {
          activities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                activity_type: {
                  type: 'string',
                  description: 'Type of exercise (e.g., "running", "walking", "yoga", "swimming")',
                },
                duration_minutes: {
                  type: 'integer',
                  description: 'Duration of the exercise in minutes',
                },
                intensity: {
                  type: 'string',
                  enum: ['light', 'moderate', 'intense'],
                  description: 'Intensity level of the exercise',
                },
                calories_burned: {
                  type: 'integer',
                  description: 'Estimated calories burned during this activity',
                },
                distance: {
                  type: 'number',
                  description: 'Distance covered in miles or kilometers (if applicable)',
                },
                notes: {
                  type: 'string',
                  description: 'Any additional notes or context',
                },
              },
              required: ['activity_type', 'calories_burned'],
            },
          },
        },
        required: ['activities'],
      },
    },
  },
];

const systemPrompt = `You are a nutrition and fitness tracking assistant. When users describe their meals or workouts:

1. Extract all food items or exercise activities mentioned
2. If the user mentions BOTH food and exercise, call BOTH functions (log_food_intake AND log_exercise)
3. Detect meal type from keywords or time-of-day mentions:
   - "breakfast", "morning", "good morning" → breakfast
   - "lunch", "afternoon", "good afternoon" → lunch
   - "dinner", "evening", "good evening", "tonight" → dinner
   - "snack" or ambiguous → snack
4. Estimate reasonable portion sizes if not specified (e.g., if they say "an apple", assume 1 medium apple)
5. Provide calorie estimates based on standard nutritional data for average portions
6. For exercise, estimate calories burned for an average 70kg (154lb) adult
7. Be conservative with estimates - it's better to slightly underestimate than overestimate
8. Include macros (protein, carbs, fat) when possible for food items
9. For exercise intensity: light = walking/gentle yoga, moderate = jogging/regular workout, intense = running/HIIT

Examples:
- "Good morning, I had eggs and toast for breakfast" → call log_food_intake with meal_type="breakfast"
- "I ate two scrambled eggs and a banana" → call log_food_intake with meal_type="snack" (no context)
- "I ran for 30 minutes" → call log_exercise
- "I had a chicken salad for lunch and went for a 20 minute walk" → call BOTH with meal_type="lunch" for food

Always be helpful and provide reasonable estimates even if the user's description is vague.`;

export interface ProcessedFoodData {
  type: 'food';
  data: LogFoodIntakeArgs;
}

export interface ProcessedExerciseData {
  type: 'exercise';
  data: LogExerciseArgs;
}

export type ProcessedData = ProcessedFoodData | ProcessedExerciseData;

/**
 * Process a voice transcript using OpenAI tool calling to extract structured data
 * Returns an array to support both food and exercise in the same transcript
 */
export async function processVoiceTranscript(transcript: string): Promise<ProcessedData[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      tools: tools,
      tool_choice: 'auto',
      parallel_tool_calls: true,
    });

    const message = response.choices[0].message;
    const results: ProcessedData[] = [];

    // Check if the model wants to call tools
    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const toolCall of message.tool_calls) {
        if (toolCall.type === 'function') {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          if (functionName === 'log_food_intake') {
            results.push({
              type: 'food',
              data: functionArgs as LogFoodIntakeArgs,
            });
          } else if (functionName === 'log_exercise') {
            results.push({
              type: 'exercise',
              data: functionArgs as LogExerciseArgs,
            });
          }
        }
      }
    }

    if (results.length === 0) {
      throw new Error('Could not extract any food or exercise data from transcript');
    }

    return results;
  } catch (error) {
    console.error('Error processing voice transcript:', error);
    throw new Error(
      `Failed to process transcript: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
