"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize, Minimize, Loader2, ThumbsUp, ThumbsDown, Heart, MessageSquareWarning, Smartphone, X } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  const [currentUrl, setCurrentUrl] = useState('');
  
  // Interaction states
  const [likeCount, setLikeCount] = useState(game.likes?.length || 0);
  const [dislikeCount, setDislikeCount] = useState(game.dislikes?.length || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUrl(window.location.href);
    
    // Fetch initial interaction status
    axios.post(`/api/games/${game.slug}/interact`, { action: 'status' })
      .then(res => {
        setIsLiked(res.data.isLiked);
        setIsDisliked(res.data.isDisliked);
        setIsFavorited(res.data.isFavorited);
        setLikeCount(res.data.likeCount);
        setDislikeCount(res.data.dislikeCount);
      })
      .catch(console.error);
  }, [game.slug]);

  // Fallback to remove loader after 5 seconds if iframe onLoad fails
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      // Increment play count when play starts
      axios.post(`/api/games/${game.slug}/play`).catch(err => console.error("Failed to increment play count", err));
      
      // Also save to recently played in localStorage
      try {
        const stored = localStorage.getItem('recentlyPlayed');
        let recent = stored ? JSON.parse(stored) : [];
        recent = recent.filter((s: string) => s !== game.slug);
        recent.unshift(game.slug);
        if (recent.length > 20) recent.pop();
        localStorage.setItem('recentlyPlayed', JSON.stringify(recent));
      } catch (e) {
        console.error("Local storage error:", e);
      }
    }
  }, [isPlaying, game.slug]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // For proper aspect ratio handling if width/height are provided
  const aspectRatio = game.width && game.height ? `${game.width} / ${game.height}` : '16 / 9';

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
      if (error.response?.status === 401) {
        alert("Please log in to perform this action.");
      } else if (error.response?.data?.error) {
        alert(error.response.data.error);
      }
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
      if (error.response?.status === 401) {
        alert("Please log in to submit feedback.");
      } else {
        alert("Failed to submit feedback.");
      }
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const totalVotes = likeCount + dislikeCount;
  const ratingScore = totalVotes > 0 ? ((likeCount / totalVotes) * 10).toFixed(1) : "0.0";

  return (
    <div className="flex flex-col gap-2 relative w-full max-w-[800px]">
      {/* Desktop/Default Game Container */}
      {!isPlaying ? (
        // --- SPLASH SCREEN ---
        <div className="flex flex-col items-center justify-center bg-black rounded-xl overflow-hidden shadow-2xl py-12 px-4 transition-all duration-300 w-full min-h-[400px] sm:min-h-[500px]">
          <img src={game.thumbnailUrl} alt={game.title} className="w-48 sm:w-64 aspect-video object-cover rounded-2xl shadow-xl mb-6 border-2 border-zinc-800" />
          
          <h1 className="text-3xl font-bold text-white mb-4 text-center">{game.title}</h1>
          
          <div className="flex items-center justify-center gap-6 mb-8 text-zinc-300 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-xl">🕹️</span>
              <span className="capitalize">Arcade</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsPlaying(true)}
            className="px-12 py-4 bg-[#6c40ff] hover:bg-[#7b54ff] text-white text-xl font-bold rounded-full transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(108,64,255,0.4)] flex items-center gap-3"
          >
            <div className="w-6 h-6 border-2 border-white rounded-md flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            Play now
          </button>
        </div>
      ) : (
        // --- PLAYING STATE ---
        <>
          {/* Mobile Fixed Fullscreen Overlay */}
          <div className={clsx(
            "sm:hidden fixed inset-0 z-50 bg-black flex flex-col transition-all duration-300",
            !isFullscreen ? "translate-y-0" : ""
          )}>
            {/* Top Bar for Mobile */}
            <div className="h-12 bg-[#121216] flex items-center justify-between px-3 shrink-0">
              <button 
                onClick={() => setIsPlaying(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6c40ff] text-white text-sm font-bold rounded-md"
              >
                <div className="w-3 h-4 border border-white rounded-sm border-l-4"></div>
                Exit
              </button>
              <button onClick={() => setShowFeedbackModal(true)} className="p-2">
                <MessageSquareWarning className="w-5 h-5 text-red-500" />
              </button>
            </div>
            
            <div className="flex-1 relative w-full h-full">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10 text-primary-light">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                </div>
              )}
              <iframe
                src={game.playUrl}
                className="w-full h-full border-0"
                allow="fullscreen; autoplay; gamepad"
                sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
                onLoad={() => setIsLoading(false)}
              />
            </div>
          </div>

          {/* Desktop Inline Player */}
          <div 
            ref={containerRef}
            className={clsx(
              "hidden sm:block relative bg-black rounded-xl overflow-hidden shadow-2xl transition-all duration-300",
              isFullscreen ? "w-screen h-screen rounded-none" : "w-full"
            )}
            style={{ aspectRatio: !isFullscreen ? aspectRatio : 'auto' }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10 text-primary-light">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-medium animate-pulse">Loading Game Assets...</p>
              </div>
            )}
            
            <iframe
              src={game.playUrl}
              className="w-full h-full border-0"
              allow="fullscreen; autoplay; gamepad"
              sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
              onLoad={() => setIsLoading(false)}
            />

            {/* Floating Fullscreen (kept for convenience when inside fullscreen) */}
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors z-20"
                title="Exit Fullscreen"
              >
                <Minimize className="w-5 h-5" />
              </button>
            )}
          </div>
        </>
      )}

      {/* Action Bar */}
      <div className="flex flex-row items-center justify-between bg-zinc-900/80 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl border border-white/5 gap-3 mt-2 overflow-x-auto scrollbar-none">
        {/* Left Side: Game Title & Icon */}
        <div className="flex items-center gap-2.5 min-w-0 shrink">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-md bg-zinc-800">
             <img src={game.thumbnailUrl} alt={game.title} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-zinc-100 font-bold truncate text-base sm:text-lg">{game.title}</h2>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Like/Dislike Group */}
          <div className="flex items-center bg-zinc-800/80 rounded-full border border-white/5 overflow-hidden shrink-0">
            <button 
              onClick={() => handleInteract('like')}
              className={clsx("flex items-center gap-1.5 px-3 py-2 hover:bg-zinc-700 transition-colors group", isLiked ? "text-indigo-400 bg-zinc-700/50" : "text-zinc-300 hover:text-white")}
            >
              <ThumbsUp className={clsx("w-4 h-4 transition-transform", isLiked ? "fill-current" : "group-hover:scale-110")} />
              <span className="text-sm font-bold transition-colors">{likeCount > 0 ? (likeCount > 999 ? (likeCount/1000).toFixed(1)+'k' : likeCount) : 'Like'}</span>
            </button>
            <div className="w-px h-5 bg-white/10"></div>
            <button 
              onClick={() => handleInteract('dislike')}
              className={clsx("flex items-center gap-1.5 px-3 py-2 hover:bg-zinc-700 transition-colors group", isDisliked ? "text-red-400 bg-zinc-700/50" : "text-zinc-300 hover:text-white")}
            >
              <ThumbsDown className={clsx("w-4 h-4 transition-transform", isDisliked ? "fill-current" : "group-hover:scale-110")} />
            </button>
          </div>

          {/* Action Buttons */}
          <button 
            onClick={() => handleInteract('favorite')}
            title="Add to Favorites" 
            className={clsx("p-2 sm:p-2.5 rounded-full border border-white/5 transition-colors shrink-0 group hover:border-pink-500/50 hover:bg-zinc-700", isFavorited ? "bg-zinc-700 text-pink-500 border-pink-500/30" : "bg-zinc-800/80 text-zinc-300 hover:text-white")}
          >
            <Heart className={clsx("w-4 h-4 transition-colors", isFavorited ? "fill-current" : "group-hover:text-pink-500")} />
          </button>
          <button 
            onClick={() => setShowFeedbackModal(true)}
            title="Report / Feedback" 
            className="p-2 sm:p-2.5 bg-zinc-800/80 rounded-full border border-white/5 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors shrink-0"
          >
            <MessageSquareWarning className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setShowQrModal(true)}
            title="Play on mobile"
            className="p-2 sm:p-2.5 bg-zinc-800/80 rounded-full border border-white/5 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors shrink-0 group"
          >
            <Smartphone className="w-4 h-4 group-hover:text-indigo-400" />
          </button>

          <button onClick={toggleFullscreen} title="Toggle Fullscreen" className="p-2 sm:p-2.5 bg-zinc-800/80 rounded-full border border-white/5 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors shrink-0 hidden md:flex">
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeQrModal}>
          <div 
            className="relative bg-[#1f1f2e] border border-border-main rounded-3xl p-8 md:p-12 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={closeQrModal}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="bg-white p-4 rounded-3xl mb-8 shadow-xl">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&margin=0`} 
                alt="QR Code to play on mobile"
                className="w-48 h-48 rounded-xl"
              />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">Take the fun with you!</h3>
            <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
              Scan to play <span className="font-semibold text-white">{game.title}</span> on your phone or tablet. You can also get the CloudGames app on iOS or Android.
            </p>
          </div>
        </div>
      )}
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeFeedbackModal}>
          <div 
            className="relative bg-zinc-900 border border-border-main rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={closeFeedbackModal}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-indigo-400" />
              Provide Feedback
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
              Let us know what you think about <strong>{game.title}</strong>, or report any issues you encountered.
            </p>
            
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Your message here..."
              className="w-full bg-surface-hover border border-border-main rounded-xl p-4 text-zinc-100 min-h-[120px] focus:outline-none focus:border-indigo-500 transition-colors mb-4"
            />
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={closeFeedbackModal}
                className="px-5 py-2.5 text-zinc-300 hover:text-white font-medium rounded-xl hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitFeedback}
                disabled={isSubmittingFeedback || !feedbackText.trim()}
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmittingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
