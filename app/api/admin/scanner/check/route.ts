import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email !== (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Try HEAD request first for speed
    let isOk = false;
    let status = 0;
    
    // Set a timeout of 8 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          // Some servers block requests without a User-Agent
          "User-Agent": "Mozilla/5.0 (compatible; TapAndPlayBot/1.0)"
        }
      });
      status = response.status;
      // Some servers might return 405 Method Not Allowed for HEAD, so we'll fallback to GET
      if (response.ok) {
        isOk = true;
      } else if (status === 405 || status === 403) {
        // Fallback to GET
        const getResponse = await fetch(url, { 
          method: 'GET',
          signal: controller.signal,
          headers: { "User-Agent": "Mozilla/5.0 (compatible; TapAndPlayBot/1.0)" }
        });
        status = getResponse.status;
        isOk = getResponse.ok;
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        status = 408; // Request Timeout
      } else {
        // Fallback to GET on generic fetch errors (sometimes HEAD is strictly blocked at connection level)
        try {
          const getResponse = await fetch(url, { 
            method: 'GET',
            signal: controller.signal,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; BluebuffBot/1.0)" }
          });
          status = getResponse.status;
          isOk = getResponse.ok;
        } catch (getErr) {
          status = 0;
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }

    return NextResponse.json({ ok: isOk, status });
  } catch (error: any) {
    console.error("Scanner check error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
