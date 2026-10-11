#!/usr/bin/env node
/**
 * Genera los activos listados en docs/image-generation-prompts.md con la
 * API de imágenes de OpenAI. Requiere OPENAI_API_KEY en el entorno (.env,
 * no committeado). Uso: node scripts/generate-images.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Falta OPENAI_API_KEY en el entorno.");
  process.exit(1);
}

const jobs = [
  {
    name: "problem-entrepreneur",
    outDir: "public/images/site",
    size: "1536x1024",
    prompt:
      "Photorealistic photo of a Mexican small-business owner, around 35 years old, light brown skin, sitting at the counter of his small corner shop, with an old laptop open and a messy pile of sales tickets/receipts next to a notebook. Pensive, worried but not desperate expression — wondering how his business is really doing. Warm natural window light, documentary/editorial photography style, no artificial studio lighting. Horizontal 4:3 composition, subject slightly left of frame leaving negative space on the right. Warm color palette with a subtle blue glow from the laptop screen. No text, no logos, no watermarks, no visible third-party brands on products or packaging. Not a corporate executive in a suit — a real small business owner in casual work clothes. Professional photographic quality, high resolution, no anatomical distortions.",
  },
  {
    name: "og-cover",
    outDir: "public/images/site",
    size: "1536x1024",
    prompt:
      "Social media cover image background, horizontal, deep navy blue gradient (#091326 to #0a1931) with a subtle faceted crystal/diamond geometric accent in electric blue (#00D2FF) in one corner, not centered. Clean, premium, modern SaaS composition — no generic business icons, no fake dashboard charts. Leave the center and upper-left area with clean negative space (logo and text will be overlaid separately, do not include them). No text, no logos, no watermarks, no people, no fake product screenshots. Style: soft gradient, low-poly geometry with light glints, professional and minimalist.",
  },
];

async function generate(job) {
  console.log(`Generando ${job.name}...`);
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: job.prompt,
      size: job.size,
      n: 1,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${job.name}: ${res.status} ${text}`);
  }

  const data = await res.json();
  const b64 = data.data[0].b64_json;
  const buffer = Buffer.from(b64, "base64");

  await mkdir(job.outDir, { recursive: true });
  const outPath = path.join(job.outDir, `${job.name}.png`);
  await writeFile(outPath, buffer);
  console.log(`  -> ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

for (const job of jobs) {
  await generate(job);
}

console.log("Listo.");
