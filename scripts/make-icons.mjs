// Generates PNG app icons without any dependencies (raw RGBA -> zlib -> PNG).
// Draws a dark rounded square with a green progress ring, matching public/favicon.svg.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, '..', 'public');
mkdirSync(join(pub, 'icons'), { recursive: true });

const crcTable = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = (buf) => {
  let c = -1;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

function png(size, draw) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x + 0.5, y + 0.5);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const BG = [15, 23, 42], TRACK = [30, 41, 59], RING = [52, 211, 153];
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

function makeIcon(size, { maskable }) {
  const c = size / 2;
  const radius = maskable ? Infinity : size * 0.22;
  const ringR = size * (maskable ? 0.22 : 0.28);
  const ringW = size * (maskable ? 0.085 : 0.11);
  const aa = 1.5;
  return png(size, (x, y) => {
    // rounded-square coverage
    const dx = Math.max(Math.abs(x - c) - (c - radius), 0);
    const dy = Math.max(Math.abs(y - c) - (c - radius), 0);
    const dist = Math.sqrt(dx * dx + dy * dy) - radius;
    const cover = maskable ? 1 : Math.min(1, Math.max(0, 0.5 - dist / aa));
    if (cover <= 0) return [0, 0, 0, 0];
    let col = BG;
    const d = Math.sqrt((x - c) ** 2 + (y - c) ** 2);
    const ringCover = Math.min(1, Math.max(0, 0.5 - (Math.abs(d - ringR) - ringW / 2) / aa));
    if (ringCover > 0) {
      // arc from 12 o'clock clockwise ~ 270 degrees is the "progress"
      let ang = Math.atan2(x - c, -(y - c)); // 0 at top, clockwise
      if (ang < 0) ang += Math.PI * 2;
      const progress = ang <= Math.PI * 1.5;
      col = mix(col, progress ? RING : TRACK, ringCover);
    }
    return [...col, Math.round(cover * 255)];
  });
}

writeFileSync(join(pub, 'icons', 'icon-192.png'), makeIcon(192, { maskable: false }));
writeFileSync(join(pub, 'icons', 'icon-512.png'), makeIcon(512, { maskable: false }));
writeFileSync(join(pub, 'icons', 'icon-512-maskable.png'), makeIcon(512, { maskable: true }));
writeFileSync(join(pub, 'apple-touch-icon.png'), makeIcon(180, { maskable: true }));
console.log('icons written to public/');
