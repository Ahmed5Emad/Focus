import { Header } from "@/components/layout/Header";
import Footer from "@/sections/footer/Footer";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, EyeOff } from "lucide-react";

const TEAM = [
  { name: "Ahmed E.", role: "CEO" },
  { name: "Ahmed E.", role: "Engineering" },
  { name: "Ahmed E.", role: "Operations" },
];

const Principle = ({ icon: Icon, title, description, colorClass, bgClass }: any) => (
  <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}>
      <Icon className={`w-6 h-6 ${colorClass}`} />
    </div>
    <div className="flex flex-col gap-2">
      <h4 className="text-2xl font-bold text-slate-900">{title}</h4>
      <p className="text-slate-600 text-lg leading-relaxed">{description}</p>
    </div>
  </div>
);

const TeamMember = ({ name, role }: { name: string; role: string }) => (
  <div className="flex flex-col gap-4">
    <div className="aspect-[3/4] rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center overflow-hidden">
      <div className="w-16 h-16 rounded-full bg-white/20 blur-xl"></div>
    </div>
    <div className="flex flex-col">
      <h5 className="font-bold text-slate-900">{name}</h5>
      <span className="text-xs font-medium text-slate-500 tracking-wider uppercase mt-1">{role}</span>
    </div>
  </div>
);

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1 flex flex-col items-center w-full">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center max-w-4xl w-full pt-32 pb-24 px-6 gap-8">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight text-center leading-tight">
            Our Mission Is To<br />Eliminate The Noise.
          </h1>
          <p className="text-xl text-slate-500 text-center max-w-2xl leading-relaxed font-light">
            We believe software should get out of the way. In a world full of distractions, Focus is designed to respect your attention and value your time above all else.
          </p>
        </section>

        <div className="w-full max-w-[96px] h-px bg-slate-300 mb-24"></div>

        {/* Story Section */}
        <section className="flex flex-col items-start max-w-4xl w-full pb-32 px-6 gap-8">
          <h3 className="text-xs font-bold text-slate-400 tracking-[1.2px] uppercase">The Story</h3>
          <div className="flex flex-col gap-6 text-slate-900 text-lg leading-relaxed font-normal">
            <p>
              It started with a simple observation: modern tools are loud. They beep, they bounce, and they demand your attention constantly. We realized that in our quest for productivity, we had built environments that made it impossible to actually think.
            </p>
            <p>
              We asked ourselves, "What if a tool could be silent?"
            </p>
            <p>
              Focus was born from the desire to reclaim deep work. We stripped away the badges, the unnecessary notifications, and the clutter. We focused on typography, speed, and the feeling of calmness. We didn't build Focus to be another app you check; we built it to be the place where your best work happens.
            </p>
            <p>
              Today, Focus is used by thousands of writers, developers, and designers who choose clarity over chaos. We are a small, independent team committed to sustainable software that respects the user.
            </p>
          </div>
        </section>

        {/* Principles Section */}
        <section className="flex flex-col items-start max-w-4xl w-full pb-32 px-6 gap-12">
          <h3 className="text-xs font-bold text-slate-400 tracking-[1.2px] uppercase">Our Principles</h3>
          <div className="flex flex-col gap-12 w-full">
            <Principle 
              icon={Zap} 
              title="Speed as a feature" 
              description="We measure interactions in milliseconds, not seconds. Every delay is a distraction. We optimize for instant feedback and seamless transitions."
              colorClass="text-cu-purple"
              bgClass="bg-cu-purple/10"
            />
            <Principle 
              icon={EyeOff} 
              title="Zero distractions" 
              description="No red dots. No unread counts. No unsolicited pop-ups. The interface only speaks when you ask it to. Silence is our default state."
              colorClass="text-cu-pink"
              bgClass="bg-cu-pink/10"
            />
            <Principle 
              icon={Shield} 
              title="Privacy by design" 
              description="Your data stays on your device, encrypted and secure. We don't sell your attention to advertisers. You are the customer, not the product."
              colorClass="text-cu-orange"
              bgClass="bg-cu-orange/10"
            />
          </div>
        </section>

        <div className="w-full h-px bg-slate-200 mb-24"></div>

        {/* Team Section */}
        <section className="flex flex-col items-start max-w-6xl w-full pb-24 px-6 gap-12">
          <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-end gap-6">
            <div className="flex flex-col gap-4 max-w-lg">
              <h3 className="text-4xl font-bold text-slate-900 tracking-tight">The Builders</h3>
              <p className="text-slate-500 text-lg">A small team of craftspeople dedicated to quality.</p>
            </div>
            <Link to="/careers" className="flex items-center gap-2 text-slate-900 font-bold hover:underline">
              Join our team <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
            {TEAM.map((member, index) => (
              <TeamMember key={index} name={member.name} role={member.role} />
            ))}
            <Link to="/careers" className="group flex flex-col gap-4">
              <div className="aspect-[3/4] rounded-xl bg-slate-900 flex flex-col items-center justify-center overflow-hidden relative transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-cu-purple/40 via-transparent to-cu-pink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 border border-white/20">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <span className="z-10 text-white font-bold text-lg tracking-tight">Join the mission</span>
              </div>
              <div className="flex flex-col">
                <h5 className="font-bold text-slate-900">Your Name Here?</h5>
                <span className="text-xs font-medium text-slate-500 tracking-wider uppercase mt-1">Open Positions</span>
              </div>
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
