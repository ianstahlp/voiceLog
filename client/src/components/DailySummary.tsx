import type { DailySummary as DailySummaryType } from '../shared/types';

interface DailySummaryProps {
  summary: DailySummaryType;
}

export function DailySummary({ summary }: DailySummaryProps) {
  const { totals } = summary;

  return (
    <div className="daily-summary-card">
      <h2>Daily Summary</h2>
      <div className="summary-stats">
        <div className="stat-item consumed">
          <div className="stat-label">Calories Consumed</div>
          <div className="stat-value">{totals.caloriesConsumed}</div>
        </div>
        <div className="stat-item burned">
          <div className="stat-label">Calories Burned</div>
          <div className="stat-value">{totals.caloriesBurned}</div>
        </div>
        <div className={`stat-item net ${totals.netCalories > 0 ? 'positive' : 'negative'}`}>
          <div className="stat-label">Net Calories</div>
          <div className="stat-value">
            {totals.netCalories > 0 ? '+' : ''}
            {totals.netCalories}
          </div>
        </div>
      </div>
    </div>
  );
}
