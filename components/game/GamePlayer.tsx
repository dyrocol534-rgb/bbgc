"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal, preconnect, prefetchDNS } from 'react-dom';
import { Maximize, Minimize, Loader2, ThumbsUp, ThumbsDown, Heart, MessageSquareWarning, Smartphone, X, Play, RotateCcw, Gamepad2 } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';
import { ConsoleLoader } from '@/components/ui/ConsoleLoader';
import Image from 'next/image';

interface GamePlayerProps {
  game: {
    slug: string;
    title: string;
    playUrl: string;
    width: number;
    height: number;
    orientation: string;
    thumbnailUrl: string;
    likes?: string[];
    dislikes?: string[];
  };
}

export default function GamePlayer({ game }: GamePlayerProps) {
  try {
    const origin = new URL(game.playUrl).origin;
    preconnect(origin, { crossOrigin: 'anonymous' });
    prefetchDNS(origin);
  } catch (e) {}

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileFS, setIsMobileFS] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  const [likeCount, setLikeCount] = useState(game.likes?.length || 0);
  const [dislikeCount, setDislikeCount] = useState(game.dislikes?.length || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setCurrentUrl(window.location.href);
    axios.post(`/api/games/${game.slug}/interact`, { action: 'status' })
      .then(res => {
        setIsLiked(res.data.isLiked);
        setIsDisliked(res.data.isDisliked);
        setIsFavorited(res.data.isFavorited);
        setLikeCount(res.data.likeCount);
        setDislikeCount(res.data.dislikeCount);
      }).catch(console.error);
  }, [game.slug]);

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => setIsLoading(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      axios.post(`/api/games/${game.slug}/play`).catch(console.error);
      try {
        const stored = localStorage.getItem('recentlyPlayed');
        let recent = stored ? JSON.parse(stored) : [];
        recent = recent.filter((s: string) => s !== game.slug);
        recent.unshift(game.slug);
        if (recent.length > 20) recent.pop();
        localStorage.setItem('recentlyPlayed', JSON.stringify(recent));
      } catch (e) {}
    }
  }, [isPlaying, game.slug]);

  // Playtime Tracker: Ping server every 60 seconds while playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        // Send elapsedSeconds = 60 to the server
        axios.post('/api/user/playtime', { elapsedSeconds: 60 }).catch(() => {
          // Ignore errors (user might not be logged in)
        });
      }, 60000); // 60 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Auto-enter mobile fullscreen on play
  useEffect(() => {
    if (isPlaying && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileFS(true);
    }
  }, [isPlaying]);

  // Hide/show page elements during mobile FS by direct DOM manipulation
  useEffect(() => {
    // Find the layout elements
    const navbar = document.querySelector('nav.fixed') as HTMLElement | null;
    const sidebar = document.querySelector('aside') as HTMLElement | null;
    const mobileToggle = document.querySelector('button.md\\:hidden.fixed') as HTMLElement | null;
    const footer = document.querySelector('footer') as HTMLElement | null;

    if (isMobileFS) {
      document.body.style.overflow = 'hidden';
      if (navbar) navbar.style.display = 'none';
      if (sidebar) sidebar.style.display = 'none';
      if (mobileToggle) mobileToggle.style.display = 'none';
      if (footer) footer.style.display = 'none';
    } else {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
      if (sidebar) sidebar.style.display = '';
      if (mobileToggle) mobileToggle.style.display = '';
      if (footer) footer.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
      if (sidebar) sidebar.style.display = '';
      if (mobileToggle) mobileToggle.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, [isMobileFS]);

  const exitMobileFS = () => {
    setIsMobileFS(false);
    setIsPlaying(false);
  };

  const rotateScreen = async () => {
    try {
      // Must be in native fullscreen for orientation.lock() to work
      const docEl = document.documentElement as any;
      if (!document.fullscreenElement) {
        const requestFS = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen;
        if (requestFS) await requestFS.call(docEl).catch(() => {});
      }
      const orient = screen.orientation as any;
      if (orient && orient.lock && orient.type) {
        const newOrientation = orient.type.startsWith('portrait') ? 'landscape' : 'portrait';
        await orient.lock(newOrientation);
      }
    } catch (e) {
      console.log('Orientation lock failed:', e);
    }
  };

  // Desktop fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const closeQrModal = useCallback(() => setShowQrModal(false), []);
  const closeFeedbackModal = useCallback(() => {
    setShowFeedbackModal(false);
    setFeedbackText('');
  }, []);

  const handleInteract = async (action: 'like' | 'dislike' | 'favorite') => {
    try {
      const res = await axios.post(`/api/games/${game.slug}/interact`, { action });
      setIsLiked(res.data.isLiked);
      setIsDisliked(res.data.isDisliked);
      setIsFavorited(res.data.isFavorited);
      setLikeCount(res.data.likeCount);
      setDislikeCount(res.data.dislikeCount);
    } catch (error: any) {
      if (error.response?.status === 401) alert("Please log in to perform this action.");
    }
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;
    setIsSubmittingFeedback(true);
    try {
      await axios.post(`/api/games/${game.slug}/interact`, { action: 'feedback', message: feedbackText });
      alert("Feedback submitted successfully!");
      closeFeedbackModal();
    } catch (error: any) {
      if (error.response?.status === 401) alert("Please log in to submit feedback.");
      else alert("Failed to submit feedback.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const aspectRatio = game.width && game.height ? `${game.width}/${game.height}` : '16/9';
  const cleanThumb = (game.thumbnailUrl || '').trim().replace(/^http:\/\//, 'https://').replace(/^\/\//, 'https://');

  return (
    <>
      {/* ── MOBILE FULLSCREEN PORTAL ─────────────────────────────── */}
      {isMobileFS && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2147483647,
          background: '#000', display: 'flex', flexDirection: 'column',
        }}>
          {/* Mini top bar — Exit + Rotate only */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 10px', background: '#0a0a0f',
            borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
            paddingTop: 'max(4px, env(safe-area-inset-top))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {cleanThumb && <Image src={cleanThumb} alt="" width={20} height={20} unoptimized style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} />}
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.title}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Rotate */}
              <button
                onClick={rotateScreen}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '5px 10px', background: '#27272a',
                  border: 'none', borderRadius: 8,
                  color: '#a1a1aa', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <RotateCcw size={12} />
                Rotate
              </button>
              {/* Exit */}
              <button
                onClick={exitMobileFS}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '5px 12px', background: '#6c40ff',
                  border: 'none', borderRadius: 8,
                  color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                <X size={12} />
                Exit
              </button>
            </div>
          </div>

          {/* Game iframe */}
          <div style={{ flex: 1, position: 'relative', background: '#000' }}>
            {isLoading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b', zIndex: 10 }}>
                <ConsoleLoader className="w-12 h-12 text-[#8b68ff]" label="Loading Game..." />
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={game.playUrl}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allow="fullscreen; autoplay; gamepad; popups; popups-to-escape-sandbox"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>,
        document.body
      )}

      {/* ── MAIN PAGE CONTENT ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2 relative w-full max-w-[800px] mx-auto">
        {!isPlaying ? (
          /* Seamless Hero Section with Top-to-Middle Ambient Color Fade */
          <div className="relative flex flex-col items-center justify-center py-3 sm:py-5 px-3 w-full overflow-hidden">
            {/* Top-to-Middle Faded Ambient Glow */}
            <div 
              className="absolute -top-12 inset-x-0 h-[200px] pointer-events-none z-0 opacity-35 blur-2xl"
              style={{
                background: `radial-gradient(ellipse 90% 70% at 50% 15%, rgba(255, 107, 0, 0.4), rgba(234, 88, 12, 0.1) 50%, transparent 80%)`,
              }}
            />
            {cleanThumb && (
              <div 
                className="absolute -top-8 inset-x-0 h-[180px] pointer-events-none z-0 opacity-20 blur-xl scale-105"
                style={{
                  backgroundImage: `url(${cleanThumb})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 80%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 80%)'
                }}
              />
            )}

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center w-full">
              {cleanThumb ? (
                <div className="relative mb-2.5 group">
                  <Image 
                    src={cleanThumb} 
                    alt={game.title} 
                    width={112} 
                    height={112} 
                    unoptimized 
                    priority 
                    className="w-20 h-20 sm:w-24 sm:h-24 aspect-square object-cover rounded-2xl border border-white/15 shadow-xl group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-2xl bg-zinc-900/90 flex items-center justify-center mb-2.5 border border-white/10 shadow-xl">
                  <Gamepad2 className="w-10 h-10 text-orange-400 opacity-60" />
                </div>
              )}

              <h1 className="text-lg sm:text-xl font-bold text-white mb-1 text-center tracking-tight">{game.title}</h1>
              
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-zinc-400 mb-3.5 font-medium">
                <span>🕹️</span>
                <span className="capitalize">{game.category?.[0] || "Arcade"}</span>
              </div>

              <button
                ref={playButtonRef}
                onClick={() => setIsPlaying(true)}
                className="px-6 py-2 bg-[#ff6b00] hover:bg-[#ea580c] text-white text-sm sm:text-base font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 group cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                Play now
              </button>
            </div>
          </div>
        ) : (
          /* Desktop Inline Player */
          <div
            ref={containerRef}
            className={clsx(
              "hidden lg:flex relative bg-black rounded-xl overflow-hidden shadow-2xl flex-col items-center justify-center group",
              isFullscreen ? "w-screen h-screen rounded-none" : "w-full"
            )}
            style={{ aspectRatio: !isFullscreen ? aspectRatio : 'auto' }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
                <ConsoleLoader className="w-20 h-20 text-primary-light" label="Loading Game Assets..." />
              </div>
            )}
            <iframe
              src={game.playUrl}
              className="w-full h-full absolute inset-0 border-0"
              allow="fullscreen; autoplay; gamepad; popups; popups-to-escape-sandbox"
              onLoad={() => setIsLoading(false)}
            />
            {isFullscreen && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <button onClick={toggleFullscreen} className="flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-sm text-white rounded-lg border border-white/10 text-sm font-bold">
                  <Minimize className="w-4 h-4" /> Exit Fullscreen
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile placeholder while in FS (keeps layout from collapsing) */}
        {isPlaying && isMobileFS && (
          <div className="lg:hidden w-full rounded-xl bg-zinc-950 flex items-center justify-center" style={{ aspectRatio }}>
            <p className="text-zinc-600 text-sm">Playing in fullscreen…</p>
          </div>
        )}

        {/* Mobile inline player (when NOT in mobile FS) */}
        {isPlaying && !isMobileFS && (
          <div className="lg:hidden relative bg-black rounded-xl overflow-hidden shadow-2xl w-full" style={{ aspectRatio }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            )}
            <iframe
              src={game.playUrl}
              className="w-full h-full absolute inset-0 border-0"
              allow="fullscreen; autoplay; gamepad; popups; popups-to-escape-sandbox"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        )}

        {/* ── ACTION BAR (always visible below the player) ─── */}
        <div className="flex flex-row items-center justify-between bg-zinc-900/90 backdrop-blur-md rounded-xl p-1 sm:p-1.5 border border-white/5 gap-1.5 mt-1 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-0 shrink">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800 ml-0.5">
              <Image src={game.thumbnailUrl} alt={game.title} width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-zinc-100 font-semibold truncate text-xs sm:text-sm">{game.title}</h2>
          </div>
          <div className="flex items-center gap-1 shrink-0 pr-0.5">
            {/* Like/Dislike */}
            <div className="flex items-center bg-zinc-800/80 rounded-full border border-white/5 overflow-hidden shrink-0">
              <button onClick={() => handleInteract('like')} className={clsx("flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 hover:bg-zinc-700 transition-colors group", isLiked ? "text-orange-400 bg-zinc-700/50" : "text-zinc-300 hover:text-white")}>
                <ThumbsUp className={clsx("w-3.5 h-3.5", isLiked ? "fill-current" : "group-hover:scale-110")} />
                {likeCount > 0 && <span className="text-xs font-bold">{likeCount > 999 ? (likeCount/1000).toFixed(1)+'k' : likeCount}</span>}
              </button>
              <div className="w-px h-3 bg-white/10" />
              <button onClick={() => handleInteract('dislike')} className={clsx("flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 hover:bg-zinc-700 transition-colors group", isDisliked ? "text-red-400 bg-zinc-700/50" : "text-zinc-300 hover:text-white")}>
                <ThumbsDown className={clsx("w-3.5 h-3.5", isDisliked ? "fill-current" : "group-hover:scale-110")} />
              </button>
            </div>
            <button onClick={() => handleInteract('favorite')} className={clsx("w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-white/5 transition-colors shrink-0 group", isFavorited ? "bg-zinc-700 text-pink-500 border-pink-500/30" : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white")} title="Favorite">
              <Heart className={clsx("w-3.5 h-3.5", isFavorited ? "fill-current" : "group-hover:text-pink-500")} />
            </button>
            <button onClick={() => setShowFeedbackModal(true)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-zinc-800/80 rounded-full border border-white/5 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors shrink-0" title="Feedback">
              <MessageSquareWarning className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setShowQrModal(true)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-zinc-800/80 rounded-full border border-white/5 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors shrink-0 group" title="Play on Mobile">
              <Smartphone className="w-3.5 h-3.5 group-hover:text-orange-400" />
            </button>
            <button onClick={toggleFullscreen} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-zinc-800/80 rounded-full border border-white/5 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors shrink-0 hidden md:flex" title="Fullscreen">
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* QR Modal */}
        {showQrModal && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={closeQrModal}>
            <div className="relative bg-[#0e0e12] border border-[#27272a] rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <button onClick={closeQrModal} className="absolute top-3.5 right-3.5 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              <div className="bg-white p-3 rounded-2xl mb-5 shadow-xl">
                <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&margin=0`} alt="QR" width={160} height={160} className="w-40 h-40 rounded-lg" unoptimized />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Take the fun with you!</h3>
              <p className="text-zinc-400 text-xs sm:text-sm">Scan to play <strong>{game.title}</strong> on your phone or tablet.</p>
            </div>
          </div>,
          document.body
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={closeFeedbackModal}>
            <div className="relative bg-[#0e0e12] border border-[#27272a] rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <button onClick={closeFeedbackModal} className="absolute top-3.5 right-3.5 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2"><MessageSquareWarning className="w-4.5 h-4.5 text-orange-400" />Provide Feedback</h3>
              <p className="text-zinc-400 text-xs sm:text-sm mb-4">Let us know what you think about <strong>{game.title}</strong>, or report any issues.</p>
              <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Your message here..." className="w-full bg-[#16161c] border border-zinc-700/80 rounded-xl p-3 text-zinc-100 text-sm min-h-[100px] focus:outline-none focus:border-orange-500 transition-colors mb-4" />
              <div className="flex justify-end gap-2.5">
                <button onClick={closeFeedbackModal} className="px-4 py-2 text-zinc-400 hover:text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={submitFeedback} disabled={isSubmittingFeedback || !feedbackText.trim()} className="px-5 py-2 bg-[#ff6b00] hover:bg-[#ea580c] text-white text-xs sm:text-sm font-bold rounded-lg transition-all shadow-md disabled:opacity-50 flex items-center gap-2">
                  {isSubmittingFeedback ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}Submit
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
}