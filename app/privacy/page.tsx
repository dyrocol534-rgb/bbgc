import { Metadata } from "next";
import Link from "next/link";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";
const siteUrl = rawSiteUrl.replace(/\/+$/, "");
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "crew.bluebuffofficial@gmail.com";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteName}`,
  description: `Learn how ${siteName} protects and respects your privacy when playing free browser games on our platform.`,
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: `Privacy Policy | ${siteName}`,
    description: `Learn how ${siteName} protects your privacy.`,
    url: `${siteUrl}/privacy`,
    siteName,
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
      
      <div className="prose prose-invert max-w-none text-zinc-300 space-y-6">
        <p className="text-xs text-zinc-400 font-mono">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        
        <p>
          Welcome to {siteName} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy.
          This Privacy Policy explains how we collect, use, store, and safeguard your data when you visit our website or use our mobile applications.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
        <p>We collect information that you provide to us as well as data automatically gathered when you access our platform:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account & Personal Information:</strong> When you sign in (e.g., via Google Authentication), we collect your name, email address, profile photo, and an optional phone number/bio if you choose to provide them.</li>
          <li><strong>Gameplay & Progress Data:</strong> We record your gameplay sessions, recently played games, favorited games, accumulated experience points (XP), streak records, and achievements to provide a personalized gaming experience.</li>
          <li><strong>Device & Usage Data:</strong> We collect standard technical information including your IP address, browser type, operating system version, referrer URLs, and interaction timestamps to ensure security, prevent abuse, and optimize performance.</li>
          <li><strong>Cookies & Local Storage:</strong> We use local storage and cookies to maintain your login session and store your preferences locally on your device.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
        <p>We use the collected information for purposes including:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Providing, operating, and maintaining our gaming platform and services.</li>
          <li>Maintaining user profiles, leaderboards, and streak/reward systems.</li>
          <li>Preventing fraud, bot traffic, and unauthorized activity.</li>
          <li>Responding to your feedback, inquiries, or support requests.</li>
          <li>Delivering optional push notifications and platform updates (only with your explicit consent).</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Data Sharing & Third Parties</h2>
        <p>
          We do not sell, rent, or trade your personal data to third parties. We may share information with trusted third-party providers solely to facilitate our services (such as cloud hosting providers and authentication services).
          External game developers whose games are embedded on our platform operate under their own terms and privacy policies.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Account & Data Deletion (User Rights)</h2>
        <p>
          We believe in full user control over personal data. You have the right to access, export, or permanently delete your account and all associated personal information at any time.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 my-4 space-y-3">
          <h3 className="text-lg font-bold text-white">How to Delete Your Account:</h3>
          <ol className="list-decimal pl-6 space-y-2 text-zinc-300 text-sm">
            <li><strong>In-App / Website (Instant):</strong> Log into your account, visit your <Link href="/profile" className="text-indigo-400 hover:underline">Profile Page</Link>, navigate to <strong>Account Settings</strong>, and click <strong>&quot;Delete Account & Data&quot;</strong>.</li>
            <li><strong>Via Email Request:</strong> You can also request complete account deletion by sending an email from your registered address to <a href={`mailto:${supportEmail}`} className="text-indigo-400 hover:underline">{supportEmail}</a> with the subject line <em>&quot;Account Deletion Request&quot;</em>.</li>
          </ol>
          <p className="text-xs text-zinc-400 mt-2">
            Upon deletion, your account record, personal profile, XP, streak progress, and gameplay records are permanently and irreversibly removed from our database.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Children&apos;s Privacy</h2>
        <p>
          Our platform is designed for general audiences and does not knowingly collect personally identifiable information from children under the age of 13. If you believe that a child has provided us with personal information without parental consent, please contact us immediately, and we will delete the data.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Data Security</h2>
        <p>
          We employ industry-standard encryption, HTTPS transmission, secure authentication protocols, and database access controls to safeguard your data against unauthorized access, alteration, or disclosure.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Contact Us</h2>
        <p>If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at:</p>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 inline-block">
          <p className="text-sm text-zinc-400">Support & Privacy Officer:</p>
          <p className="font-semibold text-indigo-400">{supportEmail}</p>
        </div>
      </div>
    </div>
  );
}
