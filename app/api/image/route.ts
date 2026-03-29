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
import fs from "fs";
import path from "path";

const WIDTH = 1080;
const HEIGHT = 1350;

let cachedTamilFontB64: string | null = null;
let cachedLatinFontB64: string | null = null;

function getFonts(): { tamil: string; latin: string } {
  if (!cachedTamilFontB64) {
    cachedTamilFontB64 = fs
      .readFileSync(
        path.join(
          process.cwd(),
          "node_modules/@fontsource/noto-sans-tamil/files/noto-sans-tamil-tamil-700-normal.woff2"
        )
      )
      .toString("base64");
  }
  if (!cachedLatinFontB64) {
    cachedLatinFontB64 = fs
      .readFileSync(
        path.join(
          process.cwd(),
          "node_modules/@fontsource/noto-sans-tamil/files/noto-sans-tamil-latin-700-normal.woff2"
        )
      )
      .toString("base64");
  }
  return { tamil: cachedTamilFontB64, latin: cachedLatinFontB64 };
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
  } catch {
    return null;
  }
}

function getEmojiData(text: string): string[] {
  return text.match(/\p{Emoji_Presentation}/gu) || [];
}

function stripEmojis(text: string): string {
  return text.replace(/\p{Emoji_Presentation}/gu, "").trim();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + word).length > maxChars) {
      if (current.trim()) lines.push(current.trim());
      current = word + " ";
    } else {
      current += word + " ";
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

export async function POST(req: NextRequest) {
  try {
    const { hook, caption, image_url, channel_name = "NaatuNadapu" } = await req.json();

    const bgRes = await fetch(image_url);
    if (!bgRes.ok) throw new Error("Failed to fetch background image");
    const bgBuffer = Buffer.from(await bgRes.arrayBuffer());

    const { tamil: tamilB64, latin: latinB64 } = getFonts();

    const hookSize     = 56;
    const captionSize  = 34;
    const footerSize   = 30;
    const purpleTheme  = "#8E24AA";
    const platformBlue = "#0070f3";

    const blockTop      = Math.round(HEIGHT * 0.60);
    const dividerY      = Math.round(HEIGHT * 0.725);
    const hookStartY    = Math.round(HEIGHT * 0.665);
    const captionStartY = dividerY + 62;

    const hasTamil        = /[\u0B80-\u0BFF]/.test(hook + caption);
    const hookMaxChars    = hasTamil ? 13 : 18;
    const captionMaxChars = hasTamil ? 30 : 42;

    const hookLines    = wrapText(stripEmojis(hook).toUpperCase(), hookMaxChars);
    const captionLines = wrapText(stripEmojis(caption), captionMaxChars);

    const [hEmojiBufs, cEmojiBufs, micBuf] = await Promise.all([
      Promise.all(getEmojiData(hook).map((e) => emojiToBuffer(e, hookSize))),
      Promise.all(getEmojiData(caption).map((e) => emojiToBuffer(e, captionSize))),
      emojiToBuffer("🎙️", 65),
    ]);

    const followText = `Follow ${channel_name}`;
    const badgeWidth = Math.min(followText.length * 18 + 60, 700);

    // Two @font-face blocks: Tamil script + Latin script
    // librsvg picks the right one glyph-by-glyph automatically
    const svgOverlay = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'AppFont';
        src: url('data:font/woff2;base64,${tamilB64}') format('woff2');
        unicode-range: U+0B80-0BFF;
      }
      @font-face {
        font-family: 'AppFont';
        src: url('data:font/woff2;base64,${latinB64}') format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
      .hook    { font-family: 'AppFont', sans-serif; font-weight: bold; fill: ${purpleTheme}; }
      .caption { font-family: 'AppFont', sans-serif; font-weight: bold; fill: white; }
      .footer  { font-family: 'AppFont', sans-serif; font-weight: bold; fill: white; }
    </style>
  </defs>

  <rect x="0" y="${blockTop}" width="${WIDTH}" height="${HEIGHT - blockTop}" fill="black"/>

  ${hookLines.map((line, i) => `
  <text
    x="${WIDTH / 2}"
    y="${hookStartY + i * Math.round(hookSize * 1.2)}"
    text-anchor="middle" class="hook" font-size="${hookSize}"
  >${escapeXml(line)}</text>`).join("")}

  <line x1="180" y1="${dividerY}" x2="${WIDTH - 180}" y2="${dividerY}"
        stroke="white" stroke-width="1.5" opacity="0.3"/>

  ${captionLines.map((line, i) => `
  <text
    x="${WIDTH / 2}"
    y="${captionStartY + i * Math.round(captionSize * 1.4)}"
    text-anchor="middle" class="caption" font-size="${captionSize}"
  >${escapeXml(line)}</text>`).join("")}

  <rect x="${(WIDTH - badgeWidth) / 2}" y="${HEIGHT - 100}"
        width="${badgeWidth}" height="58" rx="29" fill="${platformBlue}"/>
  <text x="${WIDTH / 2}" y="${HEIGHT - 61}"
        text-anchor="middle" class="footer" font-size="${footerSize}"
  >${escapeXml(followText)}</text>
</svg>`;

    const composites: sharp.OverlayOptions[] = [
      { input: Buffer.from(svgOverlay), top: 0, left: 0 },
    ];

    const lastHookY = hookStartY + (hookLines.length - 1) * Math.round(hookSize * 1.2);
    const lastHookW = hookLines[hookLines.length - 1].length * (hookSize * 0.55);
    hEmojiBufs.forEach((buf, i) => {
      if (buf) composites.push({
        input: buf,
        top: Math.round(lastHookY - hookSize * 0.88),
        left: Math.round(WIDTH / 2 + lastHookW / 2 + 10 + i * (hookSize + 5)),
      });
    });

    const lastCapY = captionStartY + (captionLines.length - 1) * Math.round(captionSize * 1.4);
    const lastCapW = captionLines[captionLines.length - 1].length * (captionSize * 0.5);
    cEmojiBufs.forEach((buf, i) => {
      if (buf) composites.push({
        input: buf,
        top: Math.round(lastCapY - captionSize * 0.88),
        left: Math.round(WIDTH / 2 + lastCapW / 2 + 10 + i * (captionSize + 5)),
      });
    });

    if (micBuf) {
      composites.push(
        { input: micBuf, top: HEIGHT - 110, left: 80 },
        { input: micBuf, top: HEIGHT - 110, left: WIDTH - 145 }
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
    return NextResponse.json(
      { error: "Failed to generate image", detail: String(error) },
      { status: 500 }
    );
  }
}