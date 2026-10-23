// Cleans the source logos into print/web-ready files under public/brand.
// Nura.png has a speckled semi-transparent halo; pixels with alpha < 96 are made fully transparent.
import sharp from "sharp";

async function cleanNura() {
  const { data, info } = await sharp("Nura.png").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 96) data[i + 3] = 0;
    else data[i + 3] = 255;
  }
  await sharp(data, { raw: info }).trim().resize({ width: 600 }).png().toFile("public/brand/nura.png");
}

async function cleanUnity() {
  await sharp("Unity.png").trim({ threshold: 20 }).resize({ height: 400 }).png().toFile("public/brand/unity.png");
  // Square favicon-sized mark for the app shell.
  await sharp("Unity.png").trim({ threshold: 20 }).resize(96, 96, { fit: "contain", background: "#ffffff" }).png().toFile("public/brand/unity-mark.png");
  // Windows app/installer icon (electron-builder builds the .ico from a 512px PNG).
  const mark = await sharp("Unity.png").trim({ threshold: 20 }).resize(400, 400, { fit: "contain", background: "#ffffff" }).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: "#ffffff" } })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toFile("desktop/build/icon.png");
}

await Promise.all([cleanNura(), cleanUnity()]);
console.log("logos written to public/brand/");
