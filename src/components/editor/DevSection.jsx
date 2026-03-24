import BiomeCard from '../shared/BiomeCard'

export default function DevSection({ value, onChange }) {
  return (
    <BiomeCard biomeKey="atlantica" title="Projetos Dev" icon="💻">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Código escrito, pull requests, bugs resolvidos, ideias técnicas, arquiteturas, ferramentas GIS, scripts de processamento..."
        className="w-full h-36 px-4 py-3 rounded-xl border-2 border-atlantica-200 focus:border-atlantica-400 focus:outline-none bg-white text-sm font-medium placeholder-atlantica-300 resize-y transition-colors leading-relaxed"
      />
      {value && (
        <div className="mt-2 text-xs text-atlantica-500 font-medium text-right">
          {value.length} caracteres · {value.split('\n').length} linhas
        </div>
      )}
    </BiomeCard>
  )
}
