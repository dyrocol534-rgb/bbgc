"use client";
import { useState, useRef } from "react";
import JSZip from "jszip";
import axios from "axios";
import { UploadCloud, Loader2, CheckCircle } from "lucide-react";

const CATEGORIES = [
  "action", "adventure", "arcade", "board", "card", "clicker", 
  "driving", "io", "puzzle", "shooting", "sports", "multiplayer"
];

export default function UploadGamePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    <div className="max-w-3xl mx-auto bg-surface border border-zinc-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <UploadCloud className="w-5 h-5 text-indigo-400" />
        Upload New Game
      </h2>
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Game Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">URL Slug</label>
            <input 
              type="text" 
              required
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">URL Slug</label>
          <input 
            type="text" 
            required
            value={formData.slug}
            onChange={e => setFormData({...formData, slug: e.target.value})}
            className="w-full bg-surface-hover border border-border-main rounded-lg p-3 text-text-main focus:ring-2 focus:ring-primary-hover outline-none transition-all"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Thumbnail URL</label>
          <input 
            type="url" 
            required
            value={formData.thumbnailUrl}
            onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})}
            placeholder="https://..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
          <textarea 
            required
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none h-16 transition-colors resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Developer</label>
            <input 
              type="text" 
              required
              value={formData.developer}
              onChange={e => setFormData({...formData, developer: e.target.value})}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Platforms</label>
            <input 
              type="text" 
              required
              value={formData.platforms}
              onChange={e => setFormData({...formData, platforms: e.target.value})}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Categories (Select Multiple)</label>
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
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                    formData.categories.includes(cat)
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                      : 'bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {formData.categories.length === 0 && (
              <p className="text-[10px] text-red-400 mt-1">Please select at least one category.</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Build Type</label>
            <select 
              value={formData.buildType}
              onChange={e => setFormData({...formData, buildType: e.target.value})}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
            >
              <option value="html5">HTML5 (zip with index.html)</option>
              <option value="unity-webgl">Unity WebGL (zip)</option>
              <option value="iframe-external">Embed from URL (External Game)</option>
            </select>
          </div>
        </div>

        {formData.buildType === 'iframe-external' ? (
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Game URL or Iframe Code</label>
            <input 
              type="text" 
              required
              value={formData.gameUrl}
              onChange={e => setFormData({...formData, gameUrl: e.target.value})}
              placeholder='https://html5.gamedistribution.com/... OR <iframe src="...">'
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Paste the "Example URL" or the full "Embed" iframe code from the provider.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Game Files (ZIP)</label>
            <div className={`border-2 rounded-lg p-4 text-center transition-colors relative overflow-hidden ${
              file 
                ? 'border-solid border-emerald-500/50 bg-emerald-500/10' 
                : 'border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/30'
            }`}>
              <input 
                type="file" 
                accept=".zip"
                ref={fileInputRef}
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                id="file-upload"
              />
              <div className="pointer-events-none flex items-center justify-center gap-3">
                {file ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-zinc-400" />
                )}
                <div className="flex flex-col items-start">
                  <span className={`text-sm font-bold ${file ? 'text-emerald-400' : 'text-zinc-300'}`}>
                    {file ? file.name : "Click or drag ZIP file here"}
                  </span>
                  <span className={`text-[10px] ${file ? 'text-emerald-500/70' : 'text-zinc-500'}`}>
                    {file ? "Ready to upload!" : "Must contain index.html at root"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('Error') ? 'bg-red-900/50 text-red-200' : 'bg-surface-hover text-text-secondary'}`}>
            {message}
          </div>
        )}

        {isUploading && progress > 0 && (
          <div className="w-full bg-surface-hover rounded-full h-2 mb-4">
            <div className="bg-primary-hover h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}

        <button 
          type="submit" 
          disabled={isUploading || formData.categories.length === 0}
          className="w-full bg-primary hover:bg-primary-hover text-text-main font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
          ) : (
            <><CheckCircle className="w-5 h-5" /> Publish Game</>
          )}
        </button>
      </form>
    </div>
  );
}
