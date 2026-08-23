import { Metadata } from "next";
import { Mail, MessageSquare, MapPin } from "lucide-react";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";
const siteUrl = rawSiteUrl.replace(/\/+$/, "");

export const metadata: Metadata = {
  title: `Contact Us | ${siteName}`,
  description: `Get in touch with the ${siteName} team. Reach out for game developer submissions, feedback, bug reports, and support.`,
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: `Contact Us | ${siteName}`,
    description: `Get in touch with the ${siteName} team.`,
    url: `${siteUrl}/contact`,
    siteName,
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Get in Touch</h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          Have a question about a game, want to report a bug, or just want to say hi? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Support Card */}
        <div className="bg-surface border border-border-main rounded-2xl p-8 text-center hover:border-primary-light transition-colors group">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Support & General</h2>
          <p className="text-zinc-400 mb-6 text-sm">For all general inquiries and support questions.</p>
          <a href="mailto:crew.bluebuffofficial@gmail.com" className="text-primary hover:text-primary-light font-medium transition-colors">
            crew.bluebuffofficial@gmail.com
          </a>
        </div>

        {/* DMCA Card */}
        <div className="bg-surface border border-border-main rounded-2xl p-8 text-center hover:border-primary-light transition-colors group">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Legal & DMCA</h2>
          <p className="text-zinc-400 mb-6 text-sm">For copyright notices and legal inquiries.</p>
          <a href="mailto:crew.bluebuffofficial@gmail.com" className="text-primary hover:text-primary-light font-medium transition-colors">
            crew.bluebuffofficial@gmail.com
          </a>
        </div>

        {/* Location Card */}
        <div className="bg-surface border border-border-main rounded-2xl p-8 text-center hover:border-primary-light transition-colors group">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <MapPin className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">HQ Location</h2>
          <p className="text-zinc-400 mb-6 text-sm">We are a fully remote team operating worldwide.</p>
          <span className="text-zinc-300 font-medium">Earth 🌍</span>
        </div>
      </div>
    </div>
  );
}
