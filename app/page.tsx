// "use client";

// import { useState } from "react";

// interface NewsItem {
//   id: string;
//   title: string;
//   link: string;
//   sourceUrl: string;
//   sourceName: string;
//   date: string;
//   category: string;
//   summary: string;
//   image_url: string;
// }

// type Step = "idle" | "loading-news" | "news" | "generate";

// const DEFAULT_TOPICS = ["Tamil Nadu", "Chennai", "India Politics", "IPL"];

// const TAG_COLORS: Record<string, string> = {
//   "Tamil Nadu": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
//   Chennai: "bg-sky-500/10 text-sky-400 border-sky-500/30",
//   "India Politics": "bg-rose-500/10 text-rose-400 border-rose-500/30",
//   IPL: "bg-violet-500/10 text-violet-400 border-violet-500/30",
// };

// function tagColor(cat: string) {
//   return TAG_COLORS[cat] || "bg-amber-500/10 text-amber-400 border-amber-500/30";
// }

// function realUrl(item: NewsItem): string {
//   if (item.sourceUrl && !item.sourceUrl.includes("news.google.com")) return item.sourceUrl;
//   return item.link;
// }

// export default function Home() {
//   const [step, setStep] = useState<Step>("idle");
//   const [news, setNews] = useState<NewsItem[]>([]);
//   const [error, setError] = useState<string>("");
//   const [filterCat, setFilterCat] = useState<string>("All");

//   // Manual form fields
//   const [headline, setHeadline] = useState("");
//   const [caption, setCaption] = useState("");
//   const [imageUrl, setImageUrl] = useState("");
//   const [hashtags, setHashtags] = useState("");
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string>("");

//   // Topic builder
//   const [topicInput, setTopicInput] = useState("");
//   const [topics, setTopics] = useState<string[]>(DEFAULT_TOPICS);

//   const addTopic = (raw: string) => {
//     const t = raw.trim();
//     if (!t || topics.includes(t) || topics.length >= 8) return;
//     setTopics((prev) => [...prev, t]);
//     setTopicInput("");
//   };
//   const removeTopic = (t: string) => setTopics((prev) => prev.filter((x) => x !== t));

//   const fetchNews = async (overrideTopics?: string[]) => {
//     const useTopics = overrideTopics ?? topics;
//     if (!useTopics.length) return;
//     setStep("loading-news");
//     setError("");

//     setFilterCat("All");
//     try {
//       const q = useTopics.join(",");
//       const res = await fetch(`/api/news?q=${encodeURIComponent(q)}&summaries=true`);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to fetch news");
//       setNews(data.news || []);
//       setStep("news");
//     } catch (e: unknown) {
//       setError(e instanceof Error ? e.message : "Failed to fetch news");
//       setStep("idle");
//     }
//   };

//   const generatePost = async () => {
//     if (!headline || !caption || !imageUrl) {
//       setError("Please fill in headline, caption, and image URL");
//       return;
//     }

//     setIsGenerating(true);
//     setError("");
//     setImagePreview("");

//     try {
//       const res = await fetch("/api/image", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           hook: headline,
//           caption: caption,
//           hashtags: hashtags,
//           image_url: imageUrl,
//         }),
//       });

//       if (!res.ok) throw new Error("Image generation failed");

//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       setImagePreview(url);

//       // Auto-download
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "instagram-post.png";
//       a.click();
//     } catch (e: unknown) {
//       setError(e instanceof Error ? e.message : "Image generation failed");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const allCategories = ["All", ...Array.from(new Set(news.map((n) => n.category)))];
//   const filteredNews = filterCat === "All" ? news : news.filter((n) => n.category === filterCat);

//   const formatDate = (d: string) => {
//     try {
//       return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
//     } catch { return d; }
//   };



//   return (
//     <div className="min-h-screen bg-[#0A0A0A] text-white font-body">
//       {/* Header */}
//       <header className="border-b border-[#1a1a1a] sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-md">
//         <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-lg bg-brand-yellow flex items-center justify-center text-black text-sm font-bold">IG</div>
//             <div>
//               <h1 className="font-display text-xl tracking-wide text-white leading-none">AI INSTA CREATOR</h1>
//               <p className="text-[10px] text-[#555] tracking-widest uppercase mt-0.5">Manual ChatGPT Pipeline</p>
//             </div>
//           </div>
//           {step !== "idle" && (
//             <button
//               onClick={() => {
//                 setStep("idle");
//                 setNews([]);
//                 setError("");
//                 setHeadline("");
//                 setCaption("");
//                 setImageUrl("");
//                 setHashtags("");
//               }}
//               className="text-xs text-[#555] hover:text-white transition-colors border border-[#222] hover:border-[#444] px-3 py-1.5 rounded-md"
//             >
//               Back
//             </button>
//           )}
//         </div>
//       </header>

//       <main className="max-w-5xl mx-auto px-6 py-10">

//         {/* ── IDLE: Topic Builder ── */}
//         {step === "idle" && (
//           <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
//             <div className="w-20 h-20 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center mb-8">
//               <svg className="w-10 h-10 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
//               </svg>
//             </div>
//             <h2 className="font-display text-5xl text-white tracking-wide mb-3">CREATE POSTS</h2>
//             <p className="text-[#666] text-center max-w-md mb-10 leading-relaxed">
//               Fetch news → review articles → paste your ChatGPT content → generate professional Instagram posts.
//             </p>

//             {/* Topic builder card */}
//             <div className="w-full max-w-xl bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 mb-8">
//               <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-3 block">
//                 Topics to Fetch (up to 8)
//               </label>

//               {/* Chips */}
//               <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
//                 {topics.map((t) => (
//                   <span key={t} className="flex items-center gap-1.5 text-xs bg-brand-yellow/10 border border-brand-yellow/25 text-brand-yellow px-3 py-1 rounded-full">
//                     {t}
//                     <button onClick={() => removeTopic(t)} className="hover:text-white transition-colors text-brand-yellow/60 leading-none text-base">×</button>
//                   </span>
//                 ))}
//                 {topics.length === 0 && (
//                   <span className="text-xs text-[#444] italic">No topics yet — add some below</span>
//                 )}
//               </div>

//               {/* Input */}
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={topicInput}
//                   onChange={(e) => setTopicInput(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTopic(topicInput); }
//                   }}
//                   placeholder="e.g. AIADMK, T20 World Cup, Bangalore…"
//                   disabled={topics.length >= 8}
//                   className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-2.5 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors disabled:opacity-40"
//                 />
//                 <button
//                   onClick={() => addTopic(topicInput)}
//                   disabled={!topicInput.trim() || topics.length >= 8}
//                   className="px-4 py-2.5 rounded-xl border border-[#333] text-sm text-[#888] hover:text-white hover:border-[#555] transition-all disabled:opacity-30"
//                 >
//                   Add
//                 </button>
//               </div>
//               <p className="text-[10px] text-[#3a3a3a] mt-2">
//                 Press Enter or comma to add · Remove with ×
//               </p>

//               {/* Quick-add suggestions */}
//               <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
//                 <p className="text-[10px] uppercase tracking-widest text-[#444] mb-2">Quick add</p>
//                 <div className="flex flex-wrap gap-1.5">
//                   {["AIADMK", "DMK", "Modi", "Rahul Gandhi", "T20 World Cup", "Bangalore", "Maharashtra", "Stock Market", "Bollywood"].filter(s => !topics.includes(s)).map((s) => (
//                     <button
//                       key={s}
//                       onClick={() => addTopic(s)}
//                       disabled={topics.length >= 8}
//                       className="text-[11px] text-[#555] hover:text-white border border-[#222] hover:border-[#444] px-2.5 py-1 rounded-full transition-all disabled:opacity-30"
//                     >
//                       + {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <button
//               onClick={() => fetchNews()}
//               disabled={topics.length === 0}
//               className="btn-glow px-10 py-4 rounded-xl text-black font-semibold text-lg tracking-wide disabled:opacity-40"
//             >
//               Start — Fetch {topics.length} Topic{topics.length !== 1 ? "s" : ""}
//             </button>
//             <div className="mt-8 flex gap-6 text-xs text-[#444]">
//               <span>📰 Live Google News</span>
//               <span>✍️ ChatGPT Content</span>
//               <span>🖼️ 1080×1350 PNG</span>
//             </div>
//           </div>
//         )}

//         {/* ── LOADING ── */}
//         {step === "loading-news" && (
//           <div className="animate-fade-in">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse" />
//               <span className="text-[#888] text-sm">Fetching live news for: {topics.join(", ")}…</span>
//             </div>
//             <div className="grid gap-3">
//               {Array.from({ length: 8 }).map((_, i) => (
//                 <div key={i} className="h-20 rounded-xl shimmer" />
//               ))}
//             </div>
//           </div>
//         )}

//         {/* ── NEWS LIST ── */}
//         {step === "news" && (
//           <div className="animate-slide-up">
//             <div className="mb-6">
//               <h2 className="font-display text-3xl tracking-wide">REVIEW & COPY</h2>
//               <p className="text-[#555] text-sm mt-1">
//                 {news.length} stories · Copy content & links to ChatGPT for refinement
//               </p>
//             </div>

//             {/* Category filter */}
//             <div className="flex gap-2 mb-5 flex-wrap">
//               {allCategories.map((cat) => (
//                 <button
//                   key={cat}
//                   onClick={() => setFilterCat(cat)}
//                   className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filterCat === cat
//                     ? "bg-brand-yellow text-black border-brand-yellow font-semibold"
//                     : "border-[#333] text-[#666] hover:border-[#555] hover:text-white"
//                     }`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>

//             <div className="grid gap-2.5 mb-8">
//               {filteredNews.map((item) => (
//                 <div key={item.id} className="news-item rounded-xl">
//                   <div className="p-4 flex items-start gap-3">
//                     <div className="flex-1 text-left min-w-0">
//                       <div className="flex items-center gap-2 mb-1.5 flex-wrap">
//                         <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${tagColor(item.category)}`}>
//                           {item.category}
//                         </span>
//                         {item.sourceName && item.sourceName !== "Unknown Source" && (
//                           <span className="text-[10px] text-[#555] font-medium">{item.sourceName}</span>
//                         )}
//                         <span className="text-[#3a3a3a] text-xs">{formatDate(item.date)}</span>
//                       </div>
//                       <p className="text-sm text-white leading-snug line-clamp-2 mb-1">{item.title}</p>
//                       {item.summary && <p className="text-xs text-[#4a4a4a] line-clamp-1">{item.summary}</p>}
//                     </div>

//                     <div className="flex flex-col items-end gap-1.5 flex-shrink-0 mt-0.5">
//                       <a
//                         href={realUrl(item)}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-[10px] text-[#555] hover:text-brand-yellow border border-[#222] hover:border-brand-yellow/40 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap"
//                       >
//                         Read ↗
//                       </a>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Action button */}
//             <button
//               onClick={() => setStep("generate")}
//               className="btn-glow px-8 py-3 rounded-xl text-black font-semibold text-base"
//             >
//               Next: Generate Post
//             </button>
//           </div>
//         )}

//         {/* ── GENERATE POST ── */}
//         {step === "generate" && (
//           <div className="animate-slide-up max-w-2xl mx-auto">
//             <div className="mb-8">
//               <h2 className="font-display text-3xl tracking-wide mb-2">CREATE POST</h2>
//               <p className="text-[#555] text-sm">
//                 Paste your ChatGPT-refined headline, caption, and Google Images URL. We&apos;ll generate the professional Instagram post.
//               </p>
//             </div>

//             {error && (
//               <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
//                 {error}
//               </div>
//             )}

//             <div className="space-y-4 mb-8">
//               {/* Headline */}
//               <div>
//                 <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-2 block">Headline (Hook)</label>
//                 <textarea
//                   value={headline}
//                   onChange={(e) => setHeadline(e.target.value)}
//                   placeholder="e.g. BREAKING: Chennai Weather Alert Issued for Next Week"
//                   rows={3}
//                   className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-3 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors resize-none"
//                 />
//               </div>

//               {/* Caption */}
//               <div>
//                 <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-2 block">Caption</label>
//                 <textarea
//                   value={caption}
//                   onChange={(e) => setCaption(e.target.value)}
//                   placeholder="Paste your refined caption from ChatGPT..."
//                   rows={4}
//                   className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-3 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors resize-none"
//                 />
//               </div>

//               {/* Image URL */}
//               <div>
//                 <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-2 block">Image URL</label>
//                 <input
//                   type="text"
//                   value={imageUrl}
//                   onChange={(e) => setImageUrl(e.target.value)}
//                   placeholder="Paste Google Images URL (1080x1350 or wider aspect recommended)"
//                   className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-3 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors"
//                 />
//                 {imageUrl && (
//                   <div className="mt-3 rounded-xl overflow-hidden border border-[#2a2a2a]">
//                     <img
//                       src={imageUrl}
//                       alt="Preview"
//                       className="w-full h-auto max-h-96 object-cover"
//                       onError={() => setError("Failed to load image URL")}
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Hashtags */}
//               <div>
//                 <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-2 block">Hashtags (Optional)</label>
//                 <input
//                   type="text"
//                   value={hashtags}
//                   onChange={(e) => setHashtags(e.target.value)}
//                   placeholder="#TamilNadu #Chennai #India #IPL"
//                   className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-3 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors"
//                 />
//               </div>
//             </div>

//             {/* Generated Image Preview */}
//             {imagePreview && (
//               <div className="mb-8">
//                 <p className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-3">Generated Post (Downloaded automatically)</p>
//                 <div className="rounded-xl overflow-hidden border border-[#2a2a2a]">
//                   <img src={imagePreview} alt="Generated" className="w-full h-auto" />
//                 </div>
//               </div>
//             )}

//             {/* Generate Button */}
//             <button
//               onClick={generatePost}
//               disabled={isGenerating}
//               className={`w-full py-4 rounded-xl font-semibold text-lg tracking-wide ${
//                 isGenerating
//                   ? "btn-glow opacity-50 cursor-not-allowed"
//                   : "btn-glow hover:opacity-90"
//               } text-black`}
//             >
//               {isGenerating ? "Generating..." : "Generate & Download Post"}
//             </button>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }




"use client";

import { useState, useRef, useEffect } from "react";

interface NewsItem {
  id: string;
  title: string;
  link: string;
  sourceUrl: string;
  sourceName: string;
  date: string;
  category: string;
  summary: string;
  image_url: string;
}

type Step = "idle" | "loading-news" | "news" | "generate";

const DEFAULT_TOPICS = ["Tamil Nadu", "Chennai", "India Politics", "IPL"];

const TAG_COLORS: Record<string, string> = {
  "Tamil Nadu": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  Chennai: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  "India Politics": "bg-rose-500/10 text-rose-400 border-rose-500/30",
  IPL: "bg-violet-500/10 text-violet-400 border-violet-500/30",
};

function tagColor(cat: string) {
  return TAG_COLORS[cat] || "bg-amber-500/10 text-amber-400 border-amber-500/30";
}

function realUrl(item: NewsItem): string {
  if (item.sourceUrl && !item.sourceUrl.includes("news.google.com")) return item.sourceUrl;
  return item.link;
}

// ─── Canvas Constants ─────────────────────────────────────────────────────────
const POST_W    = 1080;
const POST_H    = 1350;
const PHOTO_H   = Math.round(POST_H * 0.50);   // exactly 50/50 split
const TEXT_BG_Y = PHOTO_H;                      // black block starts here — hard cut, no fade
const ACCENT    = "#F5A623";                     // warm orange-gold — eye-catching, not purple
const BLUE      = "#1877F2";                     // facebook blue for badge

// ─── Font Loader ──────────────────────────────────────────────────────────────
let fontsLoaded = false;
async function loadFonts() {
  if (fontsLoaded) return;
  // Fetch live CSS so URL never goes stale
  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@700;800;900&family=Noto+Sans+Tamil:wght@700;800&display=swap"
  ).then((r) => r.text());

  const urls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+\.woff2)\)/g)].map((m) => m[1]);

  await Promise.all(
    urls.map(async (url) => {
      const isDM     = url.toLowerCase().includes("dmsans") || url.toLowerCase().includes("dm_sans") || url.toLowerCase().includes("dm-sans");
      const family   = isDM ? "DMSans" : "NotoTamil";
      const weight   = "700";
      const face     = new FontFace(family, `url(${url})`, { weight });
      const loaded   = await face.load().catch(() => null);
      if (loaded) document.fonts.add(loaded);
    })
  );

  await document.fonts.ready;
  fontsLoaded = true;
}

// ─── Text Wrap ────────────────────────────────────────────────────────────────
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? cur + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ─── Canvas Generator ─────────────────────────────────────────────────────────
async function generateCanvasImage(
  hook: string,
  caption: string,
  imageSrc: string,
  channelName: string
): Promise<string> {
  await loadFonts();

  const canvas  = document.createElement("canvas");
  canvas.width  = POST_W;
  canvas.height = POST_H;
  const ctx     = canvas.getContext("2d")!;

  // ── 1. Photo — hard cut, cover fit, NO fade ───────────────────────
  await new Promise<void>((resolve) => {
    const img  = new Image();
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, POST_W, PHOTO_H);
      ctx.clip();

      // Cover fit — scale so BOTH width and height fill, anchor to top-center
      const scale = Math.max(POST_W / img.width, PHOTO_H / img.height);
      const sw    = img.width  * scale;
      const sh    = img.height * scale;
      const sx    = (POST_W - sw) / 2; // center horizontally
      const sy    = 0;                  // anchor to top so head never crops
      ctx.drawImage(img, sx, sy, sw, sh);
      ctx.restore();
      resolve();
    };
    img.onerror = () => {
      // Fallback gradient
      const g = ctx.createLinearGradient(0, 0, 0, PHOTO_H);
      g.addColorStop(0, "#1a1a2e");
      g.addColorStop(1, "#16213e");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, POST_W, PHOTO_H);
      resolve();
    };
    img.src = imageSrc;
  });

  // ── 2. Black text block — hard edge ──────────────────────────────
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, TEXT_BG_Y, POST_W, POST_H - TEXT_BG_Y);

  // ── 3. Accent top border on black block ───────────────────────────
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, TEXT_BG_Y, POST_W, 5);

  // ── 4. Hook text ──────────────────────────────────────────────────
  const hookSize   = 80;
  const hookFont   = `900 ${hookSize}px 'DMSans', 'NotoTamil', sans-serif`;
  ctx.font         = hookFont;
  ctx.fillStyle    = "#FFFFFF";
  ctx.textAlign    = "center";
  ctx.textBaseline = "top";

  const hookLines  = wrapText(ctx, hook.toUpperCase(), POST_W - 100);
  const hookStartY = TEXT_BG_Y + 55;
  const hookLineH  = hookSize * 1.15;

  hookLines.forEach((line, i) => {
    ctx.fillStyle = ACCENT; // orange hook text
    ctx.fillText(line, POST_W / 2, hookStartY + i * hookLineH);
  });

  // Accent underline below hook
  const hookEndY  = hookStartY + hookLines.length * hookLineH;
  const ulW       = 120;
  ctx.fillStyle   = ACCENT;
  ctx.beginPath();
  ctx.roundRect((POST_W - ulW) / 2, hookEndY + 12, ulW, 5, 3);
  ctx.fill();

  // ── 5. Caption text ───────────────────────────────────────────────
  const capSize    = 44;
  ctx.font         = `700 ${capSize}px 'DMSans', 'NotoTamil', sans-serif`;
  ctx.fillStyle    = "rgba(255,255,255,0.80)";
  ctx.textAlign    = "center";
  ctx.textBaseline = "top";

  const capStartY  = hookEndY + 70;  // was 44 — more breathing room
  const capLineH   = capSize * 1.45;
  const capLines   = wrapText(ctx, caption, POST_W - 120);

  // Only show lines that fit above badge area
  const maxCapY    = POST_H - 160;
  capLines.forEach((line, i) => {
    const y = capStartY + i * capLineH;
    if (y + capSize < maxCapY) ctx.fillText(line, POST_W / 2, y);
  });

  // ── 6. Follow badge ───────────────────────────────────────────────
  const badgeText  = `Follow @${channelName}`;
  const badgeFontS = 34;
  ctx.font         = `800 ${badgeFontS}px 'DMSans', 'NotoTamil', sans-serif`;
  const tW         = ctx.measureText(badgeText).width;
  const badgeW     = tW + 90;
  const badgeH     = 68;
  const badgeX     = (POST_W - badgeW) / 2;
  const badgeY     = POST_H - 110;
  const r          = 34;

  // Shadow
  ctx.shadowColor   = "rgba(24,119,242,0.4)";
  ctx.shadowBlur    = 24;

  // Pill
  ctx.fillStyle = BLUE;
  ctx.beginPath();
  ctx.moveTo(badgeX + r, badgeY);
  ctx.lineTo(badgeX + badgeW - r, badgeY);
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + r);
  ctx.lineTo(badgeX + badgeW, badgeY + badgeH - r);
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - r, badgeY + badgeH);
  ctx.lineTo(badgeX + r, badgeY + badgeH);
  ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - r);
  ctx.lineTo(badgeX, badgeY + r);
  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + r, badgeY);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur    = 0;
  ctx.fillStyle     = "#ffffff";
  ctx.textAlign     = "center";
  ctx.textBaseline  = "middle";
  ctx.fillText(badgeText, POST_W / 2, badgeY + badgeH / 2);

  // ── 7. Mic emojis ─────────────────────────────────────────────────
  ctx.font          = "54px serif";
  ctx.textBaseline  = "middle";
  ctx.fillText("🎙️", 90,          POST_H - 76);
  ctx.fillText("🎙️", POST_W - 90, POST_H - 76);

  return canvas.toDataURL("image/png");
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const [step, setStep]           = useState<Step>("idle");
  const [news, setNews]           = useState<NewsItem[]>([]);
  const [error, setError]         = useState<string>("");
  const [filterCat, setFilterCat] = useState<string>("All");

  const [headline, setHeadline]         = useState("");
  const [caption, setCaption]           = useState("");
  const [hashtags, setHashtags]         = useState("");
  const [channelName]                   = useState("NaatuNadapu");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [uploadedImage, setUploadedImage]       = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [topicInput, setTopicInput] = useState("");
  const [topics, setTopics]         = useState<string[]>(DEFAULT_TOPICS);

  const addTopic = (raw: string) => {
    const t = raw.trim();
    if (!t || topics.includes(t) || topics.length >= 8) return;
    setTopics((p) => [...p, t]);
    setTopicInput("");
  };
  const removeTopic = (t: string) => setTopics((p) => p.filter((x) => x !== t));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    setUploadedImage(URL.createObjectURL(file));
    setUploadedFileName(file.name);
    setImagePreview("");
  };

  const fetchNews = async (overrideTopics?: string[]) => {
    const useTopics = overrideTopics ?? topics;
    if (!useTopics.length) return;
    setStep("loading-news");
    setError("");
    setFilterCat("All");
    try {
      const res  = await fetch(`/api/news?q=${encodeURIComponent(useTopics.join(","))}&summaries=true`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setNews(data.news || []);
      setStep("news");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
      setStep("idle");
    }
  };

  // Live preview debounce
  useEffect(() => {
    if (step !== "generate" || !headline || !uploadedImage) return;
    const t = setTimeout(async () => {
      try {
        setImagePreview(await generateCanvasImage(headline, caption, uploadedImage, channelName));
      } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(t);
  }, [headline, caption, uploadedImage, channelName, step]);

  const generatePost = async () => {
    if (!headline || !caption || !uploadedImage) {
      setError("Please fill in headline, caption, and upload an image");
      return;
    }
    setIsGenerating(true);
    setError("");
    try {
      const dataUrl  = await generateCanvasImage(headline, caption, uploadedImage, channelName);
      setImagePreview(dataUrl);
      const a        = document.createElement("a");
      a.href         = dataUrl;
      a.download     = "instagram-post.png";
      a.click();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAll = () => {
    setStep("idle"); setNews([]); setError("");
    setHeadline(""); setCaption(""); setHashtags(""); setImagePreview("");
    if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    setUploadedImage(""); setUploadedFileName("");
  };

  const allCategories = ["All", ...Array.from(new Set(news.map((n) => n.category)))];
  const filteredNews  = filterCat === "All" ? news : news.filter((n) => n.category === filterCat);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch { return d; }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-body">

      {/* Header */}
      <header className="border-b border-[#1a1a1a] sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-yellow flex items-center justify-center text-black text-sm font-bold">IG</div>
            <div>
              <h1 className="font-display text-xl tracking-wide text-white leading-none">AI INSTA CREATOR</h1>
              <p className="text-[10px] text-[#555] tracking-widest uppercase mt-0.5">Manual ChatGPT Pipeline</p>
            </div>
          </div>
          {step !== "idle" && (
            <button onClick={resetAll}
              className="text-xs text-[#555] hover:text-white transition-colors border border-[#222] hover:border-[#444] px-3 py-1.5 rounded-md">
              Back
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* ── IDLE ── */}
        {step === "idle" && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center mb-8">
              <svg className="w-10 h-10 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="font-display text-5xl text-white tracking-wide mb-3">CREATE POSTS</h2>
            <p className="text-[#666] text-center max-w-md mb-10 leading-relaxed">
              Fetch news → review → paste ChatGPT content → upload image → generate post.
            </p>

            <div className="w-full max-w-xl bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 mb-8">
              <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-3 block">Topics (up to 8)</label>
              <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
                {topics.map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs bg-brand-yellow/10 border border-brand-yellow/25 text-brand-yellow px-3 py-1 rounded-full">
                    {t}
                    <button onClick={() => removeTopic(t)} className="hover:text-white transition-colors text-brand-yellow/60 leading-none text-base">×</button>
                  </span>
                ))}
                {topics.length === 0 && <span className="text-xs text-[#444] italic">No topics yet</span>}
              </div>
              <div className="flex gap-2">
                <input type="text" value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTopic(topicInput); } }}
                  placeholder="e.g. AIADMK, T20 World Cup…"
                  disabled={topics.length >= 8}
                  className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-2.5 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors disabled:opacity-40"
                />
                <button onClick={() => addTopic(topicInput)} disabled={!topicInput.trim() || topics.length >= 8}
                  className="px-4 py-2.5 rounded-xl border border-[#333] text-sm text-[#888] hover:text-white hover:border-[#555] transition-all disabled:opacity-30">
                  Add
                </button>
              </div>
              <p className="text-[10px] text-[#3a3a3a] mt-2">Enter or comma to add · × to remove</p>
              <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
                <p className="text-[10px] uppercase tracking-widest text-[#444] mb-2">Quick add</p>
                <div className="flex flex-wrap gap-1.5">
                  {["AIADMK", "DMK", "Modi", "Rahul Gandhi", "T20 World Cup", "Bangalore", "Stock Market", "Bollywood"]
                    .filter((s) => !topics.includes(s)).map((s) => (
                      <button key={s} onClick={() => addTopic(s)} disabled={topics.length >= 8}
                        className="text-[11px] text-[#555] hover:text-white border border-[#222] hover:border-[#444] px-2.5 py-1 rounded-full transition-all disabled:opacity-30">
                        + {s}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <button onClick={() => fetchNews()} disabled={topics.length === 0}
              className="btn-glow px-10 py-4 rounded-xl text-black font-semibold text-lg tracking-wide disabled:opacity-40">
              Start — Fetch {topics.length} Topic{topics.length !== 1 ? "s" : ""}
            </button>
            <div className="mt-8 flex gap-6 text-xs text-[#444]">
              <span>📰 Live Google News</span><span>✍️ ChatGPT Content</span><span>🖼️ 1080×1350 PNG</span>
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {step === "loading-news" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse" />
              <span className="text-[#888] text-sm">Fetching: {topics.join(", ")}…</span>
            </div>
            <div className="grid gap-3">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 rounded-xl shimmer" />)}
            </div>
          </div>
        )}

        {/* ── NEWS LIST ── */}
        {step === "news" && (
          <div className="animate-slide-up">
            <div className="mb-6">
              <h2 className="font-display text-3xl tracking-wide">REVIEW & COPY</h2>
              <p className="text-[#555] text-sm mt-1">{news.length} stories · Copy to ChatGPT for refinement</p>
            </div>
            <div className="flex gap-2 mb-5 flex-wrap">
              {allCategories.map((cat) => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    filterCat === cat ? "bg-brand-yellow text-black border-brand-yellow font-semibold" : "border-[#333] text-[#666] hover:border-[#555] hover:text-white"
                  }`}>{cat}</button>
              ))}
            </div>
            <div className="grid gap-2.5 mb-8">
              {filteredNews.map((item) => (
                <div key={item.id} className="news-item rounded-xl">
                  <div className="p-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${tagColor(item.category)}`}>{item.category}</span>
                        {item.sourceName && item.sourceName !== "Unknown Source" && <span className="text-[10px] text-[#555]">{item.sourceName}</span>}
                        <span className="text-[#3a3a3a] text-xs">{formatDate(item.date)}</span>
                      </div>
                      <p className="text-sm text-white leading-snug line-clamp-2 mb-1">{item.title}</p>
                      {item.summary && <p className="text-xs text-[#4a4a4a] line-clamp-1">{item.summary}</p>}
                    </div>
                    <a href={realUrl(item)} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-[#555] hover:text-brand-yellow border border-[#222] hover:border-brand-yellow/40 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap flex-shrink-0 mt-0.5">
                      Read ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep("generate")} className="btn-glow px-8 py-3 rounded-xl text-black font-semibold text-base">
              Next: Generate Post
            </button>
          </div>
        )}

        {/* ── GENERATE POST ── */}
        {step === "generate" && (
          <div className="animate-slide-up">
            <div className="mb-8">
              <h2 className="font-display text-3xl tracking-wide mb-2">CREATE POST</h2>
              <p className="text-[#555] text-sm">Upload image + paste content. Preview updates live.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{error}</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Form */}
              <div className="space-y-4">

                {/* Upload */}
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-2 block">Upload Image</label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()}
                    className={`w-full rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all ${
                      uploadedImage ? "border-brand-yellow/40 bg-brand-yellow/5" : "border-[#2a2a2a] hover:border-[#444] bg-[#0d0d0d]"
                    }`}>
                    {uploadedImage ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={uploadedImage} alt="Uploaded" className="w-12 h-12 rounded-lg object-cover" />
                        <div className="text-left">
                          <p className="text-sm text-brand-yellow font-medium truncate max-w-[200px]">{uploadedFileName}</p>
                          <p className="text-[11px] text-[#555] mt-0.5">Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl mb-2">📁</div>
                        <p className="text-sm text-[#666]">Click to upload image</p>
                        <p className="text-[11px] text-[#444] mt-1">JPG, PNG, WEBP — any size</p>
                      </div>
                    )}
                  </button>
                </div>

                {/* Headline */}
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-2 block">Headline / Hook</label>
                  <textarea value={headline} onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. ₹4000 MONTHLY AID FOR YOUTH"
                    rows={3}
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-3 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors resize-none"
                  />
                </div>

                {/* Caption */}
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-2 block">Caption</label>
                  <textarea value={caption} onChange={(e) => setCaption(e.target.value)}
                    placeholder="TVK has announced ₹4000 monthly support..."
                    rows={4}
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-3 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors resize-none"
                  />
                </div>

                {/* Hashtags */}
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-2 block">Hashtags (Optional)</label>
                  <input type="text" value={hashtags} onChange={(e) => setHashtags(e.target.value)}
                    placeholder="#TamilNadu #Chennai #India"
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-3 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors"
                  />
                </div>

                <button onClick={generatePost} disabled={isGenerating || !headline || !caption || !uploadedImage}
                  className="w-full py-4 rounded-xl font-semibold text-lg tracking-wide btn-glow text-black disabled:opacity-40 disabled:cursor-not-allowed">
                  {isGenerating ? "Generating…" : "⬇ Download Post (1080×1350)"}
                </button>
              </div>

              {/* Preview */}
              <div className="flex flex-col items-center">
                <p className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-3 self-start">Live Preview</p>
                <div className="w-full rounded-2xl overflow-hidden border border-[#2a2a2a] bg-[#111] aspect-[1080/1350] flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-auto" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-[#333]">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-center px-4">Upload image + fill headline<br />to see live preview</p>
                    </div>
                  )}
                </div>
                {imagePreview && (
                  <button onClick={generatePost} disabled={isGenerating}
                    className="mt-4 w-full py-3 rounded-xl border border-brand-yellow/30 text-brand-yellow text-sm font-medium hover:bg-brand-yellow/5 transition-all disabled:opacity-40">
                    ⬇ Download Again
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}