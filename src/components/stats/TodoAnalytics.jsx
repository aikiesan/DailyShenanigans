import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function TodoAnalytics({ stats }) {
  const { totalCreated, totalCompleted, completionRate, dailyRates, productivityByDay, avgPerDay } = stats

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-5">
        <span>✅</span> Análise de Tarefas
      </h3>

      {/* Counter cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Criadas" value={totalCreated} icon="📋" color="bg-cerrado-50 text-cerrado-700" />
        <StatCard label="Concluídas" value={totalCompleted} icon="✅" color="bg-amazonia-50 text-amazonia-700" />
        <StatCard label="Taxa" value={`${completionRate}%`} icon="📊" color="bg-atlantica-50 text-atlantica-700" />
        <StatCard label="Média/dia" value={avgPerDay} icon="📈" color="bg-pantanal-50 text-pantanal-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completion rate over time */}
        {dailyRates.length > 1 && (
          <div>
            <h4 className="text-sm font-bold text-gray-500 mb-3">Taxa de conclusão ao longo do tempo</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRates.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
                  <XAxis dataKey="date" tick={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Taxa']}
                    labelFormatter={(l) => l}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#2e7d32"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#2e7d32' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Productivity by day of week */}
        <div>
          <h4 className="text-sm font-bold text-gray-500 mb-3">Produtividade por dia da semana</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avgCompleted" name="Média concluídas" radius={[6, 6, 0, 0]} fill="#d4a017" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs font-semibold opacity-70">{label}</div>
    </div>
  )
}
