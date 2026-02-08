import { openai } from '../config/openai.js';
import type { LogFoodIntakeArgs, LogExerciseArgs } from '../shared/types.js';

// OpenAI tool definitions for structured data extraction
const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'log_food_intake',
      description: 'Log ALL food and drink items consumed in a SINGLE meal or eating session. Do NOT split food from one meal into multiple function calls. This is ONLY for food/drinks, never for physical activities or exercise.',
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
      description: 'Log physical exercise and workout activities ONLY (running, walking, yoga, swimming, lifting, etc.). This is NEVER for food or eating. Only use this for physical activities that burn calories.',
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

CRITICAL RULES:
1. ALWAYS group ALL food items from a SINGLE meal or eating session into ONE log_food_intake call
2. NEVER split a single meal into multiple log_food_intake calls - put all items in the items array
3. ONLY use log_exercise for physical activities (running, walking, yoga, sports, lifting, etc.) - NEVER for food
4. ONLY use log_food_intake for food and drinks - NEVER for physical activities
5. If the user mentions BOTH food and exercise in separate contexts, call BOTH functions (once each)

Food Logging Guidelines:
- Detect meal type from keywords or time-of-day mentions:
  - "breakfast", "morning", "good morning" → breakfast
  - "lunch", "afternoon", "good afternoon" → lunch
  - "dinner", "evening", "good evening", "tonight" → dinner
  - "snack" or ambiguous → snack
- Estimate reasonable portion sizes if not specified (e.g., "an apple" = 1 medium apple)
- Provide calorie estimates based on standard nutritional data
- Include macros (protein, carbs, fat) when possible
- Be conservative with estimates - slightly underestimate rather than overestimate

Exercise Logging Guidelines:
- Estimate calories burned for an average 70kg (154lb) adult
- Intensity levels: light = walking/gentle yoga, moderate = jogging/regular workout, intense = running/HIIT

Examples:
- "I had ground chicken with spinach and brown rice for lunch" → ONE log_food_intake call with meal_type="lunch" containing ALL three items
- "I ate two scrambled eggs and a banana" → ONE log_food_intake call with both items
- "I ran for 30 minutes" → ONE log_exercise call (this is exercise, NOT food)
- "I had a chicken salad for lunch and then went for a 20 minute walk" → TWO calls: log_food_intake (for the salad) AND log_exercise (for the walk)

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
