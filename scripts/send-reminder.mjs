// Sends the daily 18h (BRT) push reminder — personalized with the user's
// real data (streak at risk, what's missing today, XP to next level).
// Skips sending entirely when the day is already complete: no nagging.
// Runs in GitHub Actions (see .github/workflows/daily-reminder.yml).
// Env: SUPABASE_URL, SUPABASE_KEY, VAPID_PRIVATE_KEY
// Local dry run (no send): node scripts/send-reminder.mjs --dry-run
import { entryText } from '../src/utils/entryText.js'
import { countExercisesDone } from '../src/utils/exercises.js'
import { getLevelInfo } from '../src/utils/level.js'

const DRY_RUN = process.argv.includes('--dry-run')
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_PUBLIC_KEY = 'BPY51v48OOmt2ORzLwa9UaLc_XAsg2qX5v2j38eTjQyMeqYgqaYj2vbnrqjL-OU5AX50Uz89Qx45W5u3gKrVdO4'

if (!SUPABASE_URL || !SUPABASE_KEY || (!VAPID_PRIVATE_KEY && !DRY_RUN)) {
  console.error('Faltam variáveis de ambiente (SUPABASE_URL, SUPABASE_KEY, VAPID_PRIVATE_KEY).')
  process.exit(1)
}

const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }

async function fetchAll(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, { headers })
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`)
  return res.json()
}

// "Today" in Brazil (the Action runs in UTC; 18h BRT = 21h UTC, same date)
function brtISO(offsetDays = 0) {
  const now = new Date(Date.now() - 3 * 3600000 - offsetDays * 86400000)
  return now.toISOString().slice(0, 10)
}

const [entries, workouts] = await Promise.all([fetchAll('entries'), fetchAll('workouts')])

const today = brtISO()
const todayEntry = entries.find(e => e.date === today)
const todayWorkout = workouts.find(w => w.date === today)
const diaryDone = !!todayEntry && entryText(todayEntry).trim().length > 10
const treinoDone = !!todayWorkout && countExercisesDone(todayWorkout) > 0

if (diaryDone && treinoDone) {
  console.log('Dia já completo (diário + treino) — nenhuma notificação enviada. ⭐')
  process.exit(0)
}

// Streak that would be lost today (consecutive entry days ending yesterday)
const entryDates = new Set(entries.map(e => e.date))
let streak = 0
for (let i = 1; entryDates.has(brtISO(i)); i++) streak++

const level = getLevelInfo(entries, workouts)

const missing = !diaryDone && !treinoDone
  ? 'Falta o diário e o treino'
  : !diaryDone
    ? 'Treino feito 💪 Falta só o diário'
    : 'Diário feito ✍️ Falta só o treino'

const parts = [missing + ' para fechar o dia ⭐']
if (streak >= 2) parts.unshift(`🔥 ${streak} dias de sequência em jogo!`)
if (level.next && level.xpToNext <= 200) {
  parts.push(`Faltam só ${level.xpToNext} XP para ${level.next.icon} ${level.next.title}!`)
}

const payload = {
  title: streak >= 2 ? `Daily Shenanigans — sequência de ${streak} dias 🔥` : 'Daily Shenanigans 🦫',
  body: parts.join(' '),
  url: 'https://aikiesan.github.io/DailyShenanigans/#/hoje',
}

console.log('Mensagem:', JSON.stringify(payload, null, 2))
if (DRY_RUN) {
  console.log('(dry-run: nada enviado)')
  process.exit(0)
}

const { default: webpush } = await import('web-push')
webpush.setVapidDetails('mailto:lucasnc@unicamp.br', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const res = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?select=*`, { headers })
const rows = res.ok ? await res.json() : []
console.log(`${rows.length} inscrição(ões).`)

let sent = 0
for (const row of rows) {
  try {
    await webpush.sendNotification(row.subscription, JSON.stringify(payload))
    sent++
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(row.endpoint)}`, {
        method: 'DELETE',
        headers,
      })
      console.log('Inscrição expirada removida.')
    } else {
      console.error('Falha ao enviar:', err.statusCode, err.body || err.message)
    }
  }
}
console.log(`✓ ${sent} notificação(ões) enviada(s).`)
