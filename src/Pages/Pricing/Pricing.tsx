import { useState, Fragment } from "react";
import { Header } from "@/components/layout/Header";
import Footer from "@/sections/footer/Footer";
import { Button } from "@/components/ui/button";
import { Check, Minus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Extracted Sub-Components ---

const comparisonFeatures = [
  {
    category: "Core Features",
    features: [
      { name: "Projects", personal: "1", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "Task History", personal: "7 days", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "File Uploads", personal: "5 MB", pro: "100 MB", enterprise: "5 GB" },
    ],
  },
  {
    category: "Collaboration",
    features: [
      { name: "Guests", personal: false, pro: true, enterprise: true },
      { name: "Permissions", personal: false, pro: "Standard", enterprise: "Advanced" },
    ],
  },
  {
    category: "Security & Support",
    features: [
      { name: "SSO (SAML)", personal: false, pro: false, enterprise: true },
      { name: "Support Level", personal: "Community", pro: "Priority Email", enterprise: "24/7 Dedicated" },
    ],
  },
];

const PricingFeature = ({ text, included = true }: { text: string; included?: boolean }) => (
  <li className={cn("flex items-center gap-3 font-medium text-sm", included ? "text-slate-700 dark:text-slate-200" : "text-slate-400")}>
    {included ? <Check className="w-5 h-5 text-slate-900 dark:text-white" /> : <Minus className="w-5 h-5" />}
    {text}
  </li>
);

const FeatureValue = ({ value, mobile = false }: { value: string | boolean; mobile?: boolean }) => {
  if (typeof value === "boolean") {
    return value ? (
      <Check className={cn("w-5 h-5 text-slate-900", !mobile && "mx-auto")} />
    ) : (
      <Minus className={cn("w-5 h-5 text-slate-300", !mobile && "mx-auto")} />
    );
  }
  return (
    <span className={cn(
      "font-light",
      (value === "1" || value === "7 days" || value === "5 MB" || value === "Community") ? "text-slate-500!" : "text-slate-900"
    )}>
      {value}
    </span>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
  <details className="group border-b border-slate-800 pb-6 [&_summary::-webkit-details-marker]:hidden">
    <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-lg font-bold text-white uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-cu-purple focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-sm">
      {question}
      <ChevronDown className="w-5 h-5 transition duration-300 group-open:-rotate-180" />
    </summary>
    <p className="mt-4 text-slate-400 leading-relaxed font-light animate-in fade-in slide-in-from-top-2">
      {answer}
    </p>
  </details>
);

// --- Main Page Component ---

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Header />
      <main className="flex-1 flex flex-col items-center w-full pb-24">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center w-full max-w-7xl pt-24 pb-16 px-6 gap-6">
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight text-center uppercase">
            Transparent<br />Pricing.
          </h1>
          <p className="text-xl text-slate-500 text-center max-w-2xl leading-relaxed font-light">
            Focus on your work, not hidden costs. Simple, transparent pricing for individuals and teams who value productivity.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center bg-gray-100 p-1.5 rounded-lg border border-gray-200">
            <button
              onClick={() => setIsYearly(false)}
              className={cn("px-6 py-2 rounded-md text-sm font-medium transition-all", !isYearly ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn("px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2", isYearly ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              Yearly
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 max-w-6xl w-full px-6 gap-8 justify-center items-stretch mt-4">
          
          {/* Personal */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col relative shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Personal</h3>
              <p className="text-slate-500 mt-2 text-sm">For individuals just starting out.</p>
            </div>
            <div className="text-center mb-8">
              <span className="text-5xl font-light text-slate-900 tracking-tight">$0</span>
              <span className="text-slate-500 ml-1">/mo</span>
            </div>
            <ul className="flex flex-col gap-4 mb-8 flex-1">
              <PricingFeature text="Basic task lists" />
              <PricingFeature text="1 active project" />
              <PricingFeature text="Community support" />
              <PricingFeature text="Calendar View" included={false} />
            </ul>
            <Button variant="outline" className="w-full h-12 text-md font-bold rounded-xl border-gray-200">
              Get Started
            </Button>
          </div>

          {/* Pro */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-8 flex flex-col relative shadow-xl md:-mt-4 md:mb-4 scale-105 z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
              Most Popular
            </div>
            <div className="text-center mb-6 mt-2">
              <h3 className="text-xl font-bold text-white">Pro</h3>
              <p className="text-slate-400 mt-2 text-sm">For power users who need more focus.</p>
            </div>
            <div className="text-center mb-8">
              <span className="text-5xl font-light text-white tracking-tight">${isYearly ? "8" : "10"}</span>
              <span className="text-slate-400 ml-1">/mo</span>
            </div>
            <ul className="flex flex-col gap-4 mb-8 flex-1 [&_li]:text-white [&_li>svg]:text-white">
              <PricingFeature text="Unlimited projects" />
              <PricingFeature text="Calendar & Timeline view" />
              <PricingFeature text="Priority support" />
              <PricingFeature text="Advanced integrations" />
            </ul>
            <Button className="w-full h-12 text-md font-bold rounded-xl bg-white text-slate-900 hover:bg-gray-100">
              Start Free Trial
            </Button>
          </div>

          {/* Enterprise */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col relative shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Enterprise</h3>
              <p className="text-slate-500 mt-2 text-sm">For large teams and organizations.</p>
            </div>
            <div className="text-center mb-8">
              <span className="text-4xl font-light text-slate-900 tracking-tight">Custom</span>
            </div>
            <ul className="flex flex-col gap-4 mb-8 flex-1 mt-2">
              <PricingFeature text="SSO & SAML" />
              <PricingFeature text="Audit logs & Data export" />
              <PricingFeature text="Dedicated Success Manager" />
              <PricingFeature text="Custom SLAs" />
            </ul>
            <Button variant="outline" className="w-full h-12 text-md font-bold rounded-xl border-gray-200">
              Contact Sales
            </Button>
          </div>
        </section>

        {/* Compare Features Table */}
        <section className="w-full max-w-6xl px-6 mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Compare Features</h2>
            <p className="text-slate-500 mt-4 text-lg">Detailed breakdown of what's included in each plan.</p>
          </div>

          <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="py-6 px-8 font-semibold text-slate-900 w-[40%] text-lg">Feature</th>
                  <th className="py-6 px-8 font-semibold text-slate-900 text-center w-[20%] text-lg">Personal</th>
                  <th className="py-6 px-8 font-semibold text-slate-900 text-center w-[20%] text-lg">Pro</th>
                  <th className="py-6 px-8 font-semibold text-slate-900 text-center w-[20%] text-lg">Enterprise</th>
                </tr>
              </thead>
              <tbody className="[&>tr>td:first-child]:font-medium [&>tr>td:first-child]:text-slate-900 [&>tr>td:not(:first-child)]:text-center [&>tr>td:not(:first-child)]:font-light [&>tr>td:not(:first-child)]:text-slate-900 text-base">
                {comparisonFeatures.map((category, idx) => (
                  <Fragment key={category.category}>
                    <tr className={cn("bg-white", idx > 0 && "border-t border-gray-200")}>
                      <td colSpan={4} className="py-4 px-8 text-sm font-semibold text-slate-400! uppercase tracking-wider">{category.category}</td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.name} className="border-t border-gray-100">
                        <td className="py-5 px-8">{feature.name}</td>
                        <td className="py-5 px-8"><FeatureValue value={feature.personal} /></td>
                        <td className="py-5 px-8"><FeatureValue value={feature.pro} /></td>
                        <td className="py-5 px-8"><FeatureValue value={feature.enterprise} /></td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-8">
            {comparisonFeatures.map((category) => (
              <div key={category.category} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{category.category}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {category.features.map((feature) => (
                    <div key={feature.name} className="p-6">
                      <p className="font-bold text-slate-900 mb-4">{feature.name}</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal</span>
                          <div className="text-sm"><FeatureValue value={feature.personal} mobile /></div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pro</span>
                          <div className="text-sm"><FeatureValue value={feature.pro} mobile /></div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enterprise</span>
                          <div className="text-sm"><FeatureValue value={feature.enterprise} mobile /></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="w-full bg-slate-950 mt-32 py-24 px-6 flex justify-center text-left">
          <div className="max-w-3xl w-full">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-16 text-center uppercase">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <FAQItem 
                question="Can I export my data?" 
                answer="Yes. You can export all your tasks, projects, and notes in standard JSON or CSV formats at any time. We believe you should always own your data." 
              />
              <FAQItem 
                question="What platforms are supported?" 
                answer="Focus is available as a native desktop application for macOS, Windows, and Linux. We also offer a high-performance web dashboard for access on the go." 
              />
              <FAQItem 
                question="Is Focus secure?" 
                answer="Security is our core priority. Every Focus account includes end-to-end encryption for all synchronized data. We do not sell user information to third parties." 
              />
              <FAQItem 
                question="How does the 14-day trial work?" 
                answer="When you sign up for Pro, you get a full 14 days to explore all features. No credit card is required to start the trial phase." 
              />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
