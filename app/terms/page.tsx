import { Metadata } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";
const siteUrl = rawSiteUrl.replace(/\/+$/, "");
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "crew.bluebuffofficial@gmail.com";

export const metadata: Metadata = {
  title: `Terms of Service | ${siteName}`,
  description: `Review the terms of service and usage guidelines for playing free online browser games on ${siteName}.`,
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: `Terms of Service | ${siteName}`,
    description: `Terms of service and usage guidelines for ${siteName}.`,
    url: `${siteUrl}/terms`,
    siteName,
    type: "website",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
      
      <div className="prose prose-invert max-w-none text-zinc-300 space-y-6">
        <p className="text-xs text-zinc-400 font-mono">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        
        <p>
          These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and {siteName} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), concerning your access to and use of the {siteName} website and mobile applications.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing or using our platform, you agree that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these terms, you are expressly prohibited from using the platform and must discontinue use immediately.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. User Accounts & Responsibilities</h2>
        <p>When you create an account on our platform:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You are responsible for maintaining the confidentiality of your account credentials and login sessions.</li>
          <li>You agree to provide accurate and complete registration information.</li>
          <li>You may not use our platform for any illegal, unauthorized, or abusive purpose, including exploiting games, botting XP, or disrupting services for other users.</li>
          <li>You may terminate or delete your account at any time through your Profile settings.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Intellectual Property Rights & Game Content</h2>
        <p>
          Unless otherwise stated, {siteName} and its licensors own all intellectual property rights for the website software, UI designs, logos, and branding.
          Games hosted or embedded on our platform are the intellectual property of their respective creators and publishers. We host web games under developer agreements, open licensing, or embedding permissions.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Disclaimers & Limitation of Liability</h2>
        <p>
          Our platform and all games are provided on an &quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot; basis without warranties of any kind. We make no representations regarding the uptime, availability, or accuracy of third-party game content. To the maximum extent permitted by law, {siteName} shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the platform.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Modifications to Services</h2>
        <p>
          We reserve the right to change, update, or discontinue features, games, or platform functionality at any time without prior notice.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Referral Program</h2>
        <p>
          {siteName} may offer a referral program that rewards users for inviting others to the platform. By participating in the referral program, you agree to the following:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Referral rewards (such as XP or bonuses) are granted only for genuine new user sign-ups through your unique referral link.</li>
          <li>You may not use bots, scripts, fake accounts, or any automated means to generate fraudulent referrals.</li>
          <li>We reserve the right to review, withhold, or permanently revoke referral rewards if abuse, fraud, or manipulation is detected.</li>
          <li>Accounts found to be exploiting the referral system may be suspended or permanently banned without prior notice.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Contact Us</h2>
        <p>If you have any questions or inquiries regarding these Terms of Service, please reach out to us at:</p>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 inline-block">
          <p className="text-sm text-zinc-400">Support Team:</p>
          <p className="font-semibold text-indigo-400">{supportEmail}</p>
        </div>
      </div>
    </div>
  );
}
