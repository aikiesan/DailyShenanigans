// Ilustrações minimalistas (stick figure) de cada exercício.
// Estilo: traço arredondado, cor herdada via currentColor.
// Para trocar por fotos: coloque JPGs em public/exercises/<id>.jpg
// e substitua este componente por <img>.

const Head = ({ cx, cy }) => <circle cx={cx} cy={cy} r="5.5" fill="currentColor" stroke="none" />

const DRAWINGS = {
  // ── Core & Coluna ──
  dead_bug: (
    <>
      <Head cx={16} cy={55} />
      <path d="M23 57 L58 58" />
      <path d="M30 55 L30 28" />
      <path d="M58 58 L91 42" />
      <path d="M58 58 L70 40 L82 46" />
    </>
  ),
  bird_dog: (
    <>
      <Head cx={29} cy={29} />
      <path d="M38 34 L74 34" />
      <path d="M38 34 L38 62" />
      <path d="M38 34 L10 24" />
      <path d="M74 34 L78 58 L92 60" />
      <path d="M74 34 L108 24" />
    </>
  ),
  glute_bridge: (
    <>
      <Head cx={14} cy={59} />
      <path d="M20 61 L52 44" />
      <path d="M52 44 L68 46 L72 62" />
      <path d="M26 62 L46 62" />
    </>
  ),
  hollow_hold: (
    <>
      <Head cx={27} cy={47} />
      <path d="M34 51 Q54 62 72 55" />
      <path d="M34 51 L12 38" />
      <path d="M72 55 L104 40" />
    </>
  ),
  // ── Membros Superiores ──
  pushup: (
    <>
      <Head cx={18} cy={37} />
      <path d="M26 40 L94 50" />
      <path d="M31 41 L25 54 L36 62" />
      <path d="M94 50 L99 62" />
    </>
  ),
  pike_pushup: (
    <>
      <Head cx={31} cy={55} />
      <path d="M62 20 L37 48" />
      <path d="M37 48 L28 62" />
      <path d="M62 20 L96 62" />
    </>
  ),
  inverted_row: (
    <>
      <path d="M18 14 L74 14" opacity="0.4" />
      <Head cx={38} cy={29} />
      <path d="M46 14 L48 33" />
      <path d="M48 33 L100 60" />
      <path d="M100 60 L104 62" />
    </>
  ),
  pullup: (
    <>
      <path d="M30 10 L90 10" opacity="0.4" />
      <path d="M48 10 L57 27" />
      <path d="M72 10 L63 27" />
      <Head cx={60} cy={21} />
      <path d="M60 28 L60 50" />
      <path d="M60 50 L54 64" />
      <path d="M60 50 L66 64" />
    </>
  ),
  // ── Membros Inferiores ──
  squat: (
    <>
      <Head cx={52} cy={17} />
      <path d="M54 23 L58 40" />
      <path d="M55 28 L80 28" />
      <path d="M58 40 L74 42 L70 62 L80 62" />
    </>
  ),
  sl_rdl: (
    <>
      <Head cx={23} cy={25} />
      <path d="M60 36 L31 28" />
      <path d="M34 30 L30 48" />
      <path d="M60 36 L58 62" />
      <path d="M60 36 L96 27" />
    </>
  ),
  wall_sit: (
    <>
      <path d="M90 8 L90 64" opacity="0.4" />
      <Head cx={85} cy={17} />
      <path d="M85 24 L85 44" />
      <path d="M85 44 L60 44 L60 62" />
      <path d="M85 30 L70 42" />
    </>
  ),
  // ── Cardio ──
  burpee: (
    <>
      <Head cx={16} cy={33} />
      <path d="M24 36 L88 47" />
      <path d="M29 37 L27 62" />
      <path d="M88 47 L95 62" />
      <path d="M85 46 L62 50 L48 62" />
      <path d="M104 30 L104 44" opacity="0.5" strokeDasharray="3 5" />
      <path d="M100 40 L104 45 L108 40" opacity="0.5" strokeWidth="3" />
    </>
  ),
  // ── Alongamentos ──
  hip_flexor: (
    <>
      <Head cx={56} cy={13} />
      <path d="M56 20 L58 42" />
      <path d="M56 26 L64 40" />
      <path d="M58 42 L40 42 L36 62" />
      <path d="M58 42 L76 60 L94 60" />
    </>
  ),
  thoracic_rotation: (
    <>
      <Head cx={36} cy={29} />
      <path d="M44 34 L78 34" />
      <path d="M44 34 L44 62" />
      <path d="M44 34 L54 10" />
      <path d="M78 34 L82 58 L94 60" />
    </>
  ),
  child_pose: (
    <>
      <Head cx={25} cy={55} />
      <path d="M66 45 Q50 46 33 53" />
      <path d="M33 53 L12 60" />
      <path d="M66 45 L70 60 L90 60" />
    </>
  ),
  hip_9090: (
    <>
      <Head cx={58} cy={15} />
      <path d="M58 22 L58 54" />
      <path d="M58 36 L74 54" />
      <path d="M58 54 L36 54 L36 63" />
      <path d="M58 54 L80 55 L87 63" />
    </>
  ),
}

export default function ExerciseIllustration({ id, className = '' }) {
  const drawing = DRAWINGS[id]
  if (!drawing) return null
  return (
    <svg
      viewBox="0 0 120 72"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="66" x2="116" y2="66" opacity="0.18" strokeWidth="3" />
      {drawing}
    </svg>
  )
}
