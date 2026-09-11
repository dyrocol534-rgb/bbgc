"use client";
import { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import axios from "axios";
import { UploadCloud, Loader2, CheckCircle, Sparkles } from "lucide-react";

const CATEGORIES = [
  "action", "adventure", "arcade", "board", "card", "clicker", 
  "driving", "io", "puzzle", "shooting", "sports", "multiplayer"
];

export default function UploadGamePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
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

  const handleGenerateAIDescription = async () => {
    if (!formData.title.trim()) {
      setMessage("Please enter a Game Title first to generate an SEO description.");
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
        setMessage("✨ AI SEO description generated successfully!");
        setTimeout(() => setMessage(""), 3500);
      }
    } catch (err: any) {
      console.error(err);
      setMessage(`AI Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) return setMessage("Title and Slug are required");
    if (formData.categories.length === 0) return setMessage("At least one category is required");

    // Handle Embed/Iframe type
    if (formData.buildType === 'iframe-external') {
      if (!formData.gameUrl) return setMessage("Game URL is required for embedded games");
      
      // Auto-extract URL if they accidentally pasted the full iframe code
      let finalUrl = formData.gameUrl;
      const iframeMatch = finalUrl.match(/src=["']([^"']+)["']/);
      if (iframeMatch && iframeMatch[1]) {
        finalUrl = iframeMatch[1];
      }
      
      try {
        setIsUploading(true);
        setMessage("Creating database record...");
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
        
        setMessage("Game embedded successfully!");
        setTimeout(() => {
          setMessage("");
        }, 3000);
        
        // Reset form and suffix
        setFormData({
          title: "", slug: "", description: "", categories: ["action"], 
          buildType: "html5", developer: "Bluebuff Games", 
          platforms: "Browser (desktop, mobile, tablet)", thumbnailUrl: "", gameUrl: ""
        });
        setRandomSuffix(Math.random().toString(36).substring(2, 7));
      } catch (error: any) {
        console.error(error);
        setMessage(`Error: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
      return;
    }

    if (!file) return setMessage("Please select a ZIP file");

    try {
      setIsUploading(true);
      setMessage("Reading ZIP file...");
      
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
        
        // Re-create the blob with the explicit content type so Axios/Browser doesn't override it
        const typedBlob = new Blob([rawBlob], { type: contentType });
        
        // 1. Get presigned URL
        setMessage(`Preparing upload for ${zipEntry.name}...`);
        const { data: presigned } = await axios.post('/api/admin/upload', {
          filename: filePath,
          contentType: contentType
        });

        // 2. Upload directly to R2
        setMessage(`Uploading ${zipEntry.name} (${Math.round((typedBlob.size/1024/1024)*100)/100} MB)...`);
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

      setMessage("Creating database record...");
      await axios.post('/api/games', {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        category: formData.categories,
        buildType: formData.buildType,
        source: "own",
        playUrl: playUrl || `https://cdn.dummy.com/games/${formData.slug}/index.html`,
        thumbnailUrl: formData.thumbnailUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
        status: "published", // auto publish for MVP
        developer: formData.developer,
        platforms: formData.platforms
      });

      setMessage("Upload complete!");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Reset form and suffix
      setFormData({
        title: "", slug: "", description: "", categories: ["action"], 
        buildType: "html5", developer: "Bluebuff Games", 
        platforms: "Browser (desktop, mobile, tablet)", thumbnailUrl: "", gameUrl: ""
      });
      setRandomSuffix(Math.random().toString(36).substring(2, 7));
      
    } catch (error: any) {
      console.error(error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setProgress(0);
        setMessage("");
      }, 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-indigo-400" />
          Upload New Game
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Upload HTML5 game archives or embed external games.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-4 sm:p-5">
        <form onSubmit={handleUpload} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Game Title</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') + (e.target.value ? '-' + randomSuffix : '')})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:border-zinc-700 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">URL Slug</label>
              <input 
                type="text" 
                required
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:border-zinc-700 focus:outline-none transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Thumbnail URL</label>
            <input 
              type="url" 
              required
              value={formData.thumbnailUrl}
              onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})}
              placeholder="https://..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:border-zinc-700 focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={isGeneratingAI || !formData.title.trim()}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Generate high-converting SEO description using Gemini AI"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
            <textarea 
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Write or generate an SEO-optimized game description..."
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:border-zinc-700 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Developer</label>
              <input 
                type="text" 
                required
                value={formData.developer}
                onChange={e => setFormData({...formData, developer: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:border-zinc-700 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Platforms</label>
              <input 
                type="text" 
                required
                value={formData.platforms}
                onChange={e => setFormData({...formData, platforms: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:border-zinc-700 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Categories</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      const newCats = formData.categories.includes(cat) 
                        ? formData.categories.filter(c => c !== cat)
                        : [...formData.categories, cat];
                      setFormData({...formData, categories: newCats});
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider transition-colors border ${
                      formData.categories.includes(cat)
                        ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {formData.categories.length === 0 && (
                <p className="text-[10px] font-medium text-red-400 mt-1">Please select at least one category.</p>
              )}
            </div>
            
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Build Type</label>
              <select 
                value={formData.buildType}
                onChange={e => setFormData({...formData, buildType: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:border-zinc-700 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="html5">HTML5 (zip with index.html)</option>
                <option value="unity-webgl">Unity WebGL (zip)</option>
                <option value="iframe-external">Embed from URL (External Game)</option>
              </select>
            </div>
          </div>

          {formData.buildType === 'iframe-external' ? (
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Game URL or Iframe</label>
              <input 
                type="text" 
                required
                value={formData.gameUrl}
                onChange={e => setFormData({...formData, gameUrl: e.target.value})}
                placeholder='https://... OR <iframe src="...">'
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:border-zinc-700 focus:outline-none transition-colors"
              />
              <p className="text-[10px] font-medium text-zinc-500 mt-1">
                Paste the "Example URL" or the full "Embed" iframe code from the provider.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Game Files (ZIP)</label>
              <div className={`border rounded-lg p-3 text-center transition-all relative overflow-hidden ${
                file 
                  ? 'border-emerald-500/40 bg-emerald-500/10' 
                  : 'border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/60'
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
                  {file ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <UploadCloud className="w-4 h-4 text-zinc-500" />
                  )}
                  <div className="flex flex-col items-start">
                    <span className={`text-xs font-semibold ${file ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {file ? file.name : "Click or drag ZIP file here"}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {file ? "Ready to upload!" : "Must contain index.html at root"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`p-2.5 rounded-lg text-xs font-semibold border ${message.includes('Error') ? 'bg-red-950/30 text-red-400 border-red-500/20' : 'bg-zinc-900 text-zinc-300 border-zinc-800'}`}>
              {message}
            </div>
          )}

          {isUploading && progress > 0 && (
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-2 mb-3 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isUploading || formData.categories.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Publish Game</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
