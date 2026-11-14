import Link from "next/link";
import { Search } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <div className="text-[120px] md:text-[180px] font-extrabold text-zinc-900 leading-none select-none relative">
        404
        <div className="absolute inset-0 flex items-center justify-center">
          <Search className="w-16 h-16 md:w-24 md:h-24 text-primary opacity-50" />
        </div>
      </div>
      <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 -mt-8 relative z-10">
        Page Not Found
      </h1>
      <p className="text-zinc-400 max-w-md mx-auto text-base md:text-lg mb-8 leading-relaxed">
        We couldn't find the page or game you're looking for. It might have been moved or deleted.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 active:scale-95 text-black font-semibold text-sm transition-all shadow-lg shadow-white/10"
      >
        Return Home
      </Link>
    </div>
  );
}
