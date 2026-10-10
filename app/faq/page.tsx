import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/config';

export const metadata: Metadata = {
  title: `FAQ - Free Online Games, No Download | ${SITE_CONFIG.name}`,
  description: `Frequently asked questions about ${SITE_CONFIG.name}. Learn how to play free browser games with no download, no login, and no registration required.`,
  keywords: [
    'free online games faq',
    'can i play games without downloading',
    'free browser games safe',
    'online games no download',
    'free games for kids safe',
    'browser games no registration',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/faq`,
  },
  openGraph: {
    title: `FAQ - Free Online Games | ${SITE_CONFIG.name}`,
    description: `Everything you need to know about playing free browser games on ${SITE_CONFIG.name}.`,
    url: `${SITE_CONFIG.url}/faq`,
    siteName: SITE_CONFIG.name,
    type: 'website',
  },
};
const siteName = SITE_CONFIG.name;
const siteUrl = SITE_CONFIG.url;

const faqs = [
  {
    question: 'What are the best free online games?',
    answer: `${siteName} features hundreds of the best free online games across every genre including action, puzzle, racing, sports, adventure, IO games, and more. All games are handpicked for quality and fun. Visit our homepage to discover top-rated and trending games updated daily.`,
  },
  {
    question: 'Can I play online games without downloading anything?',
    answer: `Yes! Every game on ${siteName} runs directly in your web browser with no download, no install, and no plugin required. Just click and play instantly on any device.`,
  },
  {
    question: 'Are the games on this site free?',
    answer: `Absolutely. Every single game on ${siteName} is 100% free to play. No hidden charges, no subscriptions, and no in-app purchases.`,
  },
  {
    question: 'Do I need to create an account or log in to play?',
    answer: `No registration or login is required to play any game. You can jump straight into any game without signing up. Creating an account is optional and only used to save progress.`,
  },
  {
    question: 'Are these games safe for kids?',
    answer: `${siteName} hosts browser-based games that are safe and fun for all ages. We curate games carefully to ensure family-friendly content. Always supervise younger children while browsing the internet.`,
  },
  {
    question: 'Can I play these games on my phone or tablet?',
    answer: `Yes! ${siteName} is fully optimized for mobile phones and tablets. All games work in your mobile browser without any download or app installation required.`,
  },
  {
    question: 'What types of games are available?',
    answer: `We offer Action, Adventure, Arcade, Puzzle, Racing, Sports, Shooting, Strategy, IO Games, Driving, Board, Card, Word, Multiplayer games, and more. New games are added daily!`,
  },
  {
    question: 'Can you get viruses from playing browser games?',
    answer: `Browser games on ${siteName} run in a sandboxed environment inside your web browser. They cannot access your files or install software. It is virtually impossible to get a virus from playing games on our site.`,
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${siteUrl}/faq` },
  ],
};

export default function FAQPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <nav className="text-sm text-zinc-500 mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link></li>
            <li className="text-zinc-600">/</li>
            <li className="text-zinc-300">FAQ</li>
          </ol>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-zinc-400 text-lg mb-12 leading-relaxed">
          Everything you need to know about playing free online games on {siteName} - no downloads, no hidden fees.
        </p>

        <div className="space-y-0 divide-y divide-zinc-800">
          {faqs.map((faq, index) => (
            <details key={index} className="group py-6 cursor-pointer">
              <summary className="flex items-center justify-between gap-4 text-white font-semibold text-lg leading-snug list-none select-none hover:text-indigo-300 transition-colors">
                <h2 className="text-base md:text-lg font-semibold">{faq.question}</h2>
                <span className="text-zinc-500 group-open:rotate-180 transition-transform duration-200 shrink-0 text-xl">+</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed text-sm md:text-base">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-16 p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-center">
          <p className="text-zinc-400 mb-4">Still have questions? We are happy to help.</p>
          <Link href="/contact" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
            Contact Us
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Back to All Free Games
          </Link>
        </div>
      </div>
    </>
  );
}
