// import { NextRequest, NextResponse } from "next/server";
// import sharp from "sharp";
// import twemoji from "twemoji";
// import path from "path";

// const WIDTH = 1080;
// const HEIGHT = 1350;

// /** * FIX 1: Use a reliable path and register font with Sharp 
//  * Make sure your file is at: /public/fonts/DMSans-Bold.ttf
//  */
// const fontPath = path.join(process.cwd(), "public", "fonts", "DMSans-Bold.ttf");

// async function emojiToBuffer(emoji: string, size: number): Promise<Buffer | null> {
//   try {
//     const codePoint = twemoji.convert.toCodePoint(
//       emoji.indexOf("\u200D") >= 0 ? emoji : emoji.replace(/\uFE0F/g, "")
//     );
//     const svgUrl = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${codePoint}.svg`;
//     const res = await fetch(svgUrl);
//     if (!res.ok) return null;
//     const svgText = await res.text();
//     const sizedSvg = svgText.replace("<svg ", `<svg width="${size}" height="${size}" `);
//     return await sharp(Buffer.from(sizedSvg)).png().toBuffer();
//   } catch (err) { return null; }
// }

// function getEmojiData(text: string) {
//   const emojiRegex = /\p{Emoji_Presentation}/gu;
//   return text.match(emojiRegex) || [];
// }

// function wrapText(text: string, maxChars: number): string[] {
//   const words = text.split(" ");
//   const lines: string[] = [];
//   let currentLine = "";
//   words.forEach(word => {
//     if ((currentLine + word).length > maxChars) {
//       lines.push(currentLine.trim());
//       currentLine = word + " ";
//     } else {
//       currentLine += word + " ";
//     }
//   });
//   lines.push(currentLine.trim());
//   return lines;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { hook, caption, image_url, channel_name = "NaatuNadapu" } = await req.json();

//     const bgRes = await fetch(image_url);
//     const bgBuffer = Buffer.from(await bgRes.arrayBuffer());

//     const baseSize = 75; 
//     const hookSize = baseSize;         
//     const captionSize = baseSize * 0.65; 
//     const footerSize = 32; 

//     const platformBlue = "#0070f3"; 
//     const purpleTheme = "#8E24AA";
//     const blockTop = HEIGHT * 0.6;
    
//     // FIX 2: Better divider spacing
//     const dividerY = HEIGHT * 0.74; 

//     const hookLines = wrapText(hook.replace(/\p{Emoji_Presentation}/gu, "").toUpperCase(), 15);
//     const captionLines = wrapText(caption.replace(/\p{Emoji_Presentation}/gu, ""), 38);
    
//     const hEmojiBufs = await Promise.all(getEmojiData(hook).map(e => emojiToBuffer(e, hookSize)));
//     const cEmojiBufs = await Promise.all(getEmojiData(caption).map(e => emojiToBuffer(e, captionSize)));
//     const micBuf = await emojiToBuffer("🎙️", 75);

//     const followText = `Follow ${channel_name}`;
//     const badgeWidth = followText.length * 18 + 50; 

//     /**
//      * FIX 3: Remove the 'file://' prefix in some environments it causes issues.
//      * Also ensured font-family matches the internal metadata of DM Sans.
//      */
//     const svgOverlay = `
//     <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
//       <defs>
//         <style>
//           @font-face {
//             font-family: 'DM Sans';
//             src: url('${fontPath}');
//           }
//           .hook { font-family: 'DM Sans', sans-serif; font-weight: 800; fill: ${purpleTheme}; }
//           .caption { font-family: 'DM Sans', sans-serif; font-weight: 600; fill: white; }
//           .footer { font-family: 'DM Sans', sans-serif; font-weight: 700; fill: white; }
//         </style>
//       </defs>
      
//       <rect x="0" y="${blockTop}" width="${WIDTH}" height="${HEIGHT - blockTop}" fill="black"/>
      
//       ${hookLines.map((line, i) => `
//         <text x="${WIDTH / 2}" y="${HEIGHT * 0.675 + (i * hookSize * 1.1)}" text-anchor="middle" class="hook" font-size="${hookSize}">
//           ${line}
//         </text>
//       `).join("")}

//       <line x1="250" y1="${dividerY}" x2="${WIDTH - 250}" y2="${dividerY}" stroke="white" stroke-width="1.2" opacity="0.3"/>

//       ${captionLines.map((line, i) => `
//         <text x="${WIDTH / 2}" y="${dividerY + 85 + (i * captionSize * 1.3)}" text-anchor="middle" class="caption" font-size="${captionSize}">
//           ${line}
//         </text>
//       `).join("")}

//       <rect x="${(WIDTH - badgeWidth) / 2}" y="${HEIGHT - 105}" width="${badgeWidth}" height="${60}" rx="30" fill="${platformBlue}" />
//       <text x="${WIDTH / 2}" y="${HEIGHT - 65}" text-anchor="middle" class="footer" font-size="${footerSize}">
//         ${followText}
//       </text>
//     </svg>`;

//     const composites: sharp.OverlayOptions[] = [{ input: Buffer.from(svgOverlay), top: 0, left: 0 }];

//     // Emoji positioning logic
//     const hookLineY = HEIGHT * 0.675 + ((hookLines.length - 1) * hookSize * 1.1);
//     const hookWidth = hookLines[hookLines.length - 1].length * (hookSize * 0.58);
//     hEmojiBufs.forEach((buf, i) => {
//       if (buf) composites.push({
//         input: buf,
//         top: Math.round(hookLineY - (hookSize * 0.9)),
//         left: Math.round((WIDTH / 2) + (hookWidth / 2) + 20 + (i * (hookSize + 5)))
//       });
//     });

//     const capLineY = dividerY + 85 + ((captionLines.length - 1) * captionSize * 1.3);
//     const capWidth = captionLines[captionLines.length - 1].length * (captionSize * 0.52);
//     cEmojiBufs.forEach((buf, i) => {
//       if (buf) composites.push({
//         input: buf,
//         top: Math.round(capLineY - (captionSize * 0.9)),
//         left: Math.round((WIDTH / 2) + (capWidth / 2) + 20 + (i * (captionSize + 5)))
//       });
//     });

//     if (micBuf) {
//       composites.push(
//         { input: micBuf, top: HEIGHT - 115, left: 80 },
//         { input: micBuf, top: HEIGHT - 115, left: WIDTH - 155 }
//       );
//     }

//     const finalImage = await sharp(bgBuffer)
//       .resize(WIDTH, Math.round(HEIGHT * 0.6), { fit: "cover" })
//       .extend({ bottom: Math.round(HEIGHT * 0.4), background: "black" })
//       .composite(composites)
//       .png()
//       .toBuffer();

//     return new NextResponse(finalImage, { headers: { "Content-Type": "image/png" } });

//   } catch (error) {
//     console.error("Image generation failed:", error);
//     return NextResponse.json({ error: "Failed" }, { status: 500 });
//   }
// }



import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import twemoji from "twemoji";
import path from "path";
import fs from "fs";

const WIDTH = 1080;
const HEIGHT = 1350;

// ✅ FIX 1: Read font as base64 for Vercel compatibility
// Vercel serves static files from /public, but serverless functions
// need to read files using fs with an absolute path anchored to the
// project root via process.cwd(). We embed it as base64 in the SVG
// so the font works in Vercel's sandboxed environment.
function getFontBase64(): string | null {
  try {
    const fontPath = path.join(process.cwd(), "public", "fonts", "DMSans-Bold.ttf");
    const fontBuffer = fs.readFileSync(fontPath);
    return fontBuffer.toString("base64");
  } catch (err) {
    console.error("Font load failed:", err);
    return null;
  }
}

async function emojiToBuffer(emoji: string, size: number): Promise<Buffer | null> {
  try {
    const codePoint = twemoji.convert.toCodePoint(
      emoji.indexOf("\u200D") >= 0 ? emoji : emoji.replace(/\uFE0F/g, "")
    );
    const svgUrl = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${codePoint}.svg`;
    const res = await fetch(svgUrl);
    if (!res.ok) return null;
    const svgText = await res.text();
    const sizedSvg = svgText.replace("<svg ", `<svg width="${size}" height="${size}" `);
    return await sharp(Buffer.from(sizedSvg)).png().toBuffer();
  } catch (err) {
    return null;
  }
}

function getEmojiData(text: string) {
  const emojiRegex = /\p{Emoji_Presentation}/gu;
  return text.match(emojiRegex) || [];
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + word).length > maxChars) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  });
  lines.push(currentLine.trim());
  return lines.filter((l) => l.length > 0);
}

export async function POST(req: NextRequest) {
  try {
    const { hook, caption, image_url, channel_name = "NaatuNadapu" } = await req.json();

    const bgRes = await fetch(image_url);
    const bgBuffer = Buffer.from(await bgRes.arrayBuffer());

    // ✅ FIX 2: Reduced font sizes to prevent overflow
    const baseSize = 58;            // was 75 — reduced ~23%
    const hookSize = baseSize;
    const captionSize = baseSize * 0.60; // ~35px — slightly tighter ratio
    const footerSize = 30;

    const purpleTheme = "#8E24AA";
    const platformBlue = "#0070f3";
    const blockTop = HEIGHT * 0.6;

    // ✅ FIX 3: Recalculated divider so caption fits above the badge
    const dividerY = HEIGHT * 0.73;

    // Wrap text (strip emojis first for accurate char count)
    const hookLines = wrapText(hook.replace(/\p{Emoji_Presentation}/gu, "").toUpperCase(), 18);
    const captionLines = wrapText(caption.replace(/\p{Emoji_Presentation}/gu, ""), 42);

    const hookEmojis = getEmojiData(hook);
    const captionEmojis = getEmojiData(caption);

    const hEmojiBufs = await Promise.all(hookEmojis.map((e) => emojiToBuffer(e, hookSize)));
    const cEmojiBufs = await Promise.all(captionEmojis.map((e) => emojiToBuffer(e, captionSize)));
    const micBuf = await emojiToBuffer("🎙️", 65);

    const followText = `Follow ${channel_name}`;
    const badgeWidth = followText.length * 17 + 50;

    // ✅ FIX 1 (continued): Embed font as base64 data URI in SVG
    const fontBase64 = getFontBase64();
    const fontFaceRule = fontBase64
      ? `@font-face {
            font-family: 'DMSans';
            src: url('data:font/truetype;base64,${fontBase64}') format('truetype');
          }`
      : `@font-face {
            font-family: 'DMSans';
            src: local('Arial Black'), local('Impact');
          }`;

    const svgOverlay = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          ${fontFaceRule}
          .hook    { font-family: 'DMSans', 'Arial Black', sans-serif; font-weight: 800; fill: ${purpleTheme}; }
          .caption { font-family: 'DMSans', 'Arial Black', sans-serif; font-weight: 600; fill: white; }
          .footer  { font-family: 'DMSans', 'Arial Black', sans-serif; font-weight: 700; fill: white; }
        </style>
      </defs>

      <!-- Dark block -->
      <rect x="0" y="${blockTop}" width="${WIDTH}" height="${HEIGHT - blockTop}" fill="black"/>

      <!-- Hook lines -->
      ${hookLines
        .map(
          (line, i) => `
        <text
          x="${WIDTH / 2}"
          y="${HEIGHT * 0.665 + i * hookSize * 1.15}"
          text-anchor="middle"
          class="hook"
          font-size="${hookSize}"
        >${line}</text>`
        )
        .join("")}

      <!-- Divider -->
      <line
        x1="200" y1="${dividerY}"
        x2="${WIDTH - 200}" y2="${dividerY}"
        stroke="white" stroke-width="1.5" opacity="0.25"
      />

      <!-- Caption lines -->
      ${captionLines
        .map(
          (line, i) => `
        <text
          x="${WIDTH / 2}"
          y="${dividerY + 60 + i * captionSize * 1.35}"
          text-anchor="middle"
          class="caption"
          font-size="${captionSize}"
        >${line}</text>`
        )
        .join("")}

      <!-- Follow badge -->
      <rect
        x="${(WIDTH - badgeWidth) / 2}"
        y="${HEIGHT - 100}"
        width="${badgeWidth}"
        height="58"
        rx="29"
        fill="${platformBlue}"
      />
      <text
        x="${WIDTH / 2}"
        y="${HEIGHT - 62}"
        text-anchor="middle"
        class="footer"
        font-size="${footerSize}"
      >${followText}</text>
    </svg>`;

    const composites: sharp.OverlayOptions[] = [
      { input: Buffer.from(svgOverlay), top: 0, left: 0 },
    ];

    // Hook emojis — attach to end of last hook line
    const hookLineY = HEIGHT * 0.665 + (hookLines.length - 1) * hookSize * 1.15;
    const hookWidth = hookLines[hookLines.length - 1].length * (hookSize * 0.56);
    hEmojiBufs.forEach((buf, i) => {
      if (buf)
        composites.push({
          input: buf,
          top: Math.round(hookLineY - hookSize * 0.88),
          left: Math.round(WIDTH / 2 + hookWidth / 2 + 12 + i * (hookSize + 5)),
        });
    });

    // Caption emojis — attach to end of last caption line
    const capLineY = dividerY + 60 + (captionLines.length - 1) * captionSize * 1.35;
    const capWidth = captionLines[captionLines.length - 1].length * (captionSize * 0.5);
    cEmojiBufs.forEach((buf, i) => {
      if (buf)
        composites.push({
          input: buf,
          top: Math.round(capLineY - captionSize * 0.88),
          left: Math.round(WIDTH / 2 + capWidth / 2 + 12 + i * (captionSize + 5)),
        });
    });

    // Mic icons on either side of badge
    if (micBuf) {
      composites.push(
        { input: micBuf, top: HEIGHT - 110, left: 85 },
        { input: micBuf, top: HEIGHT - 110, left: WIDTH - 150 }
      );
    }

    const finalImage = await sharp(bgBuffer)
      .resize(WIDTH, Math.round(HEIGHT * 0.6), { fit: "cover" })
      .extend({ bottom: Math.round(HEIGHT * 0.4), background: "black" })
      .composite(composites)
      .png()
      .toBuffer();

    return new NextResponse(finalImage, {
      headers: { "Content-Type": "image/png" },
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}