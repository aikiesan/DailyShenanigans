import BiomeCard from '../shared/BiomeCard'

export default function NotasSection({ value, onChange }) {
  return (
    <BiomeCard biomeKey="caatinga" title="Notas Livres" icon="📝">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Reflexões, ideias, leituras, observações do dia, pensamentos sobre a vida no pós-doc..."
        className="w-full h-36 px-4 py-3 rounded-xl border-2 border-caatinga-200 focus:border-caatinga-400 focus:outline-none bg-white text-sm font-medium placeholder-caatinga-300 resize-y transition-colors leading-relaxed"
      />
      {value && (
        <div className="mt-2 text-xs text-caatinga-500 font-medium text-right">
          {value.length} caracteres
        </div>
      )}
    </BiomeCard>
  )
}
