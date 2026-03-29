// "use client";

// import { useState, useCallback } from "react";

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

// interface GeneratedContent {
//   hook: string;
//   caption: string;
//   hashtags: string;
// }

// type Step = "idle" | "loading-news" | "news" | "generating" | "done";

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
//   const [selected, setSelected] = useState<NewsItem | null>(null);
//   const [reading, setReading] = useState<NewsItem | null>(null);
//   const [content, setContent] = useState<GeneratedContent | null>(null);
//   const [error, setError] = useState<string>("");
//   const [copied, setCopied] = useState(false);
//   const [isDownloadingImg, setIsDownloadingImg] = useState(false);
//   const [manualHeadline, setManualHeadline] = useState("");
//   const [manualImage, setManualImage] = useState("");
//   const [filterCat, setFilterCat] = useState<string>("All");

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
//     setSelected(null);
//     setContent(null);
//     setReading(null);
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

//   const generateContent = async () => {
//     if (!selected) return;
//     setStep("generating");
//     setError("");
//     try {
//       // generateContent function — add link to the request body
//       const res = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           title: selected.title,
//           category: selected.category,
//           summary: selected.summary,
//           link: selected.link,        // ← add this one field
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Generation failed");
//       setContent(data);
//       setStep("done");
//     } catch (e: unknown) {
//       setError(e instanceof Error ? e.message : "Generation failed");
//       setStep("news");
//     }
//   };

//   const downloadImage = useCallback(async () => {
//     if (!content) return;
//     setIsDownloadingImg(true);
//     try {
//       const res = await fetch("/api/image", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           hook: content.hook,
//           caption: content.caption,       // ← add
//           hashtags: content.hashtags,     // ← add
//           category: selected?.category,
//           image_url: selected?.image_url,
//           title: selected?.title,
//         }),
//       });
//       if (!res.ok) throw new Error("Image generation failed");
//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "instagram-post.png";
//       a.click();
//       URL.revokeObjectURL(url);
//     } catch (e: unknown) {
//       setError(e instanceof Error ? e.message : "Image download failed");
//     } finally {
//       setIsDownloadingImg(false);
//     }
//   }, [content, selected]);

//   const copyCaption = useCallback(async () => {
//     if (!content) return;
//     await navigator.clipboard.writeText(`${content.caption}\n\n${content.hashtags}`);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   }, [content]);

//   const downloadText = useCallback(() => {
//     if (!content || !selected) return;
//     const text = [
//       `HOOK: ${content.hook}`,
//       "",
//       "CAPTION:",
//       content.caption,
//       "",
//       "HASHTAGS:",
//       content.hashtags,
//       "",
//       `SOURCE TITLE: ${selected.title}`,
//       `PUBLISHER: ${selected.sourceName}`,
//       `LINK: ${realUrl(selected)}`,
//     ].join("\n");
//     const blob = new Blob([text], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "instagram-content.txt";
//     a.click();
//     URL.revokeObjectURL(url);
//   }, [content, selected]);

//   const allCategories = ["All", ...Array.from(new Set(news.map((n) => n.category)))];
//   const filteredNews = filterCat === "All" ? news : news.filter((n) => n.category === filterCat);

//   const formatDate = (d: string) => {
//     try {
//       return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
//     } catch { return d; }
//   };

//   // ── ARTICLE READER MODAL ──────────────────────────────────────────────────
//   const ArticleReader = ({ item }: { item: NewsItem }) => (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
//       onClick={() => setReading(null)}
//     >
//       <div
//         className="bg-[#111] border border-[#2a2a2a] rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto animate-slide-up"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Modal header */}
//         <div className="sticky top-0 bg-[#111] border-b border-[#1e1e1e] px-6 py-4 flex items-center justify-between">
//           <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${tagColor(item.category)}`}>
//             {item.category}
//           </span>
//           <button onClick={() => setReading(null)} className="text-[#555] hover:text-white transition-colors">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         <div className="px-6 py-5 space-y-4">
//           {/* Title */}
//           <h2 className="text-white font-semibold text-lg leading-snug">{item.title}</h2>

//           {/* Meta row */}
//           <div className="flex items-center gap-3 text-xs text-[#555]">
//             {item.sourceName && item.sourceName !== "Unknown Source" && (
//               <>
//                 <span className="flex items-center gap-1 text-[#777] font-medium">
//                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
//                   </svg>
//                   {item.sourceName}
//                 </span>
//                 <span>·</span>
//               </>
//             )}
//             <span>{formatDate(item.date)}</span>
//           </div>

//           {/* Article preview / summary */}
//           <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-4">
//             <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2 font-medium flex items-center gap-1.5">
//               <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow inline-block" />
//               Article Preview (scraped text)
//             </p>
//             {item.summary ? (
//               <p className="text-sm text-[#ccc] leading-relaxed">{item.summary}…</p>
//             ) : (
//               <p className="text-sm text-[#555] italic">
//                 Full preview not available for this source. Open the article to read more.
//               </p>
//             )}
//           </div>

//           {/* Source URL box */}
//           <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-4">
//             <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2 font-medium">
//               Source URL
//             </p>
//             <a
//               href={realUrl(item)}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-xs text-brand-yellow/70 hover:text-brand-yellow break-all transition-colors"
//             >
//               {realUrl(item)}
//             </a>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-3 pt-1">
//             <a
//               href={realUrl(item)}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="flex-1 py-2.5 rounded-xl text-black font-semibold text-sm text-center btn-glow"
//             >
//               Read Full Article ↗
//             </a>
//             <button
//               onClick={() => { setSelected(selected?.id === item.id ? null : item); setReading(null); }}
//               className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all ${selected?.id === item.id
//                 ? "border-brand-yellow text-brand-yellow bg-brand-yellow/10"
//                 : "border-[#333] text-white hover:border-[#555] hover:bg-white/5"
//                 }`}
//             >
//               {selected?.id === item.id ? "✓ Selected" : "Select for Post"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#0A0A0A] text-white font-body">
//       {reading && <ArticleReader item={reading} />}

//       {/* Header */}
//       <header className="border-b border-[#1a1a1a] sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-md">
//         <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-lg bg-brand-yellow flex items-center justify-center text-black text-sm font-bold">IG</div>
//             <div>
//               <h1 className="font-display text-xl tracking-wide text-white leading-none">AI INSTA CREATOR</h1>
//               <p className="text-[10px] text-[#555] tracking-widest uppercase mt-0.5">Tamil Nadu · Chennai · India · IPL</p>
//             </div>
//           </div>
//           {step !== "idle" && (
//             <button
//               onClick={() => { setStep("idle"); setNews([]); setSelected(null); setContent(null); setError(""); setTopics(DEFAULT_TOPICS); }}
//               className="text-xs text-[#555] hover:text-white transition-colors border border-[#222] hover:border-[#444] px-3 py-1.5 rounded-md"
//             >
//               Reset
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
//             <h2 className="font-display text-5xl text-white tracking-wide mb-3">CREATE VIRAL POSTS</h2>
//             <p className="text-[#666] text-center max-w-md mb-10 leading-relaxed">
//               Choose your topics — fetch live news — generate a complete Instagram post with AI.
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
//               <span>📰 Real-time Google News</span>
//               <span>🤖 GPT-4o-mini</span>
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
//         {(step === "news" || step === "generating") && (
//           <div className="animate-slide-up">
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h2 className="font-display text-3xl tracking-wide">SELECT A NEWS ITEM</h2>
//                 <p className="text-[#555] text-sm mt-1">
//                   {news.length} stories · <span className="text-[#444]">click title to read · click Select to use</span>
//                 </p>
//               </div>
//               <button
//                 onClick={() => fetchNews()}
//                 className="text-xs text-[#888] hover:text-brand-yellow transition-colors flex items-center gap-1.5 border border-[#222] hover:border-brand-yellow/30 px-3 py-1.5 rounded-md"
//               >
//                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                 </svg>
//                 Refresh
//               </button>
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
//                 <div
//                   key={item.id}
//                   className={`news-item rounded-xl ${selected?.id === item.id ? "selected" : ""}`}
//                 >
//                   <div className="p-4 flex items-start gap-3">
//                     {/* Clickable area → opens reader */}
//                     <button className="flex-1 text-left min-w-0" onClick={() => setReading(item)}>
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
//                       {item.summary && (
//                         <p className="text-xs text-[#4a4a4a] line-clamp-1">{item.summary}</p>
//                       )}
//                     </button>

//                     {/* Buttons */}
//                     <div className="flex flex-col items-end gap-1.5 flex-shrink-0 mt-0.5">
//                       <button
//                         onClick={() => setReading(item)}
//                         className="text-[10px] text-[#555] hover:text-brand-yellow border border-[#222] hover:border-brand-yellow/40 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap"
//                       >
//                         Read ↗
//                       </button>
//                       <button
//                         onClick={() => setSelected(selected?.id === item.id ? null : item)}
//                         className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap ${selected?.id === item.id
//                           ? "bg-brand-yellow text-black border-brand-yellow font-bold"
//                           : "border-[#2a2a2a] text-[#666] hover:border-[#444] hover:text-white"
//                           }`}
//                       >
//                         {selected?.id === item.id ? "✓ Selected" : "Select"}
//                       </button>
//                     </div>
//                   </div>

//                   {/* Source URL line */}
//                   {realUrl(item) && !realUrl(item).includes("news.google.com") && (
//                     <div className="px-4 pb-3 -mt-1">
//                       <a
//                         href={realUrl(item)}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-[10px] text-[#333] hover:text-brand-yellow/60 transition-colors truncate block"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         🔗 {realUrl(item)}
//                       </a>
//                     </div>
//                   )}
//                 </div>
//               ))}

//               {filteredNews.length === 0 && (
//                 <div className="text-center py-12 text-[#444]">No news in this category</div>
//               )}
//             </div>

//             {/* Sticky generate bar */}
//             {selected && (
//               <div className="sticky bottom-6">
//                 <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-4 flex items-center gap-4 shadow-2xl shadow-black">
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs text-[#555] mb-0.5">Selected for generation</p>
//                     <p className="text-sm text-white truncate">{selected.title}</p>
//                     {selected.sourceName && <p className="text-[10px] text-[#444] mt-0.5">{selected.sourceName}</p>}
//                   </div>
//                   <button
//                     onClick={generateContent}
//                     disabled={step === "generating"}
//                     className="btn-glow px-6 py-2.5 rounded-xl text-black font-semibold text-sm flex items-center gap-2 flex-shrink-0"
//                   >
//                     {step === "generating" ? (
//                       <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Generating…</>
//                     ) : (
//                       <>Generate Post <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ── DONE / RESULTS ── */}
//         {step === "done" && content && (
//           <div className="animate-slide-up">
//             <button
//               onClick={() => { setStep("news"); setContent(null); }}
//               className="flex items-center gap-2 text-sm text-[#666] hover:text-white transition-colors mb-8"
//             >
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//               </svg>
//               Back to news
//             </button>

//             <div className="grid md:grid-cols-2 gap-6">
//               {/* Left: Preview + downloads */}
//               <div>
//                 <h3 className="font-display text-2xl tracking-wide mb-4 text-[#888]">POST PREVIEW</h3>
//                 <div className="rounded-2xl overflow-hidden border border-[#222]" style={{ aspectRatio: "1080/1350" }}>
//                   <div className="w-full h-full flex flex-col items-center justify-center p-6 relative" style={{ background: "linear-gradient(to bottom, #0A0A0A, #0f0800)" }}>
//                     <div className="absolute top-0 left-0 right-0 h-1 bg-brand-yellow" />
//                     <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-yellow" />
//                     <div className="absolute top-4 left-1/2 -translate-x-1/2">
//                       <span className="tag">{selected?.category}</span>
//                     </div>
//                     <div className="text-center px-4">
//                       <p className="font-display text-brand-yellow leading-tight" style={{ fontSize: "clamp(1.4rem,5vw,2.8rem)", textShadow: "0 0 30px rgba(255,209,0,0.4)" }}>
//                         {content.hook}
//                       </p>
//                     </div>
//                     <div className="w-4/5 h-px bg-brand-yellow/15 my-4" />
//                     <p className="text-xs text-[#bbb] text-center line-clamp-4 px-4 leading-relaxed">{content.caption}</p>
//                     <p className="text-[10px] text-[#664400] text-center mt-3 px-4 line-clamp-2">{content.hashtags}</p>
//                   </div>
//                 </div>
//                 <div className="mt-4 grid grid-cols-2 gap-3">
//                   <button onClick={downloadImage} disabled={isDownloadingImg} className="btn-glow py-3 rounded-xl text-black font-semibold text-sm flex items-center justify-center gap-2">
//                     {isDownloadingImg
//                       ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Rendering…</>
//                       : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Download Image</>
//                     }
//                   </button>
//                   <button onClick={downloadText} className="py-3 rounded-xl text-white font-semibold text-sm border border-[#333] hover:border-[#555] transition-all flex items-center justify-center gap-2 hover:bg-white/5">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
//                     Download Text
//                   </button>
//                 </div>
//               </div>

//               {/* Right: Generated content */}
//               <div className="space-y-4">
//                 <h3 className="font-display text-2xl tracking-wide text-[#888]">GENERATED CONTENT</h3>

//                 {/* Source */}
//                 <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
//                   <div className="flex items-center gap-2 mb-2">
//                     <div className="w-1.5 h-1.5 rounded-full bg-[#555]" />
//                     <span className="text-[10px] uppercase tracking-widest text-[#444] font-medium">Source</span>
//                   </div>
//                   {selected?.sourceName && <p className="text-xs text-[#888] font-medium mb-1">{selected.sourceName}</p>}
//                   <p className="text-xs text-[#666] leading-relaxed line-clamp-2">{selected?.title}</p>
//                   {selected && (
//                     <a href={realUrl(selected)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand-yellow/60 hover:text-brand-yellow mt-2 inline-flex items-center gap-1">
//                       Read original article ↗
//                     </a>
//                   )}
//                 </div>

//                 {/* Hook */}
//                 <div className="bg-[#111] border border-brand-yellow/20 rounded-xl p-4">
//                   <div className="flex items-center gap-2 mb-2">
//                     <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
//                     <span className="text-[10px] uppercase tracking-widest text-brand-yellow font-medium">Hook</span>
//                   </div>
//                   <p className="font-display text-brand-yellow text-xl tracking-wide">{content.hook}</p>
//                 </div>

//                 {/* Caption */}
//                 <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
//                   <div className="flex items-center gap-2 mb-2">
//                     <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
//                     <span className="text-[10px] uppercase tracking-widest text-[#555] font-medium">Caption</span>
//                   </div>
//                   <p className="text-sm text-[#ccc] leading-relaxed">{content.caption}</p>
//                 </div>

//                 {/* Hashtags */}
//                 <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
//                   <div className="flex items-center gap-2 mb-3">
//                     <div className="w-1.5 h-1.5 rounded-full bg-[#664400]" />
//                     <span className="text-[10px] uppercase tracking-widest text-[#555] font-medium">Hashtags</span>
//                   </div>
//                   <div className="flex flex-wrap gap-1.5">
//                     {content.hashtags.split(" ").filter(Boolean).slice(0, 20).map((tag, i) => (
//                       <span key={i} className="text-[11px] bg-[#1a1400] text-[#997700] border border-[#2a2000] px-2 py-0.5 rounded-full">{tag}</span>
//                     ))}
//                   </div>
//                 </div>

//                 <button
//                   onClick={copyCaption}
//                   className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${copied ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "border border-[#333] hover:border-[#555] text-white hover:bg-white/5"}`}
//                 >
//                   {copied
//                     ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
//                     : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy Caption + Hashtags</>
//                   }
//                 </button>

//                 <button
//                   onClick={() => { setContent(null); setStep("news"); }}
//                   className="w-full py-3 rounded-xl font-semibold text-sm border border-[#222] text-[#555] hover:text-white hover:border-[#444] transition-all"
//                 >
//                   ← Choose Another Story
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Error */}
//         {error && (
//           <div className="mt-6 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3">
//             <svg className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <div>
//               <p className="text-rose-400 text-sm font-medium">Error</p>
//               <p className="text-rose-400/70 text-xs mt-0.5">{error}</p>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }





"use client";

import { useState } from "react";

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

export default function Home() {
  const [step, setStep] = useState<Step>("idle");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string>("");
  const [filterCat, setFilterCat] = useState<string>("All");

  // Manual form fields
  const [headline, setHeadline] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Topic builder
  const [topicInput, setTopicInput] = useState("");
  const [topics, setTopics] = useState<string[]>(DEFAULT_TOPICS);

  const addTopic = (raw: string) => {
    const t = raw.trim();
    if (!t || topics.includes(t) || topics.length >= 8) return;
    setTopics((prev) => [...prev, t]);
    setTopicInput("");
  };
  const removeTopic = (t: string) => setTopics((prev) => prev.filter((x) => x !== t));

  const fetchNews = async (overrideTopics?: string[]) => {
    const useTopics = overrideTopics ?? topics;
    if (!useTopics.length) return;
    setStep("loading-news");
    setError("");
   
    setFilterCat("All");
    try {
      const q = useTopics.join(",");
      const res = await fetch(`/api/news?q=${encodeURIComponent(q)}&summaries=true`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch news");
      setNews(data.news || []);
      setStep("news");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch news");
      setStep("idle");
    }
  };

  const generatePost = async () => {
    if (!headline || !caption || !imageUrl) {
      setError("Please fill in headline, caption, and image URL");
      return;
    }

    setIsGenerating(true);
    setError("");
    setImagePreview("");

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hook: headline,
          caption: caption,
          hashtags: hashtags,
          image_url: imageUrl,
        }),
      });

      if (!res.ok) throw new Error("Image generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImagePreview(url);

      // Auto-download
      const a = document.createElement("a");
      a.href = url;
      a.download = "instagram-post.png";
      a.click();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Image generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const allCategories = ["All", ...Array.from(new Set(news.map((n) => n.category)))];
  const filteredNews = filterCat === "All" ? news : news.filter((n) => n.category === filterCat);

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
            <button
              onClick={() => {
                setStep("idle");
                setNews([]);
                setError("");
                setHeadline("");
                setCaption("");
                setImageUrl("");
                setHashtags("");
              }}
              className="text-xs text-[#555] hover:text-white transition-colors border border-[#222] hover:border-[#444] px-3 py-1.5 rounded-md"
            >
              Back
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* ── IDLE: Topic Builder ── */}
        {step === "idle" && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center mb-8">
              <svg className="w-10 h-10 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="font-display text-5xl text-white tracking-wide mb-3">CREATE POSTS</h2>
            <p className="text-[#666] text-center max-w-md mb-10 leading-relaxed">
              Fetch news → review articles → paste your ChatGPT content → generate professional Instagram posts.
            </p>

            {/* Topic builder card */}
            <div className="w-full max-w-xl bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 mb-8">
              <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-3 block">
                Topics to Fetch (up to 8)
              </label>

              {/* Chips */}
              <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
                {topics.map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs bg-brand-yellow/10 border border-brand-yellow/25 text-brand-yellow px-3 py-1 rounded-full">
                    {t}
                    <button onClick={() => removeTopic(t)} className="hover:text-white transition-colors text-brand-yellow/60 leading-none text-base">×</button>
                  </span>
                ))}
                {topics.length === 0 && (
                  <span className="text-xs text-[#444] italic">No topics yet — add some below</span>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTopic(topicInput); }
                  }}
                  placeholder="e.g. AIADMK, T20 World Cup, Bangalore…"
                  disabled={topics.length >= 8}
                  className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-2.5 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors disabled:opacity-40"
                />
                <button
                  onClick={() => addTopic(topicInput)}
                  disabled={!topicInput.trim() || topics.length >= 8}
                  className="px-4 py-2.5 rounded-xl border border-[#333] text-sm text-[#888] hover:text-white hover:border-[#555] transition-all disabled:opacity-30"
                >
                  Add
                </button>
              </div>
              <p className="text-[10px] text-[#3a3a3a] mt-2">
                Press Enter or comma to add · Remove with ×
              </p>

              {/* Quick-add suggestions */}
              <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
                <p className="text-[10px] uppercase tracking-widest text-[#444] mb-2">Quick add</p>
                <div className="flex flex-wrap gap-1.5">
                  {["AIADMK", "DMK", "Modi", "Rahul Gandhi", "T20 World Cup", "Bangalore", "Maharashtra", "Stock Market", "Bollywood"].filter(s => !topics.includes(s)).map((s) => (
                    <button
                      key={s}
                      onClick={() => addTopic(s)}
                      disabled={topics.length >= 8}
                      className="text-[11px] text-[#555] hover:text-white border border-[#222] hover:border-[#444] px-2.5 py-1 rounded-full transition-all disabled:opacity-30"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => fetchNews()}
              disabled={topics.length === 0}
              className="btn-glow px-10 py-4 rounded-xl text-black font-semibold text-lg tracking-wide disabled:opacity-40"
            >
              Start — Fetch {topics.length} Topic{topics.length !== 1 ? "s" : ""}
            </button>
            <div className="mt-8 flex gap-6 text-xs text-[#444]">
              <span>📰 Live Google News</span>
              <span>✍️ ChatGPT Content</span>
              <span>🖼️ 1080×1350 PNG</span>
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {step === "loading-news" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse" />
              <span className="text-[#888] text-sm">Fetching live news for: {topics.join(", ")}…</span>
            </div>
            <div className="grid gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl shimmer" />
              ))}
            </div>
          </div>
        )}

        {/* ── NEWS LIST ── */}
        {step === "news" && (
          <div className="animate-slide-up">
            <div className="mb-6">
              <h2 className="font-display text-3xl tracking-wide">REVIEW & COPY</h2>
              <p className="text-[#555] text-sm mt-1">
                {news.length} stories · Copy content & links to ChatGPT for refinement
              </p>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filterCat === cat
                    ? "bg-brand-yellow text-black border-brand-yellow font-semibold"
                    : "border-[#333] text-[#666] hover:border-[#555] hover:text-white"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid gap-2.5 mb-8">
              {filteredNews.map((item) => (
                <div key={item.id} className="news-item rounded-xl">
                  <div className="p-4 flex items-start gap-3">
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${tagColor(item.category)}`}>
                          {item.category}
                        </span>
                        {item.sourceName && item.sourceName !== "Unknown Source" && (
                          <span className="text-[10px] text-[#555] font-medium">{item.sourceName}</span>
                        )}
                        <span className="text-[#3a3a3a] text-xs">{formatDate(item.date)}</span>
                      </div>
                      <p className="text-sm text-white leading-snug line-clamp-2 mb-1">{item.title}</p>
                      {item.summary && <p className="text-xs text-[#4a4a4a] line-clamp-1">{item.summary}</p>}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0 mt-0.5">
                      <a
                        href={realUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#555] hover:text-brand-yellow border border-[#222] hover:border-brand-yellow/40 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap"
                      >
                        Read ↗
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action button */}
            <button
              onClick={() => setStep("generate")}
              className="btn-glow px-8 py-3 rounded-xl text-black font-semibold text-base"
            >
              Next: Generate Post
            </button>
          </div>
        )}

        {/* ── GENERATE POST ── */}
        {step === "generate" && (
          <div className="animate-slide-up max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="font-display text-3xl tracking-wide mb-2">CREATE POST</h2>
              <p className="text-[#555] text-sm">
                Paste your ChatGPT-refined headline, caption, and Google Images URL. We&apos;ll generate the professional Instagram post.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-8">
              {/* Headline */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-2 block">Headline (Hook)</label>
                <textarea
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. BREAKING: Chennai Weather Alert Issued for Next Week"
                  rows={3}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-3 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors resize-none"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-2 block">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Paste your refined caption from ChatGPT..."
                  rows={4}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-3 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors resize-none"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-2 block">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste Google Images URL (1080x1350 or wider aspect recommended)"
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-3 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors"
                />
                {imageUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-[#2a2a2a]">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-auto max-h-96 object-cover"
                      onError={() => setError("Failed to load image URL")}
                    />
                  </div>
                )}
              </div>

              {/* Hashtags */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-2 block">Hashtags (Optional)</label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#TamilNadu #Chennai #India #IPL"
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-3 placeholder-[#3a3a3a] outline-none focus:border-brand-yellow/50 transition-colors"
                />
              </div>
            </div>

            {/* Generated Image Preview */}
            {imagePreview && (
              <div className="mb-8">
                <p className="text-[11px] uppercase tracking-widest text-[#555] font-medium mb-3">Generated Post (Downloaded automatically)</p>
                <div className="rounded-xl overflow-hidden border border-[#2a2a2a]">
                  <img src={imagePreview} alt="Generated" className="w-full h-auto" />
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generatePost}
              disabled={isGenerating}
              className={`w-full py-4 rounded-xl font-semibold text-lg tracking-wide ${
                isGenerating
                  ? "btn-glow opacity-50 cursor-not-allowed"
                  : "btn-glow hover:opacity-90"
              } text-black`}
            >
              {isGenerating ? "Generating..." : "Generate & Download Post"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
