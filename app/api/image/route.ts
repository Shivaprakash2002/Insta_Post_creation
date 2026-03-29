// import { NextRequest, NextResponse } from "next/server";
// import sharp from "sharp";
// import twemoji from "twemoji";
// import path from "path";

// const WIDTH = 1080;
// const HEIGHT = 1350;


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
//   .hook { 
//     font-family: 'Arial Black', 'Segoe UI', 'Helvetica Neue', sans-serif;
//     font-weight: 900; 
//     fill: ${purpleTheme}; 
//   }

//   .caption { 
//     font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
//     font-weight: 600; 
//     fill: white; 
//   }

//   .footer { 
//     font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
//     font-weight: 700; 
//     fill: white; 
//   }
// </style>
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

const WIDTH = 1080;
const HEIGHT = 1350;

// 🔥 Emoji → image buffer
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

// 🔥 Extract emojis
function getEmojiData(text: string) {
  const emojiRegex = /\p{Emoji_Presentation}/gu;
  return text.match(emojiRegex) || [];
}

// 🔥 Wrap text
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + word).length > maxChars) {
      lines.push(current.trim());
      current = word + " ";
    } else {
      current += word + " ";
    }
  }

  if (current) lines.push(current.trim());
  return lines;
}

export async function POST(req: NextRequest) {
  try {
    const { hook, caption, image_url, channel_name = "NaatuNadapu" } = await req.json();

    if (!hook || !image_url) {
      return NextResponse.json({ error: "Hook & image required" }, { status: 400 });
    }

    // 🔥 Fetch background image
    const bgRes = await fetch(image_url);
    const bgBuffer = Buffer.from(await bgRes.arrayBuffer());

    // 🔥 Sizes
    const hookSize = 75;
    const captionSize = Math.floor(hookSize * 0.75); // 75% ratio
    const footerSize = 32;

    const purpleTheme = "#8E24AA";
    const blockTop = HEIGHT * 0.6;
    const dividerY = HEIGHT * 0.74;

    // 🔥 Remove emojis from text (we render separately)
    const cleanHook = hook.replace(/\p{Emoji_Presentation}/gu, "");
    const cleanCaption = caption.replace(/\p{Emoji_Presentation}/gu, "");

    const hookLines = wrapText(cleanHook.toUpperCase(), 15).slice(0, 2);
    const captionLines = wrapText(cleanCaption, 38).slice(0, 3);

    // 🔥 Emoji buffers
    const hookEmojis = await Promise.all(getEmojiData(hook).map(e => emojiToBuffer(e, hookSize)));
    const captionEmojis = await Promise.all(getEmojiData(caption).map(e => emojiToBuffer(e, captionSize)));
    const mic = await emojiToBuffer("🎙️", 70);

    const followText = `Follow ${channel_name}`;
    const badgeWidth = followText.length * 18 + 50;

    // 🔥 SVG (NO CSS → INLINE FONT ONLY)
    const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">

  <rect x="0" y="${blockTop}" width="${WIDTH}" height="${HEIGHT - blockTop}" fill="black"/>

  ${hookLines
    .map(
      (line, i) => `
    <text 
      x="${WIDTH / 2}" 
      y="${HEIGHT * 0.675 + i * (hookSize * 1.1)}" 
      text-anchor="middle"
      font-size="${hookSize}"
      font-weight="900"
      fill="${purpleTheme}"
      font-family="Arial Black, Segoe UI, sans-serif"
    >
      ${line}
    </text>`
    )
    .join("")}

  <line x1="250" y1="${dividerY}" x2="${WIDTH - 250}" y2="${dividerY}" stroke="white" opacity="0.3"/>

  ${captionLines
    .map(
      (line, i) => `
    <text 
      x="${WIDTH / 2}" 
      y="${dividerY + 85 + i * (captionSize * 1.3)}" 
      text-anchor="middle"
      font-size="${captionSize}"
      font-weight="600"
      fill="white"
      font-family="Segoe UI, Arial, sans-serif"
    >
      ${line}
    </text>`
    )
    .join("")}

  <rect x="${(WIDTH - badgeWidth) / 2}" y="${HEIGHT - 105}" width="${badgeWidth}" height="60" rx="30" fill="#0070f3"/>
  
  <text 
    x="${WIDTH / 2}" 
    y="${HEIGHT - 65}" 
    text-anchor="middle"
    font-size="${footerSize}"
    font-weight="700"
    fill="white"
    font-family="Segoe UI, Arial, sans-serif"
  >
    ${followText}
  </text>

</svg>
`;

    const composites: sharp.OverlayOptions[] = [
      { input: Buffer.from(svg), top: 0, left: 0 }
    ];

    // 🔥 Hook emoji position
    const hookY = HEIGHT * 0.675 + ((hookLines.length - 1) * hookSize * 1.1);
    const hookWidth = hookLines[hookLines.length - 1].length * (hookSize * 0.55);

    hookEmojis.forEach((buf, i) => {
      if (buf)
        composites.push({
          input: buf,
          top: hookY - hookSize,
          left: WIDTH / 2 + hookWidth / 2 + 20 + i * hookSize
        });
    });

    // 🔥 Caption emoji position
    const capY = dividerY + 85 + ((captionLines.length - 1) * captionSize * 1.3);
    const capWidth = captionLines[captionLines.length - 1].length * (captionSize * 0.5);

    captionEmojis.forEach((buf, i) => {
      if (buf)
        composites.push({
          input: buf,
          top: capY - captionSize,
          left: WIDTH / 2 + capWidth / 2 + 20 + i * captionSize
        });
    });

    // 🔥 Mic emojis
    if (mic) {
      composites.push(
        { input: mic, top: HEIGHT - 115, left: 80 },
        { input: mic, top: HEIGHT - 115, left: WIDTH - 150 }
      );
    }

    // 🔥 Final image
    const final = await sharp(bgBuffer)
      .resize(WIDTH, HEIGHT * 0.6, { fit: "cover" })
      .extend({ bottom: HEIGHT * 0.4, background: "black" })
      .composite(composites)
      .png()
      .toBuffer();

    return new NextResponse(final, {
      headers: { "Content-Type": "image/png" }
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}