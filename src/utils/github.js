const REPO = 'aikiesan/dailyshenanigans'
const FILE_PATH = 'data/logs.json'
const TOKEN_KEY = 'dailyShenanigans_ghToken'

export function getGhToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function saveGhToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function fetchLogsFromGitHub(token) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
  )
  if (res.status === 404) return { entries: [], sha: null }
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  const data = await res.json()
  const text = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))))
  return { entries: JSON.parse(text), sha: data.sha }
}

export async function pushLogsToGitHub(token, entries, sha) {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(entries, null, 2))))
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `logs: sync ${new Date().toISOString().split('T')[0]}`,
        content,
        ...(sha ? { sha } : {}),
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `GitHub API ${res.status}`)
  }
  const data = await res.json()
  return data.content.sha
}
