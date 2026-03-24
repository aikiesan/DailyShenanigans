import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const MOOD_COLORS = {
  '😄': '#2e7d32',
  '😊': '#689f38',
  '😐': '#d4a017',
  '😔': '#c2956b',
  '😫': '#b71c1c',
}

export default function MoodTracker({ data }) {
  const { timeline, distribution } = data

  if (timeline.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-4">
          <span>🌡️</span> Rastreador de Humor
        </h3>
        <p className="text-sm text-gray-400 italic text-center py-8">
          Selecione seu humor nas entradas para gerar o gráfico emocional do bioma 🦫
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-5">
        <span>🌡️</span> Rastreador de Humor
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood timeline */}
        {timeline.length > 1 && (
          <div>
            <h4 className="text-sm font-bold text-gray-500 mb-3">Evolução do humor</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
                  <XAxis dataKey="date" tick={false} />
                  <YAxis domain={[0, 6]} ticks={[1, 2, 3, 4, 5]} tickFormatter={v => ['', '😫', '😔', '😐', '😊', '😄'][v] || ''} />
                  <Tooltip
                    formatter={(v) => [['', '😫', '😔', '😐', '😊', '😄'][v] || '', 'Humor']}
                    labelFormatter={(l) => l}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#689f38"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#689f38' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Mood distribution */}
        <div>
          <h4 className="text-sm font-bold text-gray-500 mb-3">Distribuição de humor</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={35}
                  dataKey="count"
                  nameKey="mood"
                  label={({ mood, count }) => `${mood} (${count})`}
                >
                  {distribution.map((entry, i) => (
                    <Cell key={i} fill={MOOD_COLORS[entry.mood] || '#888'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
