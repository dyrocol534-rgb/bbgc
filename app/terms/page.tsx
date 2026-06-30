export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
      
      <div className="prose prose-invert max-w-none text-zinc-300 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <p>
          These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Bluebuff Games ("we," "us" or "our"), concerning your access to and use of the Bluebuff Games website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Intellectual Property Rights</h2>
        <p>
          Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. User Representations</h2>
        <p>By using the Site, you represent and warrant that:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>All registration information you submit will be true, accurate, current, and complete.</li>
          <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
          <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
          <li>You will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.</li>
          <li>You will not use the Site for any illegal or unauthorized purpose.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Games and Content</h2>
        <p>
          Bluebuff Games hosts various web-based games. We do not claim ownership over games submitted by third-party developers unless specifically stated. 
          If you are a copyright owner and believe that any content on this site infringes upon your copyrights, please refer to our DMCA Copyright Policy.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Modifications and Interruptions</h2>
        <p>
          We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. 
          However, we have no obligation to update any information on our Site. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Contact Us</h2>
        <p>In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:</p>
        <p className="font-semibold text-primary">crew.bluebuffofficial@gmail.com</p>
      </div>
    </div>
  );
}
