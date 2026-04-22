import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function PriceHistoryChart({ historyData, platforms }) {
  if (!historyData || !platforms || platforms.length === 0) {
    return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No price history available yet.</p>;
  }

  // Merge all platform data into unified date-keyed rows
  const dateMap = {};
  for (const platform of platforms) {
    const entries = historyData[platform] || [];
    for (const entry of entries) {
      if (!dateMap[entry.date]) dateMap[entry.date] = { date: entry.date };
      dateMap[entry.date][platform] = entry.price;
    }
  }

  const chartData = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Only show last 30 days
  const recentData = chartData.slice(-30);

  return (
    <div className="chart-container glass-card" id="price-history-chart">
      <h3>📈 Price History (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={recentData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => {
              const date = new Date(d);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
            stroke="var(--text-muted)"
            fontSize={11}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={11}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '13px',
            }}
            formatter={(value) => [`$${value.toFixed(2)}`, undefined]}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Legend />
          {platforms.map((platform, idx) => (
            <Line
              key={platform}
              type="monotone"
              dataKey={platform}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
