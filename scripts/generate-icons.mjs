// Generates PWA icons (green gradient + white leaf) as PNGs, no deps.
// Run: node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

// ── PNG encoding ──────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ── Artwork ───────────────────────────────────────────
const TOP = [0x66, 0xbb, 0x6a]      // amazonia-400
const BOTTOM = [0x1b, 0x50, 0x20]   // deep green
const VEIN = [0x2e, 0x7d, 0x32]     // amazonia-500

// Leaf geometry (vesica piscis rotated 45°), unit coords centered at (0.5, 0.52)
const COS = Math.cos(Math.PI / 4), SIN = Math.sin(Math.PI / 4)
const L = 0.62, W = 0.34
const rMinusC = W / 2
const rPlusC = (L / 2) ** 2 / rMinusC
const R = (rMinusC + rPlusC) / 2
const C = rPlusC - R

// Returns [r,g,b,a] for a point (u,v) in [0,1]²
function sample(u, v, { rounded, scale }) {
  // rounded-corner alpha mask
  if (rounded) {
    const rad = 0.21
    const cx = Math.max(rad - u, u - (1 - rad), 0)
    const cy = Math.max(rad - v, v - (1 - rad), 0)
    if (cx * cx + cy * cy > rad * rad) return [0, 0, 0, 0]
  }
  // background gradient (diagonal)
  const t = Math.min(1, Math.max(0, (u + v) / 2))
  let col = [
    TOP[0] + (BOTTOM[0] - TOP[0]) * t,
    TOP[1] + (BOTTOM[1] - TOP[1]) * t,
    TOP[2] + (BOTTOM[2] - TOP[2]) * t,
  ]
  // leaf frame
  const px = (u - 0.5) / scale
  const py = (v - 0.52) / scale
  const x = px * COS + py * SIN
  const y = -px * SIN + py * COS
  const inLeaf =
    Math.hypot(x - C, y) < R && Math.hypot(x + C, y) < R
  const inStem = Math.abs(x) < 0.02 && y > L / 2 - 0.02 && y < L / 2 + 0.15
  const inVein = inLeaf && Math.abs(x) < 0.013 && Math.abs(y) < (L / 2) * 0.8
  if (inVein) col = [...VEIN]
  else if (inLeaf || inStem) col = [255, 255, 255]
  return [col[0], col[1], col[2], 255]
}

function render(size, opts) {
  const rgba = Buffer.alloc(size * size * 4)
  const SS = 3 // supersampling
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [pr, pg, pb, pa] = sample((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size, opts)
          r += pr; g += pg; b += pb; a += pa
        }
      }
      const n = SS * SS
      const i = (y * size + x) * 4
      rgba[i] = Math.round(r / n)
      rgba[i + 1] = Math.round(g / n)
      rgba[i + 2] = Math.round(b / n)
      rgba[i + 3] = Math.round(a / n)
    }
  }
  return encodePNG(size, size, rgba)
}

const jobs = [
  ['icon-192.png', 192, { rounded: true, scale: 1 }],
  ['icon-512.png', 512, { rounded: true, scale: 1 }],
  ['icon-maskable-512.png', 512, { rounded: false, scale: 0.72 }],
  ['apple-touch-icon.png', 180, { rounded: false, scale: 0.9 }],
]

for (const [name, size, opts] of jobs) {
  writeFileSync(join(outDir, name), render(size, opts))
  console.log(`✓ ${name} (${size}x${size})`)
}
