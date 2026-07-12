// Generates backups/backlog.md from Supabase data (same format as the
// in-app "Backlog MD" button). Runs weekly via GitHub Actions.
// Env: SUPABASE_URL, SUPABASE_KEY
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { buildMarkdownExport } from '../src/utils/exportMarkdown.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltam variáveis de ambiente (SUPABASE_URL, SUPABASE_KEY).')
  process.exit(1)
}

const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }

async function fetchAll(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=date.asc`, { headers })
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`)
  return res.json()
}

const [entries, workouts] = await Promise.all([fetchAll('entries'), fetchAll('workouts')])
console.log(`${entries.length} entradas, ${workouts.length} treinos.`)

const md = buildMarkdownExport(entries, workouts)
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'backups')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'backlog.md'), md, 'utf8')
console.log(`✓ backups/backlog.md gerado (${(md.length / 1024).toFixed(1)} KB).`)
