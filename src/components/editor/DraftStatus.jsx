export default function DraftStatus({ status, onSave }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg px-5 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${
          status === 'saved'
            ? 'bg-amazonia-500'
            : 'bg-cerrado-400 animate-pulse'
        }`} />
        <span className="text-xs font-semibold text-gray-500">
          {status === 'saved' ? 'Salvo ✓' : 'Não salvo...'}
        </span>
      </div>
      <button
        onClick={onSave}
        className="bg-amazonia-500 hover:bg-amazonia-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors active:scale-95"
      >
        💾 Salvar
      </button>
    </div>
  )
}
