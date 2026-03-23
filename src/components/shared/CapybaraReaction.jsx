const CAPYBARA_STATES = {
  idle: {
    emoji: '🦫',
    expression: '😌',
    text: 'Capivara zen. Tudo tranquilo por aqui...',
    animation: 'capybara-idle',
  },
  happy: {
    emoji: '🦫',
    expression: '🎉',
    text: 'A capivara está MUITO orgulhosa!',
    animation: 'capybara-bounce',
  },
  working: {
    emoji: '🦫',
    expression: '🤓',
    text: 'Capivara de óculos. Modo pesquisador ativado.',
    animation: '',
  },
  sleepy: {
    emoji: '🦫',
    expression: '😴',
    text: 'Cadê as entradas? A capivara tá com saudade...',
    animation: 'capybara-idle',
  },
  excited: {
    emoji: '🦫',
    expression: '🤩',
    text: 'CAPIVARA EM ÊXTASE! Que streak incrível!',
    animation: 'capybara-bounce',
  },
  thinking: {
    emoji: '🦫',
    expression: '🤔',
    text: 'A capivara está processando os dados...',
    animation: 'capybara-idle',
  },
}

export default function CapybaraReaction({ state = 'idle', size = 'md', showText = true }) {
  const capy = CAPYBARA_STATES[state] || CAPYBARA_STATES.idle
  const sizes = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-7xl',
    xl: 'text-8xl',
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${capy.animation} flex items-end gap-1`}>
        <span className={sizes[size]}>{capy.emoji}</span>
        <span className={size === 'sm' ? 'text-lg' : 'text-2xl'}>{capy.expression}</span>
      </div>
      {showText && (
        <p className="text-sm text-gray-500 italic text-center max-w-xs">{capy.text}</p>
      )}
    </div>
  )
}

export { CAPYBARA_STATES }
