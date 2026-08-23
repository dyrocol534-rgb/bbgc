"use client";
import { useState, useRef, useEffect, use } from "react";
import JSZip from "jszip";
import axios from "axios";
import { UploadCloud, Loader2, CheckCircle, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "action", "adventure", "arcade", "board", "card", "clicker", 
  "driving", "io", "puzzle", "shooting", "sports", "multiplayer"
];

export default function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
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
      setMessage("Error loading game data");
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) return setMessage("Title and Slug are required");
    if (formData.categories.length === 0) return setMessage("At least one category is required");

    try {
      setIsUploading(true);
      
      let finalPlayUrl = formData.playUrl;

      // Only re-upload ZIP if a new one is selected
      if (file) {
        setMessage("Reading ZIP file...");
        const zip = new JSZip();
        const zipData = await zip.loadAsync(file);
        const files = Object.values(zipData.files).filter(f => !f.dir);
        
        let uploadedCount = 0;

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
          
          setMessage(`Preparing upload for ${zipEntry.name}...`);
          const { data: presigned } = await axios.post('/api/admin/upload', {
            filename: filePath,
            contentType: contentType
          });

          setMessage(`Uploading ${zipEntry.name} (${Math.round((typedBlob.size/1024/1024)*100)/100} MB)...`);
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

      setMessage("Updating database record...");
      await axios.patch(`/api/admin/games/${resolvedParams.id}`, {
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

      setMessage("Update complete!");
      setTimeout(() => {
        router.push("/admin/games");
      }, 1500);
      
    } catch (error: any) {
      console.error(error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setProgress(0);
        if (message !== "Update complete!") setMessage("");
      }, 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/games" className="p-2 bg-surface hover:bg-surface-hover rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <h2 className="text-xl font-bold text-text-main">Edit Game: {formData.title}</h2>
      </div>
      
      <form onSubmit={handleUpdate} className="space-y-6">
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
          <label className="block text-sm font-medium text-text-secondary mb-2">Thumbnail URL</label>
          <input 
            type="text" 
            required
            value={formData.thumbnailUrl}
            onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})}
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

        {/* Status & Admin Verification Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#121214] border border-[#1f1f22]">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Visibility Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as "draft" | "published"})}
              className="w-full bg-surface-hover border border-border-main rounded-lg p-2.5 text-xs text-text-main focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="published">Live (Published on website)</option>
              <option value="draft">Draft (Hidden from players)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Admin Quality Verification</label>
            <label className="flex items-center gap-3 p-2 rounded-lg bg-surface-hover border border-border-main cursor-pointer hover:border-zinc-600 transition-colors">
              <input
                type="checkbox"
                checked={formData.verified}
                onChange={e => setFormData({...formData, verified: e.target.checked})}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-zinc-900 border-zinc-700"
              />
              <span className="text-xs font-semibold text-zinc-200">
                {formData.verified ? "✅ Admin Verified (Tested & Working)" : "⚠️ Unverified (Needs Check)"}
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">Categories (Select Multiple)</label>
            <div className="flex flex-wrap gap-2">
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
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                    formData.categories.includes(cat)
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-surface-hover text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-700/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {formData.categories.length === 0 && (
              <p className="text-xs text-red-400 mt-2">Please select at least one category.</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Build Type</label>
              <select 
                value={formData.buildType}
                onChange={e => setFormData({...formData, buildType: e.target.value})}
                className="w-full bg-surface-hover border border-border-main rounded-lg p-3 text-text-main focus:ring-2 focus:ring-primary-hover outline-none transition-all"
              >
                <option value="html5">HTML5 (zip with index.html)</option>
                <option value="unity-webgl">Unity WebGL (zip)</option>
                <option value="iframe-external">External iframe URL</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Required Orientation</label>
              <select 
                value={formData.orientation}
                onChange={e => setFormData({...formData, orientation: e.target.value})}
                className="w-full bg-surface-hover border border-border-main rounded-lg p-3 text-text-main focus:ring-2 focus:ring-primary-hover outline-none transition-all"
              >
                <option value="any">Any (Fully Responsive)</option>
                <option value="landscape">Force Landscape</option>
                <option value="portrait">Force Portrait</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Update Game Files (Optional)</label>
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
                {file ? file.name : "Select a new ZIP to replace game files (Optional)"}
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
          disabled={isUploading || formData.categories.length === 0}
          className="w-full bg-primary hover:bg-primary-hover text-text-main font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
          ) : (
            <><Save className="w-5 h-5" /> Save Changes</>
          )}
        </button>
      </form>
    </div>
  );
}
