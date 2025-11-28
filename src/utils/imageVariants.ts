import sharp from "sharp";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const PUBLIC_DIR = path.join(process.cwd(), "public", "visuospatial");

// ensure directory exists
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

export async function ensurePublicDir() {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// rotate image by degrees and save
export async function createRotatedVariant(srcPath: string, degrees = 90) {
  await ensurePublicDir();
  const id = uuidv4();
  const out = `/visuospatial/${id}-rot${degrees}.png`;
  await sharp(path.join(process.cwd(), "public", srcPath))
    .rotate(degrees)
    .toFile(path.join(process.cwd(), "public", out));
  return { path: out, rotationDegrees: degrees };
}

// mirror horizontally
export async function createMirroredVariant(srcPath: string) {
  await ensurePublicDir();
  const id = uuidv4();
  const out = `/visuospatial/${id}-mirror.png`;
  await sharp(path.join(process.cwd(), "public", srcPath))
    .flip() // vertical flip
    .toFile(path.join(process.cwd(), "public", out));
  return { path: out };
}

// simulate object removal by blurring a detection box region (simple)
export async function createRemovedObjectVariant(
  srcPath: string,
  box?: { left: number; top: number; width: number; height: number }
) {
  // if no box provided, choose a center-right area as heuristic
  await ensurePublicDir();
  const id = uuidv4();
  const out = `/visuospatial/${id}-removed.png`;
  const input = path.join(process.cwd(), "public", srcPath);

  const image = sharp(input);
  const meta = await image.metadata();

  const left = box?.left ?? Math.floor((meta.width ?? 800) * 0.6);
  const top = box?.top ?? Math.floor((meta.height ?? 600) * 0.15);
  const width = box?.width ?? Math.floor((meta.width ?? 800) * 0.15);
  const height = box?.height ?? Math.floor((meta.height ?? 600) * 0.15);

  // extract, blur, overlay
  const regionBuffer = await image
    .extract({ left, top, width, height })
    .blur(12)
    .toBuffer();
  await image
    .composite([{ input: regionBuffer, left, top }])
    .toFile(path.join(process.cwd(), "public", out));

  return {
    path: out,
    notes: `removed-region ${left},${top},${width},${height}`,
  };
}
