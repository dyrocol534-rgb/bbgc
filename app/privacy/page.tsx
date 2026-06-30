export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
      
      <div className="prose prose-invert max-w-none text-zinc-300 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <p>
          Welcome to Bluebuff Games. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
          Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Collection of your Information</h2>
        <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Personal Data:</strong> Personally identifiable information, such as your name and email address, that you voluntarily give to us when you register with the Site via Google Authentication.</li>
          <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
          <li><strong>Gaming Data:</strong> Information regarding your recently played games and favorite games, which is saved to your account and local storage to improve your gaming experience.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Use of your Information</h2>
        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Create and manage your account.</li>
          <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions and the Site to you.</li>
          <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
          <li>Notify you of updates to the Site.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Third-Party Websites</h2>
        <p>
          The Site may contain links to third-party websites and applications of interest, including advertisements and external services, that are not affiliated with us. 
          Once you have used these links to leave the Site, any information you provide to these third parties is not covered by this Privacy Policy.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Contact Us</h2>
        <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
        <p className="font-semibold text-primary">crew.bluebuffofficial@gmail.com</p>
      </div>
    </div>
  );
}
