"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal, preconnect, prefetchDNS } from 'react-dom';
import { 
  Maximize, Minimize, Loader2, ThumbsUp, ThumbsDown, Heart, 
  MessageSquareWarning, X, Play, RotateCcw, Gamepad2, Star, Sparkles, Share2 
} from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';
import { ConsoleLoader } from '@/components/ui/ConsoleLoader';
import Image from 'next/image';
import GameImage from '@/components/game/GameImage';
import { triggerHaptic } from '@/lib/utils';

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

  // Anti-AFK & Playtime Tracker:
  // 1. Pauses immediately if browser tab is hidden / minimized (document.hidden)
  // 2. Pauses if no user activity for 5 minutes (300 seconds)
  const [isIdle, setIsIdle] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (isIdle) {
      setIsIdle(false);
    }
  }, [isIdle]);

  // Track global user interactions across window & frame focus
  useEffect(() => {
    if (!isPlaying) return;

    const activityEvents = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'mousemove'];
    const handleActivity = () => resetActivity();

    activityEvents.forEach(evt => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });

    // Window focus/blur tracking
    const handleFocus = () => resetActivity();
    window.addEventListener('focus', handleFocus);

    return () => {
      activityEvents.forEach(evt => {
        window.removeEventListener(evt, handleActivity);
      });
      window.removeEventListener('focus', handleFocus);
    };
  }, [isPlaying, resetActivity]);

  // Periodic heartbeat: Ping server every 2 minutes (120s) ONLY IF:
  // - Game is active (isPlaying)
  // - Tab is visible (!document.hidden)
  // - User was active within the last 5 minutes (300s)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        // Check tab visibility
        if (typeof document !== 'undefined' && document.hidden) {
          return;
        }

        // Check idle status (300s = 5 minutes)
        const secondsSinceActivity = (Date.now() - lastActivityRef.current) / 1000;
        if (secondsSinceActivity >= 300) {
          setIsIdle(true);
          return;
        }

        // Active and verified: Send elapsedSeconds = 120 to the server
        axios.post('/api/user/playtime', { elapsedSeconds: 120 }).catch(() => {
          // Ignore errors
        });
      }, 120000); // 120 seconds (2 minutes)
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

  // Desktop and responsive fullscreen toggle
  const toggleFullscreen = () => {
    // If on mobile / tablet (<1024px), use mobile fullscreen portal
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (!isPlaying) {
        handlePlayNow();
      } else {
        setIsMobileFS(prev => !prev);
      }
      return;
    }

    // On desktop, start playing if not started yet
    if (!isPlaying) {
      setIsPlaying(true);
    }

    if (!document.fullscreenElement) {
      if (containerRef.current) {
        const el = containerRef.current;
        const requestFS =
          el.requestFullscreen ||
          (el as any).webkitRequestFullscreen ||
          (el as any).mozRequestFullScreen ||
          (el as any).msRequestFullscreen;
        if (requestFS) {
          requestFS.call(el).catch(console.error);
        }
      }
    } else {
      const exitFS =
        document.exitFullscreen ||
        (document as any).webkitExitFullscreen ||
        (document as any).mozCancelFullScreen ||
        (document as any).msExitFullscreen;
      if (exitFS) {
        exitFS.call(document).catch(console.error);
      }
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    document.addEventListener('mozfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
      document.removeEventListener('mozfullscreenchange', handler);
    };
  }, []);

  const closeFeedbackModal = useCallback(() => {
    setShowFeedbackModal(false);
    setFeedbackText('');
  }, []);

  const handleInteract = async (action: 'like' | 'dislike' | 'favorite') => {
    triggerHaptic(action === 'favorite' ? 'medium' : 'light');
    try {
      const res = await axios.post(`/api/games/${game.slug}/interact`, { action });
      setIsLiked(res.data.isLiked);
      setIsDisliked(res.data.isDisliked);
      setIsFavorited(res.data.isFavorited);
      setLikeCount(res.data.likeCount);
      setDislikeCount(res.data.dislikeCount);
      if (res.data.isLiked || res.data.isFavorited) {
        triggerHaptic('success');
      }
    } catch (error: any) {
      triggerHaptic('warning');
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
              />
            </div>

            {/* Anti-AFK Idle Banner (Mobile Fullscreen) */}
            {isIdle && (
              <div 
                onClick={resetActivity}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 20,
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: 16,
                  padding: 16,
                  maxWidth: 260,
                  textAlign: 'center',
                }}>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 800, marginBottom: 4 }}>
                    Playtime Paused
                  </div>
                  <p style={{ color: '#a1a1aa', fontSize: 11, margin: '0 0 12px 0', lineHeight: 1.4 }}>
                    No touch detected for 5 minutes.
                  </p>
                  <button
                    onClick={resetActivity}
                    style={{
                      background: '#fff',
                      color: '#000',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: 'none',
                      width: '100%',
                      cursor: 'pointer',
                    }}
                  >
                    Resume XP
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ── MAIN PAGE CONTENT ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3 relative w-full">
        <div 
          ref={containerRef}
          className={clsx(
            "relative w-full transition-all",
            isFullscreen 
              ? "fixed inset-0 z-[99999] w-screen h-screen bg-black flex flex-col items-center justify-center rounded-none border-none overflow-hidden" 
              : "rounded-[20px]"
          )}
        >
          {!isPlaying ? (
            /* iOS Arcade Hero Section with Top-to-Bottom Game Icon Gradient to Deep Black */
            <div className="relative flex flex-col items-center justify-center py-4 sm:py-5 px-4 w-full rounded-[20px] border border-white/[0.08] overflow-hidden bg-gradient-to-b from-[#18181e] via-[#08080a] to-[#000000]">
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
              <div className="relative z-10 flex flex-col w-full">
                {/* Logo at Start (Far Left), Name and Type right next to it */}
                <div className="flex items-center justify-start gap-3.5 sm:gap-4 mb-3.5 sm:mb-4 w-full">
                  {cleanThumb ? (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[18px] overflow-hidden border border-white/20 shadow-md group ring-1 ring-white/10 shrink-0">
                      <GameImage 
                        src={cleanThumb} 
                        alt={game.title} 
                        priority={true} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-[18px] bg-zinc-800 flex items-center justify-center border border-white/20 shadow-lg text-white font-black text-2xl sm:text-3xl select-none shrink-0">
                      {initialLetter}
                    </div>
                  )}

                  <div className="flex flex-col items-start text-left min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl font-bold text-white mb-1.5 tracking-tight leading-snug line-clamp-2">
                      {game.title}
                    </h1>
                    
                    {/* Category Pill */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-[11px] font-semibold text-zinc-200 shadow-xs backdrop-blur-md">
                      <span>🕹️</span>
                      <span className="capitalize">{game.category?.[0] || "Arcade"}</span>
                    </span>
                  </div>
                </div>

                {/* iOS Big Pill Play Button */}
                <div className="flex items-center justify-center w-full">
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
            </div>
          ) : (
            /* Desktop Inline Player */
            <div
              className={clsx(
                "hidden lg:flex relative bg-black rounded-2xl overflow-hidden shadow-2xl flex-col items-center justify-center group border border-white/[0.08]",
                isFullscreen ? "w-full h-full rounded-none border-none" : "w-full"
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

              {/* Anti-AFK Idle Banner (Desktop) */}
              {isIdle && (
                <div 
                  onClick={resetActivity}
                  className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
                >
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 max-w-xs text-center shadow-2xl space-y-2 pointer-events-auto">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-ping" />
                    <h4 className="text-sm font-bold text-white tracking-tight">Playtime Paused</h4>
                    <p className="text-xs text-zinc-400">
                      We paused tracking because no activity was detected for 5 minutes.
                    </p>
                    <button
                      onClick={resetActivity}
                      className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors w-full cursor-pointer"
                    >
                      Resume Earning XP
                    </button>
                  </div>
                </div>
              )}
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
        </div>

        {/* ── iOS ACTION BAR (always visible below player) ─── */}
        <div className="flex flex-row items-center justify-between bg-[#141416]/90 backdrop-blur-xl rounded-2xl p-2 px-3 border border-white/[0.08] gap-3 shadow-md">
          {/* Left Group: Game Icon & Like/Dislike Rating */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {cleanThumb ? (
              <div className="relative w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800 border border-white/10 shadow-sm ring-1 ring-white/5">
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
          </div>

          {/* Right Group: Action Tools (Favorite, Share, Feedback, Fullscreen) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

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

            {/* Share Button */}
            <button 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-share-modal', {
                    detail: {
                      title: game.title,
                      thumbnailUrl: game.thumbnailUrl,
                      category: game.category?.[0] || 'Online Game',
                    }
                  }));
                }
              }} 
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

            {/* Fullscreen Button */}
            <button 
              onClick={toggleFullscreen} 
              className="w-8 h-8 flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 rounded-full border border-white/[0.08] text-zinc-300 hover:text-white transition-all shrink-0 cursor-pointer shadow-sm" 
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* iOS Feedback Bottom Sheet */}
        {showFeedbackModal && typeof document !== 'undefined' && createPortal(
          <div 
            className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200" 
            onClick={closeFeedbackModal}
          >
            <div 
              className="relative bg-[#0c0c0e] border-t sm:border border-white/[0.1] rounded-t-[28px] sm:rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200" 
              onClick={e => e.stopPropagation()}
            >
              {/* Mobile Pull Bar */}
              <div className="sm:hidden flex justify-center -mt-2 pb-2.5">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white shrink-0">
                    <MessageSquareWarning className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Game Feedback</h3>
                    <p className="text-[11px] text-zinc-400">Help us improve Bluebuff Games</p>
                  </div>
                </div>

                <button 
                  onClick={closeFeedbackModal} 
                  className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-zinc-400 text-xs mb-3.5 leading-relaxed">
                Let us know what you think about <strong className="text-white font-semibold">{game.title}</strong>, or report an issue.
              </p>

              <textarea 
                value={feedbackText} 
                onChange={e => setFeedbackText(e.target.value)} 
                placeholder="Write your feedback or issue description here..." 
                className="w-full bg-[#050507] border border-white/[0.09] focus:border-white/30 rounded-2xl p-3.5 text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm min-h-[110px] outline-none transition-all mb-4 focus:ring-1 focus:ring-white/10" 
              />

              <div className="flex items-center justify-end gap-2.5">
                <button 
                  onClick={closeFeedbackModal} 
                  className="px-4 py-2 rounded-full text-zinc-400 hover:text-white text-xs font-semibold hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitFeedback} 
                  disabled={isSubmittingFeedback || !feedbackText.trim()} 
                  className="px-5 py-2.5 bg-white hover:bg-zinc-200 active:scale-95 text-black text-xs font-bold rounded-full transition-all shadow-md shadow-white/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
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