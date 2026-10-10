"use client";

import { useState, useRef, useEffect, use } from "react";
import axios from "axios";
import { 
  UploadCloud, Loader2, CheckCircle, Save, ArrowLeft, 
  Sparkles, Gamepad2, ShieldCheck, ShieldAlert, Tag, ExternalLink 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "action", "adventure", "arcade", "board", "card", "clicker", 
  "driving", "racing", "puzzle", "shooting", "sports", "multiplayer",
  "casual", "strategy", "3d", "io"
];

export default function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isCategorizingAI, setIsCategorizingAI] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    categories: ["action"] as string[],
    buildType: "html5",
    thumbnailUrl: "",
    playUrl: "",
    developer: "Bluebuff Games",
    platforms: "Browser (desktop, mobile, tablet)",
    orientation: "any",
    status: "published",
    verified: false,
  });

  useEffect(() => {
    fetchGame();
  }, []);

  async function fetchGame() {
    try {
      const { data } = await axios.get(`/api/admin/games/${resolvedParams.id}`);
      setFormData({
        title: data.title,
        slug: data.slug,
        description: data.description || "",
        categories: Array.isArray(data.category) && data.category.length > 0 ? data.category : ["action"],
        buildType: data.buildType || "html5",
        thumbnailUrl: data.thumbnailUrl || "",
        playUrl: data.playUrl || "",
        developer: data.developer || "Bluebuff Games",
        platforms: data.platforms || "Browser (desktop, mobile, tablet)",
        orientation: data.orientation || "any",
        status: data.status || "draft",
        verified: Boolean(data.verified),
      });
    } catch (error) {
      console.error("Failed to fetch game", error);
      setMessage({ type: "error", text: "Error loading game data" });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAutoCategorizeAI = async () => {
    if (!formData.title.trim()) {
      setMessage({ type: "error", text: "Please enter a Game Title first to analyze categories." });
      return;
    }
    setIsCategorizingAI(true);
    try {
      const res = await axios.post("/api/admin/ai/categorize", {
        title: formData.title,
        description: formData.description,
        category: formData.categories
      });
      if (res.data?.success && res.data?.categories?.length > 0) {
        setFormData(prev => ({
          ...prev,
          categories: res.data.categories,
          orientation: res.data.orientation || prev.orientation
        }));
        setMessage({ type: "success", text: `✨ Categorized with AI: [${res.data.categories.join(", ")}]` });
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: `AI Error: ${err.response?.data?.error || err.message}` });
    } finally {
      setIsCategorizingAI(false);
    }
  };

  const handleGenerateAIDescription = async () => {
    if (!formData.title.trim()) {
      setMessage({ type: "error", text: "Please enter a Game Title first to generate an SEO description." });
      return;
    }
    setIsGeneratingAI(true);
    try {
      const res = await axios.post("/api/admin/ai/description", {
        title: formData.title,
        category: formData.categories,
        currentDescription: formData.description,
      });
      if (res.data?.success && res.data?.description) {
        setFormData(prev => ({ ...prev, description: res.data.description }));
        setMessage({ type: "success", text: "✨ AI SEO description generated successfully!" });
        setTimeout(() => setMessage(null), 3500);
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: `AI Error: ${err.response?.data?.error || err.message}` });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const toggleCategory = (cat: string) => {
    const newCats = formData.categories.includes(cat) 
      ? formData.categories.filter(c => c !== cat)
      : [...formData.categories, cat];
    setFormData({ ...formData, categories: newCats });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      setMessage({ type: "error", text: "Title and Slug are required." });
      return;
    }
    if (formData.categories.length === 0) {
      setMessage({ type: "error", text: "At least one category is required." });
      return;
    }

    try {
      setIsUploading(true);
      let finalPlayUrl = formData.playUrl;

      // If user uploaded a new ZIP file to replace existing build
      if (file) {
        setMessage({ type: "info", text: "Processing replacement ZIP..." });
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        const zipData = await zip.loadAsync(file);
        const files = Object.values(zipData.files).filter(f => !f.dir);
        
        let uploadedCount = 0;

        const getMimeType = (filename: string) => {
          const ext = filename.split('.').pop()?.toLowerCase();
          const mimeTypes: Record<string, string> = {
            'html': 'text/html', 'js': 'application/javascript', 'css': 'text/css',
            'json': 'application/json', 'png': 'image/png', 'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg', 'gif': 'image/gif', 'svg': 'image/svg+xml',
            'wasm': 'application/wasm', 'mp3': 'audio/mpeg', 'wav': 'audio/wav',
            'ogg': 'audio/ogg', 'mp4': 'video/mp4', 'txt': 'text/plain'
          };
          return mimeTypes[ext || ''] || 'application/octet-stream';
        };

        for (const zipEntry of files) {
          const rawBlob = await zipEntry.async("blob");
          const filePath = `games/${formData.slug}/${zipEntry.name}`;
          const contentType = getMimeType(zipEntry.name);
          const typedBlob = new Blob([rawBlob], { type: contentType });
          
          const { data: presigned } = await axios.post('/api/admin/upload', {
            filename: filePath,
            contentType: contentType
          });

          await axios.put(presigned.url, typedBlob, {
            headers: { "Content-Type": contentType }
          });
          
          uploadedCount++;
          setProgress(Math.round((uploadedCount / files.length) * 100));

          if (zipEntry.name.endsWith('index.html')) {
            finalPlayUrl = presigned.publicUrl;
          }
        }
      }

      setMessage({ type: "info", text: "Saving game changes to database..." });
      await axios.put(`/api/admin/games/${resolvedParams.id}`, {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        category: formData.categories,
        buildType: formData.buildType,
        thumbnailUrl: formData.thumbnailUrl,
        developer: formData.developer,
        platforms: formData.platforms,
        orientation: formData.orientation,
        status: formData.status,
        verified: formData.verified,
        ...(file ? { playUrl: finalPlayUrl } : {})
      });

      setMessage({ type: "success", text: "🎉 Game updated successfully! Redirecting..." });
      setTimeout(() => {
        router.push("/admin/games");
      }, 1200);
      
    } catch (error: any) {
      console.error(error);
      setMessage({ type: "error", text: `Error: ${error.message}` });
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setProgress(0);
      }, 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-24">
        <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
        <p className="text-xs text-zinc-400 font-medium">Loading game details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {/* Compact Frameless Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/admin/games" 
          className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0 active:scale-95"
          title="Back to games catalog"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <div className="w-6 h-6 rounded-[7px] bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
              <Gamepad2 className="w-3.5 h-3.5" />
            </div>
            Edit: <span className="truncate max-w-sm sm:max-w-md">{formData.title || "Game"}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Modify metadata, categories, visibility, and verification status.
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Live Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Form Column */}
        <div className="lg:col-span-8 border border-white/[0.08] rounded-[18px] p-4 sm:p-5 bg-white/[0.01] space-y-4 shadow-xs">
          <form onSubmit={handleUpdate} className="space-y-3.5">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Game Title <span className="text-white">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                  className="w-full bg-[#101012] border border-white/[0.08] focus:border-white/50 focus:ring-1 focus:ring-white/20 rounded-[12px] px-3 py-2 text-xs font-medium text-white placeholder-zinc-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  URL Slug <span className="text-white">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-[#101012] border border-white/[0.08] focus:border-white/50 focus:ring-1 focus:ring-white/20 rounded-[12px] px-3 py-2 text-xs font-mono text-zinc-300 placeholder-zinc-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Thumbnail URL & Play URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Thumbnail Image URL <span className="text-white">*</span>
                </label>
                <input 
                  type="url" 
                  required
                  value={formData.thumbnailUrl}
                  onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  className="w-full bg-[#101012] border border-white/[0.08] focus:border-white/50 focus:ring-1 focus:ring-white/20 rounded-[12px] px-3 py-2 text-xs font-medium text-white placeholder-zinc-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Direct Play URL / Embed
                </label>
                <input 
                  type="text" 
                  value={formData.playUrl}
                  onChange={e => setFormData({ ...formData, playUrl: e.target.value })}
                  className="w-full bg-[#101012] border border-white/[0.08] focus:border-white/50 focus:ring-1 focus:ring-white/20 rounded-[12px] px-3 py-2 text-xs font-mono text-zinc-300 placeholder-zinc-500 transition-all outline-none"
                />
              </div>
            </div>
            
            {/* Description & AI Generator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Description
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAIDescription}
                  disabled={isGeneratingAI || !formData.title.trim()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10.5px] font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-white" />
                      <span>Generating with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-white" />
                      <span>Generate AI Description</span>
                    </>
                  )}
                </button>
              </div>
              <textarea 
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-[#101012] border border-white/[0.08] focus:border-white/50 focus:ring-1 focus:ring-white/20 rounded-[12px] px-3 py-2 text-xs font-medium text-white placeholder-zinc-500 transition-all resize-none outline-none leading-relaxed"
              />
            </div>

            {/* Developer & Platforms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Developer / Publisher</label>
                <input 
                  type="text" 
                  required
                  value={formData.developer}
                  onChange={e => setFormData({ ...formData, developer: e.target.value })}
                  className="w-full bg-[#101012] border border-white/[0.08] focus:border-white/50 focus:ring-1 focus:ring-white/20 rounded-[12px] px-3 py-2 text-xs font-medium text-white transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Supported Platforms</label>
                <input 
                  type="text" 
                  required
                  value={formData.platforms}
                  onChange={e => setFormData({ ...formData, platforms: e.target.value })}
                  className="w-full bg-[#101012] border border-white/[0.08] focus:border-white/50 focus:ring-1 focus:ring-white/20 rounded-[12px] px-3 py-2 text-xs font-medium text-white transition-all outline-none"
                />
              </div>
            </div>

            {/* Visibility & Admin Verification Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-[14px] bg-[#101012] border border-white/[0.08]">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Visibility Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
                  className="w-full bg-black/40 border border-white/[0.08] rounded-[10px] px-3 py-1.5 text-xs text-white focus:border-white/50 outline-none cursor-pointer"
                >
                  <option value="published">Live (Published on website)</option>
                  <option value="draft">Draft (Hidden from players)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Admin Quality Verification</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, verified: !formData.verified })}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[10px] border transition-all text-xs font-semibold cursor-pointer active:scale-95 ${
                    formData.verified
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      : "bg-amber-500/10 border-amber-500/25 text-amber-300"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {formData.verified ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
                    {formData.verified ? "Admin Verified" : "Needs Verification"}
                  </span>
                  <span className="text-[10px] font-mono opacity-60">Click to toggle</span>
                </button>
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Categories <span className="text-white">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoCategorizeAI}
                  disabled={isCategorizingAI || !formData.title.trim()}
                  className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-zinc-300 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {isCategorizingAI ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Categorizing...</span>
                    </>
                  ) : (
                    <>
                      <Tag className="w-3 h-3" />
                      <span>Auto-Categorize with AI</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => {
                  const isSelected = formData.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all border cursor-pointer active:scale-95 ${
                        isSelected
                          ? "bg-white/15 text-white border-white/30 shadow-xs"
                          : "bg-white/[0.02] text-zinc-400 hover:text-white border-white/[0.06] hover:border-white/[0.12]"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Build Type & Orientation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Build Type</label>
                <select 
                  value={formData.buildType}
                  onChange={e => setFormData({ ...formData, buildType: e.target.value })}
                  className="w-full bg-[#101012] border border-white/[0.08] focus:border-white/50 rounded-[12px] px-3 py-2 text-xs font-medium text-white outline-none cursor-pointer"
                >
                  <option value="html5">HTML5 (zip with index.html)</option>
                  <option value="unity-webgl">Unity WebGL (zip)</option>
                  <option value="iframe-external">External iframe URL</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Required Orientation</label>
                <select 
                  value={formData.orientation}
                  onChange={e => setFormData({ ...formData, orientation: e.target.value })}
                  className="w-full bg-[#101012] border border-white/[0.08] focus:border-white/50 rounded-[12px] px-3 py-2 text-xs font-medium text-white outline-none cursor-pointer"
                >
                  <option value="any">Any (Fully Responsive)</option>
                  <option value="landscape">Force Landscape</option>
                  <option value="portrait">Force Portrait</option>
                </select>
              </div>
            </div>

            {/* Replace File Dropzone */}
            <div>
              <label className="block text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                Replace Game Build (Optional)
              </label>
              <div className={`border rounded-[14px] p-3 text-center transition-all relative overflow-hidden cursor-pointer ${
                file 
                  ? 'border-emerald-500/40 bg-emerald-500/10' 
                  : 'border-dashed border-white/[0.12] hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}>
                <input 
                  type="file" 
                  accept=".zip"
                  ref={fileInputRef}
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  id="file-upload"
                />
                <div className="pointer-events-none flex items-center justify-center gap-2.5">
                  <div className={`p-1.5 rounded-[8px] ${file ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.04] text-zinc-400"}`}>
                    {file ? <CheckCircle className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-semibold ${file ? 'text-emerald-300' : 'text-zinc-300'}`}>
                    {file ? file.name : "Choose a new ZIP file to replace existing build"}
                  </span>
                </div>
              </div>
            </div>

            {/* Alert Message */}
            {message && (
              <div className={`p-3 rounded-[12px] text-xs font-medium border ${
                message.type === 'error'
                  ? 'bg-red-500/10 text-red-300 border-red-500/25'
                  : message.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                  : 'bg-white/10 text-white border-white/20'
              }`}>
                {message.text}
              </div>
            )}

            {/* Progress Bar */}
            {isUploading && progress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Uploading replacement build...</span>
                  <span className="text-white font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-white h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isUploading || formData.categories.length === 0}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-2.5 px-4 rounded-full transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-[0.98] cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-4 border border-white/[0.08] rounded-[18px] p-4 bg-white/[0.01] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-white" />
              Live Preview
            </h3>
            <Link 
              href={`/games/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10.5px] text-zinc-400 hover:text-white font-semibold flex items-center gap-1"
            >
              Open Page <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Simulated Game Card */}
          <div className="max-w-[240px] mx-auto group flex flex-col transform-gpu">
            <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-white/30 transition-colors aspect-square flex items-center justify-center shadow-lg">
              {formData.thumbnailUrl ? (
                <img 
                  src={formData.thumbnailUrl} 
                  alt={formData.title || "Thumbnail"} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-600 p-4 text-center">
                  <Gamepad2 className="w-10 h-10 mb-1 opacity-40" />
                  <span className="text-[10.5px]">No thumbnail</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent flex items-end p-3 pointer-events-none">
                <div className="text-white font-semibold text-xs sm:text-sm line-clamp-1 drop-shadow-md">
                  {formData.title || "Game Title"}
                </div>
              </div>
            </div>
            <div className="mt-2 px-1 text-center shrink-0">
              <h4 className="text-xs sm:text-sm font-medium text-zinc-200 truncate">
                {formData.title || "Untitled Game"}
              </h4>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-[10px] text-zinc-400 truncate">
                  {formData.developer || "Bluebuff Games"}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                  {formData.categories[0] || "Action"}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata Specs Box */}
          <div className="p-3 bg-[#101012] border border-white/[0.08] rounded-[14px] space-y-2 text-xs">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider pb-1 border-b border-white/[0.06]">
              Status & Specs
            </div>
            
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500">Route Slug:</span>
              <span className="font-mono text-zinc-300 max-w-[150px] truncate">
                /games/{formData.slug || "..."}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500">Visibility:</span>
              <span className={`font-semibold capitalize ${formData.status === 'published' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {formData.status}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500">Admin Check:</span>
              <span className={`font-semibold ${formData.verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                {formData.verified ? 'Verified' : 'Unverified'}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500">Categories:</span>
              <span className="text-white font-medium">
                {formData.categories.length} tagged
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
