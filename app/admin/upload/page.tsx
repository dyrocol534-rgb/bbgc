"use client";

import { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import axios from "axios";
import { 
  UploadCloud, 
  Loader2, 
  CheckCircle, 
  Sparkles, 
  FileArchive, 
  Globe, 
  Gamepad2, 
  Layers, 
  ExternalLink,
  Code2,
  Tag,
  Info
} from "lucide-react";

const CATEGORIES = [
  "action", "adventure", "arcade", "board", "card", "clicker", 
  "driving", "io", "puzzle", "shooting", "sports", "multiplayer"
];

const BUILD_TYPES = [
  { id: "html5", label: "HTML5 Archive", icon: FileArchive, desc: "ZIP file with index.html" },
  { id: "unity-webgl", label: "Unity WebGL", icon: Layers, desc: "WebGL build ZIP" },
  { id: "iframe-external", label: "External Embed", icon: Globe, desc: "URL or iframe embed" },
];

export default function UploadGamePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [activeView, setActiveView] = useState<"form" | "preview">("form");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [randomSuffix, setRandomSuffix] = useState("");
  
  useEffect(() => {
    setRandomSuffix(Math.random().toString(36).substring(2, 7));
  }, []);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    categories: ["action"] as string[],
    buildType: "html5",
    developer: "Bluebuff Games",
    platforms: "Browser (desktop, mobile, tablet)",
    thumbnailUrl: "",
    gameUrl: ""
  });

  const handleTitleChange = (val: string) => {
    const slugBase = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newSlug = slugBase ? (randomSuffix ? `${slugBase}-${randomSuffix}` : slugBase) : "";
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: newSlug
    }));
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

  const handleUpload = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!formData.title || !formData.slug) {
      setMessage({ type: "error", text: "Title and Slug are required." });
      return;
    }
    if (formData.categories.length === 0) {
      setMessage({ type: "error", text: "At least one category is required." });
      return;
    }

    // Handle Embed/Iframe type
    if (formData.buildType === 'iframe-external') {
      if (!formData.gameUrl) {
        setMessage({ type: "error", text: "Game URL is required for embedded games." });
        return;
      }
      
      // Auto-extract URL if they accidentally pasted the full iframe code
      let finalUrl = formData.gameUrl;
      const iframeMatch = finalUrl.match(/src=["']([^"']+)["']/);
      if (iframeMatch && iframeMatch[1]) {
        finalUrl = iframeMatch[1];
      }
      
      try {
        setIsUploading(true);
        setMessage({ type: "info", text: "Creating database record..." });
        await axios.post('/api/games', {
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          category: formData.categories,
          buildType: formData.buildType,
          source: "aggregated",
          playUrl: finalUrl,
          thumbnailUrl: formData.thumbnailUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
          status: "published",
          developer: formData.developer,
          platforms: formData.platforms
        });
        
        setMessage({ type: "success", text: "🎉 Game published and embedded successfully!" });
        
        // Reset form and suffix
        setFormData({
          title: "", slug: "", description: "", categories: ["action"], 
          buildType: "html5", developer: "Bluebuff Games", 
          platforms: "Browser (desktop, mobile, tablet)", thumbnailUrl: "", gameUrl: ""
        });
        setRandomSuffix(Math.random().toString(36).substring(2, 7));
        setTimeout(() => setMessage(null), 4000);
      } catch (error: any) {
        console.error(error);
        setMessage({ type: "error", text: `Error: ${error.message}` });
      } finally {
        setIsUploading(false);
      }
      return;
    }

    if (!file) {
      setMessage({ type: "error", text: "Please select a ZIP file." });
      return;
    }

    try {
      setIsUploading(true);
      setMessage({ type: "info", text: "Reading ZIP archive..." });
      
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
      const files = Object.values(zipData.files).filter(f => !f.dir);
      
      let uploadedCount = 0;
      let playUrl = "";

      const getMimeType = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
          'html': 'text/html',
          'js': 'application/javascript',
          'css': 'text/css',
          'json': 'application/json',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'gif': 'image/gif',
          'svg': 'image/svg+xml',
          'wasm': 'application/wasm',
          'mp3': 'audio/mpeg',
          'wav': 'audio/wav',
          'ogg': 'audio/ogg',
          'mp4': 'video/mp4',
          'txt': 'text/plain'
        };
        return mimeTypes[ext || ''] || 'application/octet-stream';
      };

      for (const zipEntry of files) {
        const rawBlob = await zipEntry.async("blob");
        const filePath = `games/${formData.slug}/${zipEntry.name}`;
        const contentType = getMimeType(zipEntry.name);
        
        const typedBlob = new Blob([rawBlob], { type: contentType });
        
        // 1. Get presigned URL
        setMessage({ type: "info", text: `Preparing upload for ${zipEntry.name}...` });
        const { data: presigned } = await axios.post('/api/admin/upload', {
          filename: filePath,
          contentType: contentType
        });

        // 2. Upload directly to R2
        setMessage({ type: "info", text: `Uploading ${zipEntry.name} (${Math.round((typedBlob.size/1024/1024)*100)/100} MB)...` });
        await axios.put(presigned.url, typedBlob, {
          headers: { "Content-Type": contentType }
        });
        
        uploadedCount++;
        setProgress(Math.round((uploadedCount / files.length) * 100));

        // Find index.html for playUrl
        if (zipEntry.name.endsWith('index.html')) {
          playUrl = presigned.publicUrl;
        }
      }

      setMessage({ type: "info", text: "Creating database catalog record..." });
      await axios.post('/api/games', {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        category: formData.categories,
        buildType: formData.buildType,
        source: "own",
        playUrl: playUrl || `https://cdn.dummy.com/games/${formData.slug}/index.html`,
        thumbnailUrl: formData.thumbnailUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
        status: "published",
        developer: formData.developer,
        platforms: formData.platforms
      });

      setMessage({ type: "success", text: "🎉 Game published and uploaded successfully!" });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Reset form and suffix
      setFormData({
        title: "", slug: "", description: "", categories: ["action"], 
        buildType: "html5", developer: "Bluebuff Games", 
        platforms: "Browser (desktop, mobile, tablet)", thumbnailUrl: "", gameUrl: ""
      });
      setRandomSuffix(Math.random().toString(36).substring(2, 7));
      setTimeout(() => setMessage(null), 4000);
      
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

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <div className="w-6 h-6 rounded-[7px] bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <UploadCloud className="w-3.5 h-3.5" />
            </div>
            Upload Game
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Add HTML5 zip builds or embed external games to the Bluebuff catalog.
          </p>
        </div>

        {/* Mobile View Toggle Segmented Control (Visible only on < lg screens) */}
        <div className="flex lg:hidden items-center p-0.5 bg-black/40 border border-white/[0.08] rounded-full text-xs shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveView("form")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
              activeView === "form"
                ? "bg-white/[0.12] text-white font-semibold shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Form Details
          </button>
          <button
            type="button"
            onClick={() => setActiveView("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
              activeView === "preview"
                ? "bg-white/[0.12] text-white font-semibold shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Gamepad2 className="w-3 h-3 text-orange-400" />
            Live Preview
          </button>
        </div>
      </div>

      {/* Build Type Segmented Switcher (Grid layout for equal width on mobile) */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 border border-white/[0.08] rounded-[14px] sm:rounded-[16px] w-full max-w-xl">
        {BUILD_TYPES.map((bt) => {
          const Icon = bt.icon;
          const isSelected = formData.buildType === bt.id;
          return (
            <button
              key={bt.id}
              type="button"
              onClick={() => setFormData({ ...formData, buildType: bt.id })}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 sm:px-3 rounded-[10px] sm:rounded-[12px] text-[11px] sm:text-xs font-medium transition-all cursor-pointer text-center ${
                isSelected
                  ? "bg-white/[0.12] text-white shadow-xs font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-orange-400" : "text-zinc-500"}`} />
              <span className="truncate">{bt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Form Column */}
        <div className={`lg:col-span-8 border border-white/[0.08] rounded-[18px] p-3.5 sm:p-5 bg-white/[0.01] space-y-4 shadow-xs ${
          activeView === "form" ? "block" : "hidden lg:block"
        }`}>
          <form onSubmit={handleUpload} className="space-y-3.5">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] sm:text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Game Title <span className="text-orange-400">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. Cyber Rush 3D"
                  className="w-full bg-[#101012] border border-white/[0.08] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-[12px] px-3 py-2 text-xs font-medium text-white placeholder-zinc-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  URL Slug <span className="text-orange-400">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. cyber-rush-3d"
                  className="w-full bg-[#101012] border border-white/[0.08] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-[12px] px-3 py-2 text-xs font-mono text-zinc-300 placeholder-zinc-500 transition-all outline-none"
                />
              </div>
            </div>
            
            {/* Thumbnail URL */}
            <div>
              <label className="block text-[10px] sm:text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                Thumbnail Image URL <span className="text-orange-400">*</span>
              </label>
              <input 
                type="url" 
                required
                value={formData.thumbnailUrl}
                onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="https://images.unsplash.com/... or CDN link"
                className="w-full bg-[#101012] border border-white/[0.08] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-[12px] px-3 py-2 text-xs font-medium text-white placeholder-zinc-500 transition-all outline-none"
              />
            </div>
            
            {/* Description & AI Generator */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <label className="block text-[10px] sm:text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Description
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAIDescription}
                  disabled={isGeneratingAI || !formData.title.trim()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] sm:text-[10.5px] font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                  title="Generate high-converting SEO description using Gemini AI"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-orange-400 shrink-0" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-orange-400 shrink-0" />
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>
              </div>
              <textarea 
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Write or generate an SEO-optimized game description..."
                rows={2}
                className="w-full bg-[#101012] border border-white/[0.08] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-[12px] px-3 py-2 text-xs font-medium text-white placeholder-zinc-500 transition-all resize-none outline-none leading-relaxed"
              />
            </div>

            {/* Developer & Platforms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] sm:text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Developer / Publisher
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.developer}
                  onChange={e => setFormData({ ...formData, developer: e.target.value })}
                  className="w-full bg-[#101012] border border-white/[0.08] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-[12px] px-3 py-2 text-xs font-medium text-white placeholder-zinc-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Supported Platforms
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.platforms}
                  onChange={e => setFormData({ ...formData, platforms: e.target.value })}
                  className="w-full bg-[#101012] border border-white/[0.08] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-[12px] px-3 py-2 text-xs font-medium text-white placeholder-zinc-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] sm:text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Categories <span className="text-orange-400">*</span>
                </label>
                <span className="text-[10px] text-zinc-500">
                  {formData.categories.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {CATEGORIES.map(cat => {
                  const isSelected = formData.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider transition-all border cursor-pointer active:scale-95 ${
                        isSelected
                          ? "bg-orange-500/15 text-orange-300 border-orange-500/35 shadow-xs"
                          : "bg-white/[0.02] text-zinc-400 hover:text-white border-white/[0.06] hover:border-white/[0.12]"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              {formData.categories.length === 0 && (
                <p className="text-[10px] font-medium text-red-400 mt-1">Please select at least one category.</p>
              )}
            </div>

            {/* Game Files / Embed Target */}
            {formData.buildType === 'iframe-external' ? (
              <div>
                <label className="block text-[10px] sm:text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Game URL or Iframe Code <span className="text-orange-400">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.gameUrl}
                  onChange={e => setFormData({ ...formData, gameUrl: e.target.value })}
                  placeholder='https://... OR <iframe src="...">'
                  className="w-full bg-[#101012] border border-white/[0.08] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-[12px] px-3 py-2 text-xs font-medium text-white placeholder-zinc-500 transition-all outline-none"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Paste the direct play URL or embed code from GameDistribution, Famobi, or Poki.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] sm:text-[10.5px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Game Archive (ZIP) <span className="text-orange-400">*</span>
                </label>
                <div className={`border rounded-[14px] p-3.5 sm:p-4 text-center transition-all relative overflow-hidden cursor-pointer ${
                  file 
                    ? 'border-emerald-500/40 bg-emerald-500/10' 
                    : 'border-dashed border-white/[0.12] hover:border-orange-500/40 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}>
                  <input 
                    type="file" 
                    accept=".zip"
                    ref={fileInputRef}
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    id="file-upload"
                  />
                  <div className="pointer-events-none flex items-center justify-center gap-2.5 sm:gap-3 px-2">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] flex items-center justify-center shrink-0 ${
                      file ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.04] text-zinc-400"
                    }`}>
                      {file ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <UploadCloud className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className={`text-xs font-semibold truncate w-full max-w-[200px] sm:max-w-md ${file ? 'text-emerald-300' : 'text-zinc-200'}`}>
                        {file ? file.name : "Click or drag ZIP file here"}
                      </span>
                      <span className="text-[10px] sm:text-[10.5px] text-zinc-500 truncate w-full">
                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB ready for upload` : "Must contain index.html at root"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message Alert */}
            {message && (
              <div className={`p-3 rounded-[12px] text-xs font-medium border flex items-center gap-2 ${
                message.type === 'error'
                  ? 'bg-red-500/10 text-red-300 border-red-500/25'
                  : message.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                  : 'bg-orange-500/10 text-orange-300 border-orange-500/25'
              }`}>
                <Info className="w-4 h-4 shrink-0" />
                <span className="flex-1 leading-relaxed">{message.text}</span>
              </div>
            )}

            {/* Progress Bar */}
            {isUploading && progress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Uploading files to R2 storage...</span>
                  <span className="text-orange-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isUploading || formData.categories.length === 0}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2.5 px-4 rounded-full transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-[0.98] cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing & Uploading Game...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Publish Game to Catalog</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column (Sticky on desktop, toggleable on mobile) */}
        <div className={`lg:col-span-4 border border-white/[0.08] rounded-[18px] p-3.5 sm:p-4 bg-white/[0.01] space-y-4 lg:sticky lg:top-6 self-start ${
          activeView === "preview" ? "block" : "hidden lg:block"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-orange-400" />
              Live Catalog Preview
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-mono">1:1 Aspect</span>
              <button
                type="button"
                onClick={() => setActiveView("form")}
                className="lg:hidden text-[10.5px] font-medium text-orange-400 hover:text-orange-300 underline underline-offset-2 cursor-pointer"
              >
                Back to Form
              </button>
            </div>
          </div>

          {/* Simulated Game Card */}
          <div className="max-w-[220px] sm:max-w-[240px] mx-auto group flex flex-col transform-gpu">
            <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-orange-500/40 transition-colors aspect-square flex items-center justify-center shadow-lg">
              {formData.thumbnailUrl ? (
                <img 
                  src={formData.thumbnailUrl} 
                  alt={formData.title || "Thumbnail Preview"} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder on error
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-600 p-4 text-center">
                  <Gamepad2 className="w-10 h-10 mb-1 opacity-40" />
                  <span className="text-[10.5px]">Paste thumbnail URL to preview</span>
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
                <span className="text-[10px] text-orange-400 uppercase font-semibold">
                  {formData.categories[0] || "Action"}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata Specs Box */}
          <div className="p-3 bg-[#101012] border border-white/[0.08] rounded-[14px] space-y-2 text-xs">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider pb-1 border-b border-white/[0.06]">
              Game Specifications
            </div>
            
            <div className="flex justify-between items-center text-[11px] gap-2">
              <span className="text-zinc-500 shrink-0">Route Slug:</span>
              <span className="font-mono text-zinc-300 truncate text-right">
                /games/{formData.slug || "..."}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px] gap-2">
              <span className="text-zinc-500 shrink-0">Build Source:</span>
              <span className="text-zinc-300 font-medium capitalize">
                {formData.buildType === 'iframe-external' ? 'External Embed' : 'Self-Hosted R2'}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px] gap-2">
              <span className="text-zinc-500 shrink-0">Status:</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Auto-Publish
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px] gap-2">
              <span className="text-zinc-500 shrink-0">Categories:</span>
              <span className="text-orange-400 font-medium">
                {formData.categories.length} tagged
              </span>
            </div>
          </div>

          {/* Mobile Direct Submit Button inside Preview tab */}
          <div className="lg:hidden pt-1">
            <button 
              type="button" 
              onClick={() => handleUpload()}
              disabled={isUploading || formData.categories.length === 0}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2.5 px-4 rounded-full transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-[0.98] cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing & Uploading Game...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Publish Game to Catalog</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
