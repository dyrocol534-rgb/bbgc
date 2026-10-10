import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: `DMCA & Copyright Policy | ${SITE_CONFIG.name}`,
  description: `DMCA takedown requests, intellectual property inquiries, and copyright notice guidelines for ${SITE_CONFIG.name}.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/dmca`,
  },
  openGraph: {
    title: `DMCA & Copyright Policy | ${SITE_CONFIG.name}`,
    description: `DMCA takedown and copyright policy for ${SITE_CONFIG.name}.`,
    url: `${SITE_CONFIG.url}/dmca`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
};

export default function DMCAPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-8">DMCA Copyright Policy</h1>
      
      <div className="prose prose-invert max-w-none text-zinc-300 space-y-6">
        <p>
          Bluebuff Games respects the intellectual property rights of others and expects its users to do the same. 
          It is our policy, in appropriate circumstances and at our discretion, to disable and/or terminate the accounts of users who repeatedly infringe or are repeatedly charged with infringing the copyrights or other intellectual property rights of others.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Notification of Copyright Infringement</h2>
        <p>
          If you are a copyright owner, or are authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Site by completing the following DMCA Notice of Alleged Infringement and delivering it to our Designated Copyright Agent.
        </p>
        
        <p>Upon receipt of the Notice as described below, Bluebuff Games will take whatever action, in its sole discretion, it deems appropriate, including removal of the challenged material from the Site.</p>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">DMCA Notice of Alleged Infringement ("Notice")</h3>
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            <strong>Identify the copyrighted work:</strong> Identify the copyrighted work that you claim has been infringed, or - if multiple copyrighted works are covered by this Notice - you may provide a representative list of the copyrighted works that you claim have been infringed.
          </li>
          <li>
            <strong>Identify the material:</strong> Identify the material that you claim is infringing (or to be the subject of infringing activity) and that is to be removed or access to which is to be disabled, and provide information reasonably sufficient to permit us to locate the material, including at a minimum, if applicable, the URL of the link shown on the Site where such material may be found.
          </li>
          <li>
            <strong>Provide your contact information:</strong> Provide your mailing address, telephone number, and, if available, email address.
          </li>
          <li>
            <strong>Include both of the following statements in the body of the Notice:</strong>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-zinc-400 italic">
              <li>"I hereby state that I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law (e.g., as a fair use)."</li>
              <li>"I hereby state that the information in this Notice is accurate and, under penalty of perjury, that I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed."</li>
            </ul>
          </li>
          <li>
            <strong>Signature:</strong> Provide your full legal name and your electronic or physical signature.
          </li>
        </ol>

        <p className="mt-8">Deliver this Notice, with all items completed, to our Designated Copyright Agent at:</p>
        <div className="bg-surface-hover p-6 rounded-xl border border-border-main inline-block mt-4">
          <p className="font-semibold text-white mb-1">Copyright Agent</p>
          <p className="text-primary">crew.bluebuffofficial@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
