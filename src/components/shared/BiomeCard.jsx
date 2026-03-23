import { BIOMES } from '../../utils/biomeTheme'

export default function BiomeCard({ biomeKey, title, icon, children, className = '' }) {
  const biome = BIOMES[biomeKey]
  if (!biome) return null

  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm border-2 ${biome.colors.border} ${className}`}>
      <div className={`bg-gradient-to-r ${biome.colors.gradient} px-5 py-3 flex items-center gap-2`}>
        <span className="text-xl">{icon || biome.icon}</span>
        <h3 className="text-white font-bold text-base">{title || biome.label}</h3>
        <span className="text-lg ml-auto opacity-80">{biome.animal}</span>
      </div>
      <div className={`${biome.colors.bg} p-5`}>
        {children}
      </div>
    </div>
  )
}
