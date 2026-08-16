export const metadata = {
  title: "Privacy Policy | Innovelous",
  description: "Transparency regarding our data practices and user privacy.",
};

import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white">
      <div className="max-w-4xl mx-auto px-6 py-24 md:py-32">
        
        {/* Header */}
        <header className="border-b border-white/10 pb-8 mb-12">
          <Link 
            href="/" 
            className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-2 mb-6 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span> 
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-zinc-400 text-sm">
            Last Updated: June 2, 2026
          </p>
        </header>

        {/* Content Sections */}
        <div className="space-y-12 text-zinc-300 leading-relaxed">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              1. Overview
            </h2>
            <p>
              Innovelous Tech operates a high-performance presentation website showcasing our engineering, design systems, and digital strategy pipelines. We value absolute simplicity, architectural clarity, and respect for your digital autonomy. This document details our minimal data practices globally.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              2. Data Collection & Interactions
            </h2>
            <p>
              We design our digital environments to be non-intrusive by default. 
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">No Forms:</strong> We do not deploy interactive submission forms anywhere on our site, including the Contact Section or specialized solution directories. All outreach occurs via direct user-initiated communication through standard third-party communication protocols (email or telephone).
              </li>
              <li>
                <strong className="text-zinc-200">Zero Analytics Frameworks:</strong> We do not implement telemetry, tracking scripts, or profiling solutions such as Google Analytics, nor do we run session-recording applications or heatmaps.
              </li>
              <li>
                <strong className="text-zinc-200">No Interaction Monitoring:</strong> While our interface utilizes real-time client-side graphics (such as canvas scenes, hardware-accelerated animations via GSAP, or custom cursor interactions), your physical interactions with these visual components are completely isolated to your local runtime browser thread. They are neither monitored, logged, nor processed on external infrastructure.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              3. Information Processing & Infrastructure
            </h2>
            <p>
              When you send an inquiry to our official contact points via email, your correspondence is routed entirely through standard electronic mail protocols directly into our primary secure administrative mailbox.
            </p>
            <p>
              No centralized backend systems, Customer Relationship Management (CRM) databases, relational databases, or automated marketing automation engines are attached to this web application to scrape, store, or map communication metadata. Your email records remain locked inside our standard mail inbox for professional reference only.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              4. Jurisdiction & Legal Framework (Pakistan)
            </h2>
            <p>
              Innovelous Tech is headquartered in Karachi, Pakistan. Our digital operations and data handling practices are subject to the laws of the Islamic Republic of Pakistan, including the <strong className="text-zinc-200">Prevention of Electronic Crimes Act (PECA) 2016</strong> and applicable telecommunications regulations.
            </p>
            <p>
              While we render our services to a worldwide audience and respect the principles of international frameworks like the GDPR and CCPA, our primary legal jurisdiction rests within Pakistan. We maintain a strict baseline of total architectural transparency, security, and lawful processing for all domestic and international visitors.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              5. Data Rights, Auditing & Deletion Requests
            </h2>
            <p>
              Because we do not preserve automated profiles or historical relational records of your site visit, any records we hold exist strictly within voluntary active business communications. You retain complete authority to verify, modify, or permanently expunge past conversational exchanges.
            </p>
            <p>
              To execute a complete data inspection or file a comprehensive erasure request, transmit an official request directly to our secure node for data compliance management:
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-center text-sm tracking-wide text-zinc-100">
              <a 
                href="mailto:innoveloustechno@gmail.com" 
                className="hover:text-white underline transition-colors duration-200"
              >
                info@innovelous.com
              </a>
            </div>
          </section>

        </div>

        {/* Footer info */}
        <footer className="mt-16 pt-8 border-t border-white/5 text-xs text-zinc-500 text-center">
          &copy; {new Date().getFullYear()} Innovelous Tech. Architecture built with absolute privacy by design.
        </footer>
        
      </div>
    </main>
  );
}