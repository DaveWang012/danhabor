import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

const require = createRequire(import.meta.url);
const sharp = require("/Users/davidwang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const width = 1600;
const height = 900;
const buildings = Array.from({ length: 24 }, (_, index) => {
  const x = 90 + index * 60;
  const h = 170 + ((index * 47) % 260);
  const y = 540 - h;
  const windows = Array.from({ length: Math.floor(h / 28) }, (_row, row) =>
    Array.from({ length: 3 }, (_col, col) => {
      const lit = (row + col + index) % 4 === 0;
      return `<rect x="${x + 12 + col * 14}" y="${y + 18 + row * 24}" width="6" height="3" fill="${lit ? "#b8a66f" : "#26333a"}" opacity="${lit ? 0.72 : 0.28}"/>`;
    }).join(""),
  ).join("");
  return `<g opacity="${0.55 + (index % 4) * 0.08}"><rect x="${x}" y="${y}" width="${42 + (index % 3) * 16}" height="${h}" fill="#0b151b"/><rect x="${x + 3}" y="${y + 6}" width="${36 + (index % 3) * 16}" height="${h - 8}" fill="#172732" opacity=".82"/>${windows}</g>`;
}).join("");

const rain = Array.from({ length: 180 }, (_, index) => {
  const x = (index * 73) % width;
  const y = (index * 41) % height;
  return `<line x1="${x}" y1="${y}" x2="${x - 18}" y2="${y + 48}" stroke="#b7c0bd" stroke-width="1" opacity=".12"/>`;
}).join("");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#101b24"/>
      <stop offset=".46" stop-color="#172c38"/>
      <stop offset="1" stop-color="#05090d"/>
    </linearGradient>
    <radialGradient id="mist" cx="52%" cy="34%" r="48%">
      <stop offset="0" stop-color="#607077" stop-opacity=".24"/>
      <stop offset=".52" stop-color="#233641" stop-opacity=".15"/>
      <stop offset="1" stop-color="#05080b" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft">
      <feGaussianBlur stdDeviation="4"/>
    </filter>
  </defs>
  <rect width="1600" height="900" fill="url(#sky)"/>
  <rect width="1600" height="900" fill="url(#mist)"/>
  <path d="M0 548 C240 510 395 555 620 524 C845 493 1040 545 1600 514 L1600 900 L0 900 Z" fill="#071016"/>
  <g>${buildings}</g>
  <g opacity=".5">${rain}</g>
  <g transform="translate(490 572)" opacity=".92">
    <path d="M88 0 C120 6 135 45 132 88 L126 240 L28 240 L22 88 C20 45 44 7 88 0Z" fill="#050709"/>
    <circle cx="83" cy="17" r="25" fill="#070a0d"/>
    <path d="M54 97 L108 97 L118 236 L38 236 Z" fill="#111a20" opacity=".76"/>
    <text x="52" y="149" fill="#c4b9a6" opacity=".12" font-family="Arial" font-size="22">POLICE</text>
  </g>
  <g transform="translate(710 586)" opacity=".9">
    <path d="M72 0 C108 9 125 43 122 88 L116 230 L22 230 L18 88 C16 43 36 8 72 0Z" fill="#050709"/>
    <circle cx="67" cy="16" r="24" fill="#06090c"/>
    <path d="M38 95 L98 95 L108 226 L31 226 Z" fill="#111920" opacity=".72"/>
    <text x="40" y="145" fill="#c4b9a6" opacity=".12" font-family="Arial" font-size="20">POLICE</text>
  </g>
  <g transform="translate(1150 620)">
    <path d="M0 45 L35 8 L160 15 L205 58 L190 82 L24 82 Z" fill="#080c0e"/>
    <path d="M48 18 L138 23 L168 50 L28 44 Z" fill="#20323b" opacity=".46"/>
    <rect x="117" y="2" width="56" height="8" fill="#8e2822"/>
    <rect x="86" y="2" width="38" height="8" fill="#2d557a"/>
    <circle cx="42" cy="82" r="17" fill="#020303"/>
    <circle cx="162" cy="82" r="17" fill="#020303"/>
  </g>
  <g transform="translate(603 118)" opacity=".62">
    <ellipse cx="58" cy="22" rx="45" ry="13" fill="#05090b"/>
    <rect x="-18" y="11" width="154" height="3" fill="#05090b"/>
    <rect x="103" y="22" width="42" height="3" fill="#05090b"/>
  </g>
  <g opacity=".24" filter="url(#soft)">
    <path d="M0 700 C210 674 335 722 536 696 C750 668 915 718 1600 688 L1600 900 L0 900 Z" fill="#263f4a"/>
  </g>
  <g opacity=".2">
    ${Array.from({ length: 35 }, (_, i) => `<rect x="${(i * 61) % 1600}" y="${690 + (i % 9) * 20}" width="${80 + (i % 4) * 45}" height="2" fill="#b5a78c"/>`).join("")}
  </g>
  <rect width="1600" height="900" fill="none" stroke="#0a0e10" stroke-width="36" opacity=".55"/>
</svg>`;

await mkdir("public/assets", { recursive: true });
await sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toFile("public/assets/danhabor-001-cover.jpg");
