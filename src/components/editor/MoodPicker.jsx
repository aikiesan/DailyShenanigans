const MOODS = [
  { emoji: '😫', label: 'Exausto' },
  { emoji: '😔', label: 'Difícil' },
  { emoji: '😐', label: 'Normal' },
  { emoji: '😊', label: 'Bom' },
  { emoji: '😄', label: 'Incrível' },
]

export default function MoodPicker({ value, onChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
        <span>🌡️</span> Como foi o dia?
      </h3>
      <div className="flex justify-center gap-3">
        {MOODS.map(mood => (
          <button
            key={mood.emoji}
            onClick={() => onChange(value === mood.emoji ? '' : mood.emoji)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              value === mood.emoji
                ? 'bg-amazonia-50 scale-110 shadow-sm ring-2 ring-amazonia-300'
                : 'hover:bg-gray-50 hover:scale-105'
            }`}
            title={mood.label}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-[10px] font-semibold text-gray-400">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
