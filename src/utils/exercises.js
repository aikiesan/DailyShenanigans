// Rotina de calistenia — prioriza estabilização de core/coluna
// (hérnia L5-S1 + trabalho sedentário): nada de carga axial pesada.

export const WORKOUT_CATEGORIES = [
  {
    id: 'core',
    label: 'Core & Coluna',
    icon: '🔵',
    biome: 'atlantica',
    priority: true,
    exercises: [
      { id: 'dead_bug', name: 'Dead Bug', targetSets: 1, targetLabel: '5 reps/lado', tip: 'Lombar sempre colada no chão. Movimento lento e controlado.' },
      { id: 'bird_dog', name: 'Bird Dog', targetSets: 1, targetLabel: '8 reps/lado', tip: 'Quadril nivelado, sem girar o tronco. Estenda braço e perna opostos.' },
      { id: 'glute_bridge', name: 'Ponte de Glúteo', targetSets: 1, targetLabel: '15 reps', tip: 'Suba com o glúteo, não com a lombar. Pausa de 1s no topo.' },
      { id: 'hollow_hold', name: 'Hollow Body Hold', targetSets: 3, targetLabel: '3× 10s', tip: 'Lombar pressionada no chão. Se doer, dobre mais os joelhos.' },
    ],
  },
  {
    id: 'upper',
    label: 'Membros Superiores',
    icon: '🟢',
    biome: 'amazonia',
    exercises: [
      { id: 'pushup', name: 'Flexão de Braço', targetSets: 3, targetLabel: '3× 10', tip: 'Corpo em prancha rígida — core ativado protege a lombar.' },
      { id: 'pike_pushup', name: 'Pike Push-up', targetSets: 3, targetLabel: '3× 6', tip: 'Quadril alto em V invertido, cabeça desce entre as mãos.' },
      { id: 'inverted_row', name: 'Remada Invertida', targetSets: 3, targetLabel: '3× 8', tip: 'Corpo reto, puxe o peito até a barra/mesa.' },
      { id: 'pullup', name: 'Barra Fixa', targetSets: 3, targetLabel: '3× 3–5', tip: 'Desça controlado. Evite balançar o corpo (protege a coluna).' },
    ],
  },
  {
    id: 'lower',
    label: 'Membros Inferiores',
    icon: '🟡',
    biome: 'cerrado',
    exercises: [
      { id: 'squat', name: 'Agachamento Livre', targetSets: 3, targetLabel: '3× 15', tip: 'Peso nos calcanhares, coluna neutra, desça até onde for confortável.' },
      { id: 'sl_rdl', name: 'RDL Unilateral (sem peso)', targetSets: 3, targetLabel: '3× 8/lado', tip: 'Dobradiça de quadril, costas retas — excelente para a cadeia posterior.' },
      { id: 'wall_sit', name: 'Cadeirinha na Parede', targetSets: 3, targetLabel: '3× 20s', tip: 'Lombar totalmente apoiada na parede, joelhos a 90°.' },
    ],
  },
  {
    id: 'cardio',
    label: 'Cardio / Corpo Inteiro',
    icon: '🔴',
    biome: 'caatinga',
    exercises: [
      { id: 'burpee', name: 'Burpee com Passo Atrás', targetSets: 1, targetLabel: 'reps consistentes', tip: '', warning: '⚠️ SEM salto na aterrissagem — passo atrás e passo à frente para proteger a L5-S1.' },
    ],
  },
]

export const STRETCHES = [
  { id: 'hip_flexor', name: 'Flexores do Quadril (Psoas)', targetLabel: '30s/lado' },
  { id: 'thoracic_rotation', name: 'Rotação Torácica', targetLabel: '8 reps/lado' },
  { id: 'child_pose', name: 'Postura da Criança', targetLabel: '45s' },
  { id: 'hip_9090', name: 'Alongamento 90/90 de Quadril', targetLabel: '30s/lado' },
]

export const ALL_EXERCISES = WORKOUT_CATEGORIES.flatMap(c =>
  c.exercises.map(e => ({ ...e, category: c.id }))
)

export const TOTAL_EXERCISES = ALL_EXERCISES.length

export function isExerciseDone(workout, exercise) {
  const state = workout?.exercises?.[exercise.id]
  return !!state && state.sets >= exercise.targetSets
}

export function countExercisesDone(workout) {
  return ALL_EXERCISES.filter(e => isExerciseDone(workout, e)).length
}

export function countStretchesDone(workout) {
  return STRETCHES.filter(s => workout?.stretches?.[s.id]).length
}
