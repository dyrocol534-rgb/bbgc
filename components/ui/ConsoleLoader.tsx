export function ConsoleLoader({ className = "w-16 h-16 text-primary", label = "Loading Game Assets..." }: { className?: string, label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative flex items-center justify-center ${className}`}>
        <style dangerouslySetInnerHTML={{ __html: `
          .console-line {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: draw-console 2.5s ease-in-out infinite;
          }
          @keyframes draw-console {
            0% { stroke-dashoffset: 100; fill: transparent; }
            40% { stroke-dashoffset: 0; fill: transparent; }
            50% { stroke-dashoffset: 0; fill: currentColor; }
            80% { stroke-dashoffset: 0; fill: transparent; }
            100% { stroke-dashoffset: 100; fill: transparent; }
          }
        `}} />
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-full h-full console-line"
        >
          <path pathLength="100" d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
          <line pathLength="100" x1="6" x2="10" y1="11" y2="11" />
          <line pathLength="100" x1="8" x2="8" y1="9" y2="13" />
          <line pathLength="100" x1="15" x2="15.01" y1="12" y2="12" />
          <line pathLength="100" x1="18" x2="18.01" y1="10" y2="10" />
        </svg>
      </div>
      {label && <p className="font-bold text-sm tracking-widest uppercase bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent animate-pulse">{label}</p>}
    </div>
  );
}
