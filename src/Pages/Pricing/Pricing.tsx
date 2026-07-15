import { useState, Fragment } from "react";
import { Header } from "@/components/layout/Header";
import Footer from "@/sections/footer/Footer";
import { Button } from "@/components/ui/button";
import { Check, Minus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Extracted Sub-Components ---

const comparisonFeatures = [
  {
    category: "Task Management",
    features: [
      { name: "Projects", personal: "1", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "List / Calendar / Kanban views", personal: "List", pro: true, enterprise: true },
      { name: "Task dependencies & recurrence", personal: false, pro: true, enterprise: true },
      { name: "Custom fields & statuses", personal: false, pro: true, enterprise: true },
      { name: "Task templates", personal: false, pro: true, enterprise: true },
    ],
  },
  {
    category: "Deep Work",
    features: [
      { name: "Focus Timer with distraction logging", personal: true, pro: true, enterprise: true },
      { name: "Flow Score analytics", personal: true, pro: true, enterprise: true },
      { name: "Focus Streak tracking", personal: true, pro: true, enterprise: true },
      { name: "Session history & reports", personal: "7 days", pro: "Unlimited", enterprise: "Unlimited" },
    ],
  },
  {
    category: "Collaboration",
    features: [
      { name: "Team Chat (channels & DMs)", personal: false, pro: true, enterprise: true },
      { name: "File sharing in chat", personal: "5 MB", pro: "100 MB", enterprise: "5 GB" },
      { name: "Real-time document editor", personal: false, pro: true, enterprise: true },
      { name: "Document comments & collaboration", personal: false, pro: true, enterprise: true },
      { name: "Goals & progress tracking", personal: false, pro: true, enterprise: true },
    ],
  },
  {
    category: "Integrations & Admin",
    features: [
      { name: "GitHub / Slack / Discord integrations", personal: false, pro: "GitHub only", enterprise: true },
      { name: "Multi-workspace support", personal: "1 workspace", pro: "5 workspaces", enterprise: "Unlimited" },
      { name: "Role management", personal: false, pro: "Standard", enterprise: "Advanced" },
      { name: "SSO (SAML)", personal: false, pro: false, enterprise: true },
      { name: "Support Level", personal: "Community", pro: "Priority Email", enterprise: "24/7 Dedicated" },
    ],
  },
];

const PricingFeature = ({ text, included = true }: { text: string; included?: boolean }) => (
  <li className={cn("flex items-center gap-3 font-medium text-sm", included ? "text-card-foreground" : "text-muted-foreground")}>
    {included ? <Check className="w-5 h-5 text-card-foreground" /> : <Minus className="w-5 h-5" />}
    {text}
  </li>
);

const limitedValues = ["1", "7 days", "5 MB", "Community", "List", "GitHub only", "1 workspace"];

const FeatureValue = ({ value, mobile = false }: { value: string | boolean; mobile?: boolean }) => {
  if (typeof value === "boolean") {
    return value ? (
      <Check className={cn("w-5 h-5 text-card-foreground", !mobile && "mx-auto")} />
    ) : (
      <Minus className={cn("w-5 h-5 text-muted-foreground/40", !mobile && "mx-auto")} />
    );
  }
  return (
    <span className={cn(
      "font-light",
      limitedValues.includes(value) ? "text-muted-foreground!" : "text-card-foreground"
    )}>
      {value}
    </span>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
    <details className="group border-b border-border dark:border-slate-700 pb-6 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-lg font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-cu-purple focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-sm">
        {question}
        <ChevronDown className="w-5 h-5 transition duration-300 group-open:-rotate-180" />
      </summary>
      <p className="mt-4 text-muted-foreground leading-relaxed font-light animate-in fade-in slide-in-from-top-2">
      {answer}
    </p>
  </details>
);

// --- Main Page Component ---

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center w-full pb-24">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center w-full max-w-7xl pt-16 md:pt-24 pb-12 md:pb-16 px-4 md:px-6 gap-6">
          <h1 className="text-6xl md:text-7xl font-black text-foreground tracking-tight text-center uppercase">
            Transparent<br />Pricing.
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl leading-relaxed font-light">
            Focus on your work, not hidden costs. Simple, transparent pricing for individuals and teams who value productivity.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center bg-muted p-1.5 rounded-lg border border-border">
            <button
              onClick={() => setIsYearly(false)}
              className={cn("px-6 py-2 rounded-md text-sm font-medium transition-all", !isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn("px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2", isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              Yearly
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 max-w-6xl w-full px-4 md:px-6 gap-6 md:gap-8 justify-center items-stretch mt-4">
          
          {/* Free */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col relative shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-card-foreground">Free</h3>
              <p className="text-muted-foreground mt-2 text-sm">For individuals building their focus habit.</p>
            </div>
            <div className="text-center mb-8">
              <span className="text-5xl font-light text-card-foreground tracking-tight">$0</span>
              <span className="text-muted-foreground ml-1">/mo</span>
            </div>
            <ul className="flex flex-col gap-4 mb-8 flex-1">
              <PricingFeature text="Focus Timer & distraction logging" />
              <PricingFeature text="Flow Score & Focus Streak" />
              <PricingFeature text="Basic task management" />
              <PricingFeature text="1 active project" />
              <PricingFeature text="Community support" />
              <PricingFeature text="Calendar View" included={false} />
              <PricingFeature text="Team Chat" included={false} />
            </ul>
            <Button variant="outline" className="w-full h-12 text-md font-bold rounded-xl border-border">
              Get Started
            </Button>
          </div>

          {/* Pro */}
          <div className="bg-foreground text-background dark:bg-card dark:text-card-foreground border border-border rounded-2xl p-6 md:p-8 flex flex-col relative shadow-xl md:-mt-4 md:mb-4 md:scale-105 z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background text-foreground border border-border dark:bg-foreground dark:text-background px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
              Most Popular
            </div>
            <div className="text-center mb-6 mt-2">
              <h3 className="text-xl font-bold">Pro</h3>
              <p className="text-muted-foreground mt-2 text-sm">For power users who need the full stack.</p>
            </div>
            <div className="text-center mb-8">
              <span className="text-5xl font-light tracking-tight">${isYearly ? "8" : "10"}</span>
              <span className="text-muted-foreground ml-1">/mo</span>
            </div>
            <ul className="flex flex-col gap-4 mb-8 flex-1 [&_li]:text-background dark:[&_li]:text-card-foreground [&_li>svg]:text-background dark:[&_li>svg]:text-card-foreground">
              <PricingFeature text="Unlimited projects & tasks" />
              <PricingFeature text="Kanban, Calendar & List views" />
              <PricingFeature text="Task dependencies & recurrence" />
              <PricingFeature text="Custom fields & statuses" />
              <PricingFeature text="Real-time document editor" />
              <PricingFeature text="Team Chat (channels & DMs)" />
              <PricingFeature text="Goals & progress tracking" />
              <PricingFeature text="GitHub integration" />
              <PricingFeature text="Priority email support" />
            </ul>
            <Button className="w-full h-12 text-md font-bold rounded-xl bg-background text-foreground hover:bg-muted">
              Start Free Trial
            </Button>
          </div>

          {/* Enterprise */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col relative shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-card-foreground">Enterprise</h3>
              <p className="text-muted-foreground mt-2 text-sm">For large teams and organizations.</p>
            </div>
            <div className="text-center mb-8">
              <span className="text-4xl font-light text-card-foreground tracking-tight">Custom</span>
            </div>
            <ul className="flex flex-col gap-4 mb-8 flex-1 mt-2">
              <PricingFeature text="Everything in Pro" />
              <PricingFeature text="SSO & SAML" />
              <PricingFeature text="Unlimited workspaces" />
              <PricingFeature text="Advanced role management" />
              <PricingFeature text="Dedicated Success Manager" />
              <PricingFeature text="Custom SLAs" />
            </ul>
            <Button variant="outline" className="w-full h-12 text-md font-bold rounded-xl border-border">
              Contact Sales
            </Button>
          </div>
        </section>

        {/* Compare Features Table */}
        <section id="compare" className="w-full max-w-6xl px-4 md:px-6 mt-16 md:mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Compare Features</h2>
            <p className="text-muted-foreground mt-4 text-lg">Detailed breakdown of what's included in each plan.</p>
          </div>

          <div className="hidden md:block bg-card border border-border rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-card border-b border-border">
                  <th className="py-6 px-8 font-semibold text-card-foreground w-[40%] text-lg">Feature</th>
                  <th className="py-6 px-8 font-semibold text-card-foreground text-center w-[20%] text-lg">Personal</th>
                  <th className="py-6 px-8 font-semibold text-card-foreground text-center w-[20%] text-lg">Pro</th>
                  <th className="py-6 px-8 font-semibold text-card-foreground text-center w-[20%] text-lg">Enterprise</th>
                </tr>
              </thead>
              <tbody className="[&>tr>td:first-child]:font-medium [&>tr>td:first-child]:text-card-foreground [&>tr>td:not(:first-child)]:text-center [&>tr>td:not(:first-child)]:font-light [&>tr>td:not(:first-child)]:text-card-foreground text-base">
                {comparisonFeatures.map((category, idx) => (
                  <Fragment key={category.category}>
                    <tr className={cn("bg-card", idx > 0 && "border-t border-border")}>
                      <td colSpan={4} className="py-4 px-8 text-sm font-semibold text-muted-foreground! uppercase tracking-wider">{category.category}</td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.name} className="border-t border-border">
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
              <div key={category.category} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-muted/50 px-6 py-3 border-b border-border">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{category.category}</h3>
                </div>
                <div className="divide-y divide-border">
                  {category.features.map((feature) => (
                    <div key={feature.name} className="p-6">
                      <p className="font-bold text-card-foreground mb-4">{feature.name}</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Personal</span>
                          <div className="text-sm"><FeatureValue value={feature.personal} mobile /></div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pro</span>
                          <div className="text-sm"><FeatureValue value={feature.pro} mobile /></div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Enterprise</span>
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
        <section id="faq" className="w-full bg-foreground text-background dark:bg-card dark:text-card-foreground mt-16 md:mt-32 py-16 md:py-24 px-4 md:px-6 flex justify-center text-left">
          <div className="max-w-3xl w-full">
            <h2 className="text-3xl font-bold tracking-tight mb-16 text-center uppercase">Frequently Asked Questions</h2>
            
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
