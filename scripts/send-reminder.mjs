// Sends the daily 18h (BRT) push reminder to every registered device.
// Runs in GitHub Actions (see .github/workflows/daily-reminder.yml).
// Env: SUPABASE_URL, SUPABASE_KEY, VAPID_PRIVATE_KEY
import webpush from 'web-push'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_PUBLIC_KEY = 'BPY51v48OOmt2ORzLwa9UaLc_XAsg2qX5v2j38eTjQyMeqYgqaYj2vbnrqjL-OU5AX50Uz89Qx45W5u3gKrVdO4'

if (!SUPABASE_URL || !SUPABASE_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Faltam variáveis de ambiente (SUPABASE_URL, SUPABASE_KEY, VAPID_PRIVATE_KEY).')
  process.exit(1)
}

webpush.setVapidDetails('mailto:lucasnc@unicamp.br', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }

const res = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?select=*`, { headers })
if (!res.ok) {
  console.error('Erro ao buscar inscrições:', res.status, await res.text())
  process.exit(1)
}
const rows = await res.json()
console.log(`${rows.length} inscrição(ões) encontrada(s).`)

const MESSAGES = [
  'Como foi o dia? Despeje tudo no diário e marque o treino 📖💪',
  'A capivara está esperando o registro de hoje 🦫',
  'Diário + treino = dia completo. Feche o dia com ⭐',
  '2 minutos agora, memória para sempre. Registre seu dia! ✍️',
  'O memorial do pós-doc se escreve um dia de cada vez 🎓',
]
const body = MESSAGES[new Date().getDate() % MESSAGES.length]

let sent = 0
for (const row of rows) {
  try {
    await webpush.sendNotification(
      row.subscription,
      JSON.stringify({
        title: 'Daily Shenanigans 🦫',
        body,
        url: 'https://aikiesan.github.io/DailyShenanigans/',
      })
    )
    sent++
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      // Subscription expired — clean it up
      await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(row.endpoint)}`, {
        method: 'DELETE',
        headers,
      })
      console.log('Inscrição expirada removida:', row.endpoint.slice(0, 60))
    } else {
      console.error('Falha ao enviar:', err.statusCode, err.body || err.message)
    }
  }
}
console.log(`✓ ${sent} notificação(ões) enviada(s).`)
