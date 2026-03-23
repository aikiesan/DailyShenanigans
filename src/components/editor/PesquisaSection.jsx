import BiomeCard from '../shared/BiomeCard'

export default function PesquisaSection({ value, onChange }) {
  return (
    <BiomeCard biomeKey="amazonia" title="Pesquisa & Academia" icon="🔬">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Artigos lidos, orientações, CP2B Maps, eventos, registros INPI, reuniões com o NIPE, análises geoespaciais, processamento de imagens de satélite..."
        className="w-full h-36 px-4 py-3 rounded-xl border-2 border-amazonia-200 focus:border-amazonia-400 focus:outline-none bg-white text-sm font-medium placeholder-amazonia-300 resize-y transition-colors leading-relaxed"
      />
      {value && (
        <div className="mt-2 text-xs text-amazonia-500 font-medium text-right">
          {value.length} caracteres · ~{Math.ceil(value.split(/\s+/).length / 250)} min de leitura
        </div>
      )}
    </BiomeCard>
  )
}
