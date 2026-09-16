"use client";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=in.bluebuff.games";

export default function PWAInstallButton({
  variant = "icon",
  onInstall,
}: {
  variant?: "icon" | "menuItem";
  onInstall?: () => void;
}) {
  const handleClick = () => {
    window.open(PLAY_STORE_URL, "_blank", "noopener,noreferrer");
    if (onInstall) onInstall();
  };

  if (variant === "menuItem") {
    return (
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold group text-left transition-all bg-[#12111a] border border-[#282142] hover:bg-[#161521] hover:border-[#382e5c]"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 shrink-0 rounded bg-[#1f1d2e] border border-[#312d4a] text-blue-400 group-hover:text-blue-300 transition-colors">
            {/* Google Play Store icon */}
            <svg className="w-4 h-4" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path fill="#32BBFF" d="M396.121 229.173 34.445 19.532C25.061 14.118 14.968 13.418 6.458 17.696L261.929 256 396.121 229.173z" />
              <path fill="#32BBFF" d="m6.458 494.304 255.471-238.303L6.458 17.696C2.592 19.636 0 24.169 0 30.47v451.06c0 6.301 2.592 10.834 6.458 12.774z" />
              <path fill="#FFD700" d="M419.978 274.638 396.121 261.17 261.929 256l134.192 26.827 23.857 13.469c11.27-6.408 11.27-15.25 0-21.658z" />
              <path fill="#F3BC00" d="m396.121 282.827-361.676 209.64c9.084 5.203 19.018 4.66 27.547-.407L419.978 274.638 396.121 282.827z" />
              <path fill="#00F076" d="M261.929 256 6.458 17.696c-1.054.516-2.058 1.142-2.993 1.89L261.929 256z" />
              <path fill="#00DA65" d="M261.929 256 3.465 492.414c.934.748 1.939 1.374 2.993 1.89L261.929 256z" />
              <path fill="#FF3A44" d="M419.978 237.362 61.992 19.26C53.463 14.192 43.529 13.65 34.445 19.532L261.929 256 419.978 237.362z" />
              <path fill="#C31162" d="M261.929 256 34.445 492.468c9.084 5.882 19.018 5.34 27.547.272l358.986-218.103L261.929 256z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors mb-0.5">
              Get it on Play Store
            </span>
            <span className="text-[10px] text-[#716a93] font-medium leading-tight">
              Download the Android app
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="group relative flex items-center justify-center w-[34px] h-[34px] sm:w-9 sm:h-9 rounded-full transition-all shrink-0 border border-dashed border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white"
        title="Get it on Google Play"
        aria-label="Download Bluebuff Games on Google Play"
      >
        <svg className="w-4 h-4" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path fill="#32BBFF" d="M396.121 229.173 34.445 19.532C25.061 14.118 14.968 13.418 6.458 17.696L261.929 256 396.121 229.173z" />
          <path fill="#32BBFF" d="m6.458 494.304 255.471-238.303L6.458 17.696C2.592 19.636 0 24.169 0 30.47v451.06c0 6.301 2.592 10.834 6.458 12.774z" />
          <path fill="#FFD700" d="M419.978 274.638 396.121 261.17 261.929 256l134.192 26.827 23.857 13.469c11.27-6.408 11.27-15.25 0-21.658z" />
          <path fill="#F3BC00" d="m396.121 282.827-361.676 209.64c9.084 5.203 19.018 4.66 27.547-.407L419.978 274.638 396.121 282.827z" />
          <path fill="#00F076" d="M261.929 256 6.458 17.696c-1.054.516-2.058 1.142-2.993 1.89L261.929 256z" />
          <path fill="#00DA65" d="M261.929 256 3.465 492.414c.934.748 1.939 1.374 2.993 1.89L261.929 256z" />
          <path fill="#FF3A44" d="M419.978 237.362 61.992 19.26C53.463 14.192 43.529 13.65 34.445 19.532L261.929 256 419.978 237.362z" />
          <path fill="#C31162" d="M261.929 256 34.445 492.468c9.084 5.882 19.018 5.34 27.547.272l358.986-218.103L261.929 256z" />
        </svg>
      </button>
    </div>
  );
}
