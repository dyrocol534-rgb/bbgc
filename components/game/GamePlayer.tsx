"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal, preconnect, prefetchDNS } from 'react-dom';
import { 
  Maximize, Minimize, Loader2, ThumbsUp, ThumbsDown, Heart, 
  MessageSquareWarning, X, Play, RotateCcw, Gamepad2, Share2, Star, Sparkles 
} from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';
import { ConsoleLoader } from '@/components/ui/ConsoleLoader';
import Image from 'next/image';
import GameImage from '@/components/game/GameImage';

interface GamePlayerProps {
  game: {
    slug: string;
    title: string;
    playUrl: string;
    width: number;
    height: number;
    orientation: string;
    thumbnailUrl: string;
    category?: string[];
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
  const [isForceLandscape, setIsForceLandscape] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const [likeCount, setLikeCount] = useState(game.likes?.length || 0);
  const [dislikeCount, setDislikeCount] = useState(game.dislikes?.length || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
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

  const handlePlayNow = () => {
    setIsPlaying(true);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileFS(true);
      const docEl = document.documentElement as any;
      const requestFS =
        docEl.requestFullscreen ||
        docEl.webkitRequestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.msRequestFullscreen;
      if (requestFS && !document.fullscreenElement) {
        requestFS.call(docEl).catch(() => {});
      }
    }
  };

  // Auto-enter mobile fullscreen on play
  useEffect(() => {
    if (isPlaying && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileFS(true);
    }
  }, [isPlaying]);

  const enterImmersiveMode = () => {
    import('@capacitor/status-bar')
      .then(({ StatusBar }) => {
        StatusBar.hide().catch(() => {});
      })
      .catch(() => {});
    import('@capawesome/capacitor-navigation-bar')
      .then(({ NavigationBar }) => {
        NavigationBar.hide().catch(() => {});
      })
      .catch(() => {});
  };

  const exitImmersiveMode = () => {
    import('@capacitor/status-bar')
      .then(({ StatusBar }) => {
        StatusBar.show().catch(() => {});
      })
      .catch(() => {});
    import('@capawesome/capacitor-navigation-bar')
      .then(({ NavigationBar, Style }) => {
        NavigationBar.show().catch(() => {});
        NavigationBar.setColor({ color: '#09090b' }).catch(() => {});
        NavigationBar.setStyle({ style: Style.Dark }).catch(() => {});
      })
      .catch(() => {});
  };

  // Handle Mobile Fullscreen: Status Bar, Navigation Bar & Back Button interception
  useEffect(() => {
    if (!isMobileFS) return;

    // 1. Hide Capacitor system status bar and Android navigation bar for true edge-to-edge
    enterImmersiveMode();

    // 2. Request native HTML5 fullscreen to hide browser address/status bars
    const docEl = document.documentElement as any;
    if (!document.fullscreenElement) {
      const requestFS =
        docEl.requestFullscreen ||
        docEl.webkitRequestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.msRequestFullscreen;
      if (requestFS) {
        requestFS.call(docEl).catch(() => {});
      }
    }

    // 3. Push a history state so phone Back button / swipe gesture exits game fullscreen first
    window.history.pushState({ isGameFullscreen: true }, '', window.location.href);

    const handlePopState = () => {
      // Back button was pressed: close mobile fullscreen game instead of navigating away
      setIsMobileFS(false);
      setIsPlaying(false);
      setIsForceLandscape(false);
      try {
        if (document.fullscreenElement) {
          const exitFS =
            document.exitFullscreen ||
            (document as any).webkitExitFullscreen ||
            (document as any).mozCancelFullScreen ||
            (document as any).msExitFullscreen;
          if (exitFS) exitFS.call(document).catch(() => {});
        }
        const orient = (screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation) as any;
        if (orient && orient.unlock) orient.unlock();
      } catch (e) {}
      exitImmersiveMode();
    };

    window.addEventListener('popstate', handlePopState);

    // 4. Register Capacitor hardware back button handler
    let capacitorBackListener: any = null;
    import('@capacitor/app')
      .then(({ App }) => {
        App.addListener('backButton', () => {
          exitMobileFS();
        }).then(listener => {
          capacitorBackListener = listener;
        }).catch(() => {});
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (capacitorBackListener && capacitorBackListener.remove) {
        capacitorBackListener.remove();
      }
      exitImmersiveMode();
    };
  }, [isMobileFS]);

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
    // If top history entry is our game fullscreen state, unwind it
    if (window.history.state?.isGameFullscreen) {
      window.history.back();
    }
    setIsMobileFS(false);
    setIsPlaying(false);
    setIsForceLandscape(false);
    try {
      if (document.fullscreenElement) {
        const exitFS =
          document.exitFullscreen ||
          (document as any).webkitExitFullscreen ||
          (document as any).mozCancelFullScreen ||
          (document as any).msExitFullscreen;
        if (exitFS) exitFS.call(document).catch(() => {});
      }
      const orient = (screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation) as any;
      if (orient && orient.unlock) orient.unlock();
    } catch (e) {}
    exitImmersiveMode();
  };

  const rotateScreen = async () => {
    try {
      // 1. Try native orientation lock if available
      const docEl = document.documentElement as any;
      if (!document.fullscreenElement) {
        const requestFS = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen;
        if (requestFS) await requestFS.call(docEl).catch(() => {});
      }
      const orient = (screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation) as any;
      if (orient && orient.lock) {
        const isCurrentlyPortrait = (orient.type || '').startsWith('portrait') || window.innerHeight > window.innerWidth;
        const target = isCurrentlyPortrait ? 'landscape' : 'portrait';
        await orient.lock(target).catch(() => {});
      }
    } catch (e) {
      console.log('Orientation lock attempt:', e);
    }
    // 2. Toggle CSS virtual orientation transform so it ALWAYS physically rotates on any device/iOS/browser
    setIsForceLandscape(prev => !prev);
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

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: game.title,
          text: `Play ${game.title} free online on Bluebuff!`,
          url: window.location.href,
        });
      } catch (e) {
        // User cancelled or share dismissed
      }
    } else if (typeof window !== 'undefined') {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Game link copied to clipboard! 📋');
      } catch (e) {
        // fallback
      }
    }
  };

  const aspectRatio = game.width && game.height ? `${game.width}/${game.height}` : '16/9';
  const cleanThumb = (game.thumbnailUrl || '').trim().replace(/^http:\/\//, 'https://').replace(/^\/\//, 'https://');
  const initialLetter = (game.title || 'G').charAt(0).toUpperCase();

  return (
    <>
      {/* ── MOBILE FULLSCREEN PORTAL ─────────────────────────────── */}
      {isMobileFS && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2147483647,
          background: '#000', display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Mini top bar — Ultra-slim Icon-only Exit + Phone Rotate */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '2px 8px', background: '#0a0a0f',
            borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
            height: '28px',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              {cleanThumb ? (
                <img 
                  src={cleanThumb} 
                  alt="" 
                  width={18} 
                  height={18} 
                  style={{ width: 18, height: 18, borderRadius: 4, objectFit: 'cover' }} 
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 900, flexShrink: 0, userSelect: 'none' }}>
                  {initialLetter}
                </div>
              )}
              <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.title}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {/* Rotate Phone Screen Icon */}
              <button
                onClick={rotateScreen}
                aria-label="Rotate Screen"
                title="Rotate Screen"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24,
                  background: isForceLandscape ? 'rgba(255, 255, 255, 0.2)' : '#222226',
                  border: isForceLandscape ? '1px solid rgba(255, 255, 255, 0.5)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6,
                  color: isForceLandscape ? '#ffffff' : '#d4d4d8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  padding: 0,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="2" width="12" height="20" rx="3" transform={isForceLandscape ? "rotate(90 12 12)" : undefined} style={{ transition: 'transform 0.25s ease', transformOrigin: 'center' }} />
                  <path d="M12 18h.01" />
                  <path d="M21 8.5A9 9 0 0 0 5.5 4.5L3 7" />
                  <polyline points="3 3 3 7 7 7" />
                </svg>
              </button>
              {/* Exit Icon */}
              <button
                onClick={exitMobileFS}
                aria-label="Exit Game"
                title="Exit Game"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24,
                  background: '#222226',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6,
                  color: '#f4f4f5',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  padding: 0,
                }}
              >
                <X size={13} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Game iframe */}
          <div style={{
            flex: 1,
            position: 'relative',
            background: '#000',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isLoading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b', zIndex: 10 }}>
                <ConsoleLoader className="w-12 h-12 text-white" label="Loading Game..." />
              </div>
            )}
            <div style={{
              width: isForceLandscape ? 'calc(100vh - 28px)' : '100%',
              height: isForceLandscape ? '100vw' : '100%',
              position: isForceLandscape ? 'absolute' : 'relative',
              transform: isForceLandscape ? 'rotate(90deg)' : 'none',
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease, width 0.2s ease, height 0.2s ease',
            }}>
              <iframe
                ref={iframeRef}
                src={game.playUrl}
                title={game.title}
                loading="lazy"
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                allow="fullscreen; autoplay; gamepad; popups; popups-to-escape-sandbox"
                onLoad={() => setIsLoading(false)}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── MAIN PAGE CONTENT ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3 relative w-full max-w-[840px] mx-auto">
        {!isPlaying ? (
          /* iOS Arcade Hero Section with Top-to-Bottom Game Icon Gradient to Deep Black */
          <div className="relative flex flex-col items-center justify-center py-4 sm:py-5 px-4 w-full rounded-[24px] border border-white/[0.08] overflow-hidden bg-gradient-to-b from-[#18181e] via-[#08080a] to-[#000000]">
            {/* Top hairline highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent z-10" />

            {/* Dynamic Game-Themed Top-to-Bottom Gradient & Artwork Backdrop */}
            {cleanThumb && (
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div 
                  className="absolute -top-8 inset-x-0 h-[80%] opacity-55 blur-3xl scale-125 transition-all"
                  style={{
                    backgroundImage: `url(${cleanThumb})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                  }}
                />
                {/* Smooth top-to-bottom darkening fade deeply into black */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-[#060608]/80 to-[#000000]" />
              </div>
            )}

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center w-full text-center">
              {cleanThumb ? (
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-[18px] overflow-hidden mb-2.5 border border-white/20 shadow-md group ring-1 ring-white/10">
                  <GameImage 
                    src={cleanThumb} 
                    alt={game.title} 
                    priority={true} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              ) : (
                <div className="w-18 h-18 sm:w-20 sm:h-20 aspect-square rounded-[18px] bg-zinc-800 flex items-center justify-center mb-2.5 border border-white/20 shadow-lg text-white font-black text-2xl sm:text-3xl select-none">
                  {initialLetter}
                </div>
              )}

              <h1 className="text-lg sm:text-xl font-bold text-white mb-1.5 text-center tracking-tight">
                {game.title}
              </h1>
              
              {/* Category Pill */}
              <div className="flex items-center justify-center mb-3.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-[11px] font-semibold text-zinc-200 shadow-xs backdrop-blur-md">
                  <span>🕹️</span>
                  <span className="capitalize">{game.category?.[0] || "Arcade"}</span>
                </span>
              </div>

              {/* iOS Big Pill Play Button */}
              <button
                ref={playButtonRef}
                onClick={handlePlayNow}
                className="px-7 py-2.5 sm:px-8 sm:py-2.5 bg-white hover:bg-zinc-200 active:scale-[0.98] text-black text-xs sm:text-sm font-bold rounded-full shadow-[0_6px_20px_rgba(255,255,255,0.15)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current transition-transform" />
                <span>Play Now</span>
              </button>
            </div>
          </div>
        ) : (
          /* Desktop Inline Player */
          <div
            ref={containerRef}
            className={clsx(
              "hidden lg:flex relative bg-black rounded-2xl overflow-hidden shadow-2xl flex-col items-center justify-center group border border-white/[0.08]",
              isFullscreen ? "w-screen h-screen rounded-none border-none" : "w-full"
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
              title={game.title}
              loading="lazy"
              className="w-full h-full absolute inset-0 border-0"
              allow="fullscreen; autoplay; gamepad; popups; popups-to-escape-sandbox"
              onLoad={() => setIsLoading(false)}
            />
            {isFullscreen && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <button 
                  onClick={toggleFullscreen} 
                  className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-md text-white rounded-full border border-white/15 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                >
                  <Minimize className="w-3.5 h-3.5" /> Exit Fullscreen
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile placeholder while in FS (keeps layout from collapsing) */}
        {isPlaying && isMobileFS && (
          <div className="lg:hidden w-full rounded-2xl bg-zinc-950 flex items-center justify-center border border-white/[0.06]" style={{ aspectRatio }}>
            <p className="text-zinc-500 text-xs font-medium">Playing in fullscreen…</p>
          </div>
        )}

        {/* Mobile inline player (when NOT in mobile FS) */}
        {isPlaying && !isMobileFS && (
          <div className="lg:hidden relative bg-black rounded-2xl overflow-hidden shadow-2xl w-full border border-white/[0.08]" style={{ aspectRatio }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            )}
            <iframe
              src={game.playUrl}
              title={game.title}
              loading="lazy"
              className="w-full h-full absolute inset-0 border-0"
              allow="fullscreen; autoplay; gamepad; popups; popups-to-escape-sandbox"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        )}

        {/* ── iOS ACTION BAR (always visible below player) ─── */}
        <div className="flex flex-row items-center justify-between bg-[#141416]/90 backdrop-blur-xl rounded-2xl p-2 px-3 border border-white/[0.08] gap-2 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            {cleanThumb ? (
              <div className="relative w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800 border border-white/10 shadow-sm">
                <GameImage 
                  src={cleanThumb} 
                  alt={game.title} 
                  sizes="32px" 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-white text-xs font-black shadow-sm shrink-0 select-none">
                {initialLetter}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <h2 className="text-white font-semibold truncate text-xs sm:text-sm tracking-tight">{game.title}</h2>
              <span className="text-[10.5px] text-zinc-400 truncate capitalize">{game.category?.[0] || "Online Game"}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* iOS Like/Dislike Segmented Pill */}
            <div className="flex items-center bg-white/[0.05] rounded-full border border-white/[0.08] overflow-hidden shrink-0 p-0.5">
              <button 
                onClick={() => handleInteract('like')} 
                className={clsx(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full transition-all text-xs font-medium cursor-pointer active:scale-95", 
                  isLiked ? "text-white bg-white/20" : "text-zinc-300 hover:text-white"
                )}
                title="Like"
              >
                <ThumbsUp className={clsx("w-3.5 h-3.5", isLiked ? "fill-current" : "")} />
                {likeCount > 0 && <span className="text-[11px] font-semibold">{likeCount > 999 ? (likeCount/1000).toFixed(1)+'k' : likeCount}</span>}
              </button>
              <div className="w-px h-3 bg-white/10 my-auto" />
              <button 
                onClick={() => handleInteract('dislike')} 
                className={clsx(
                  "flex items-center gap-1 px-2 py-1 rounded-full transition-all text-xs cursor-pointer active:scale-95", 
                  isDisliked ? "text-red-400 bg-red-500/15" : "text-zinc-300 hover:text-white"
                )}
                title="Dislike"
              >
                <ThumbsDown className={clsx("w-3.5 h-3.5", isDisliked ? "fill-current" : "")} />
              </button>
            </div>

            {/* Favorite Button */}
            <button 
              onClick={() => handleInteract('favorite')} 
              className={clsx(
                "w-8 h-8 flex items-center justify-center rounded-full border transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm", 
                isFavorited 
                  ? "bg-pink-500/15 text-pink-400 border-pink-500/30" 
                  : "bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border-white/[0.08]"
              )} 
              title="Add to Favorites"
            >
              <Heart className={clsx("w-3.5 h-3.5", isFavorited ? "fill-current text-pink-500" : "")} />
            </button>

            {/* Native Share Button */}
            <button 
              onClick={handleShare} 
              className="w-8 h-8 flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 rounded-full border border-white/[0.08] text-zinc-300 hover:text-white transition-all shrink-0 cursor-pointer shadow-sm" 
              title="Share Game"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Feedback Button */}
            <button 
              onClick={() => setShowFeedbackModal(true)} 
              className="w-8 h-8 flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 rounded-full border border-white/[0.08] text-zinc-300 hover:text-white transition-all shrink-0 cursor-pointer shadow-sm" 
              title="Report or Give Feedback"
            >
              <MessageSquareWarning className="w-3.5 h-3.5" />
            </button>

            {/* Desktop Fullscreen Button */}
            <button 
              onClick={toggleFullscreen} 
              className="w-8 h-8 items-center justify-center bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 rounded-full border border-white/[0.08] text-zinc-300 hover:text-white transition-all shrink-0 hidden md:flex cursor-pointer shadow-sm" 
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* iOS Feedback Modal */}
        {showFeedbackModal && typeof document !== 'undefined' && createPortal(
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" 
            onClick={closeFeedbackModal}
          >
            <div 
              className="relative bg-[#18181b] border border-white/[0.12] rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col animate-in zoom-in-95 duration-200" 
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={closeFeedbackModal} 
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white shrink-0">
                  <MessageSquareWarning className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Game Feedback</h3>
                  <p className="text-[11px] text-zinc-400">Help us improve Bluebuff Games</p>
                </div>
              </div>

              <p className="text-zinc-400 text-xs mb-3.5 leading-relaxed">
                Let us know what you think about <strong className="text-zinc-200">{game.title}</strong>, or report an issue.
              </p>

              <textarea 
                value={feedbackText} 
                onChange={e => setFeedbackText(e.target.value)} 
                placeholder="Write your feedback or issue description here..." 
                className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-white/40 rounded-2xl p-3.5 text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm min-h-[110px] outline-none transition-all mb-4" 
              />

              <div className="flex items-center justify-end gap-2.5">
                <button 
                  onClick={closeFeedbackModal} 
                  className="px-4 py-2 rounded-full text-zinc-400 hover:text-white text-xs font-medium hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitFeedback} 
                  disabled={isSubmittingFeedback || !feedbackText.trim()} 
                  className="px-5 py-2.5 bg-white hover:bg-zinc-200 active:scale-95 text-black text-xs font-bold rounded-full transition-all shadow-md shadow-white/10 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingFeedback ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Submit Feedback</span>
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