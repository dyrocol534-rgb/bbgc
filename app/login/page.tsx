"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Gamepad2, Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  let callbackUrl = searchParams.get("callbackUrl") || "/";
  const ref = searchParams.get("ref");
  
  // Preserve the referral code through the login flow
  if (ref && !callbackUrl.includes("ref=")) {
    callbackUrl += (callbackUrl.includes("?") ? "&" : "?") + `ref=${ref}`;
  }

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-8 text-center relative overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.15)]">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col items-center text-center z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-8 tracking-tight">
            Login
          </h1>

          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 px-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25"
          >
            <div className="bg-white p-1 rounded-full flex items-center justify-center">
              <Image
                src="https://www.google.com/favicon.ico"
                alt="Google"
                width={16}
                height={16}
                className="w-4 h-4"
              />
            </div>
            Continue with Google
          </button>
          
          <p className="text-indigo-200/60 text-xs mt-6 max-w-[250px] mx-auto">
            By logging in you are agreeing to our terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
