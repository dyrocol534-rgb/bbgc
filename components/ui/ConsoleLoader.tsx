export function ConsoleLoader({
  className = "w-16 h-16",
  label = "Loading...",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative flex items-center justify-center ${className}`}>
        {/* Spinning ring */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animationDuration: "1.4s" }}
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#grad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="200"
            strokeDashoffset="140"
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Logo in center */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Bluebuff Games"
          className="w-[60%] h-[60%] object-contain rounded-xl"
        />
      </div>

      {label && (
        <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}
