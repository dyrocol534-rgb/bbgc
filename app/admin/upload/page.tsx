"use client";
import { useState, useRef } from "react";
import JSZip from "jszip";
import axios from "axios";
import { UploadCloud, Loader2, CheckCircle } from "lucide-react";

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
    category: "action",
    buildType: "html5",
    developer: "CloudGames",
    platforms: "Browser (desktop, mobile, tablet)"
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setMessage("Please select a ZIP file");
    if (!formData.title || !formData.slug) return setMessage("Title and Slug are required");

    try {
      setIsUploading(true);
      setMessage("Reading ZIP file...");
      
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
      const files = Object.values(zipData.files).filter(f => !f.dir);
      
      let uploadedCount = 0;
      let playUrl = "";
      const thumbnailUrl = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"; // Using dummy thumbnail for now

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
        category: [formData.category],
        buildType: formData.buildType,
        source: "own",
        playUrl: playUrl || `https://cdn.dummy.com/games/${formData.slug}/index.html`,
        thumbnailUrl: thumbnailUrl,
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
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-text-main mb-6">Upload New Game</h2>
      
      <form onSubmit={handleUpload} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Game Title</label>
          <input 
            type="text" 
            required
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})}
            className="w-full bg-surface-hover border border-border-main rounded-lg p-3 text-text-main focus:ring-2 focus:ring-primary-hover outline-none transition-all"
          />
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
          <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
          <textarea 
            required
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-surface-hover border border-border-main rounded-lg p-3 text-text-main focus:ring-2 focus:ring-primary-hover outline-none h-24 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Developer</label>
            <input 
              type="text" 
              required
              value={formData.developer}
              onChange={e => setFormData({...formData, developer: e.target.value})}
              className="w-full bg-surface-hover border border-border-main rounded-lg p-3 text-text-main focus:ring-2 focus:ring-primary-hover outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Platforms</label>
            <input 
              type="text" 
              required
              value={formData.platforms}
              onChange={e => setFormData({...formData, platforms: e.target.value})}
              className="w-full bg-surface-hover border border-border-main rounded-lg p-3 text-text-main focus:ring-2 focus:ring-primary-hover outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-surface-hover border border-border-main rounded-lg p-3 text-text-main focus:ring-2 focus:ring-primary-hover outline-none transition-all"
            >
              <option value="action">Action</option>
              <option value="adventure">Adventure</option>
              <option value="arcade">Arcade</option>
              <option value="board">Board</option>
              <option value="card">Card</option>
              <option value="clicker">Clicker</option>
              <option value="driving">Driving</option>
              <option value="io">.io</option>
              <option value="puzzle">Puzzle</option>
              <option value="shooting">Shooting</option>
              <option value="sports">Sports</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Build Type</label>
            <select 
              value={formData.buildType}
              onChange={e => setFormData({...formData, buildType: e.target.value})}
              className="w-full bg-surface-hover border border-border-main rounded-lg p-3 text-text-main focus:ring-2 focus:ring-primary-hover outline-none transition-all"
            >
              <option value="html5">HTML5 (zip with index.html)</option>
              <option value="unity-webgl">Unity WebGL (zip)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Game Files (ZIP)</label>
          <div className={`border-2 rounded-lg p-8 text-center transition-colors relative overflow-hidden ${
            file 
              ? 'border-solid border-green-500 bg-green-500/10' 
              : 'border-dashed border-border-strong hover:border-primary-light bg-surface'
          }`}>
            <input 
              type="file" 
              accept=".zip"
              ref={fileInputRef}
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              id="file-upload"
            />
            <div className="pointer-events-none flex flex-col items-center">
              {file ? (
                <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
              ) : (
                <UploadCloud className="w-10 h-10 text-text-muted mb-3" />
              )}
              <span className={`text-sm font-medium ${file ? 'text-green-400' : 'text-text-secondary'}`}>
                {file ? file.name : "Click to select or drag & drop ZIP file"}
              </span>
              <span className={`text-xs mt-1 ${file ? 'text-green-500/70' : 'text-text-placeholder'}`}>
                {file ? "Ready to upload!" : "ZIP should contain index.html at the root"}
              </span>
            </div>
          </div>
        </div>

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
          disabled={isUploading}
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
