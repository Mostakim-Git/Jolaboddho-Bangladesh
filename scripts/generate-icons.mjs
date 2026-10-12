import sharp from "sharp";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
const svg = "public/logo.svg";
await copyFile(svg, "public/favicon.svg");
for (const size of [192, 512])
  await sharp(svg).resize(size, size).png().toFile(`public/icon-${size}.png`);
for (const [density, size] of Object.entries({
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
})) {
  const dir = `android/app/src/main/res/mipmap-${density}`;
  await mkdir(dir, { recursive: true });
  for (const name of ["ic_launcher", "ic_launcher_round"])
    await sharp(svg).resize(size, size).png().toFile(`${dir}/${name}.png`);
  // Adaptive icons reserve their outer 1/6 for launcher masking.
  const edge = Math.round(size * 2.25),
    inner = Math.round(edge * 0.62);
  const mark = await sharp(svg).resize(inner, inner).png().toBuffer();
  await sharp({
    create: { width: edge, height: edge, channels: 4, background: "#ffffff" },
  })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toFile(`${dir}/ic_launcher_foreground.png`);
}
await writeFile(
  "android/app/src/main/res/values/ic_launcher_background.xml",
  '<?xml version="1.0" encoding="utf-8"?><resources><color name="ic_launcher_background">#FFFFFF</color></resources>\n',
);
console.log("Generated web and Android icons from the user-provided SVG.");
