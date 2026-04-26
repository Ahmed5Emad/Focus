import { useState } from "react";
import { Header } from "@/components/layout/Header";
import Footer from "@/sections/footer/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Activity, Command, Zap, Layers, Share2, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Extracted Sub-Components ---
const FeatureBadge = ({ icon: Icon, text, colorClass }: any) => (
  <span className={cn("text-sm font-bold tracking-widest uppercase flex items-center gap-2", colorClass)}>
    <Icon className="w-4 h-4" /> {text}
  </span>
);

const FlowItem = ({ icon: Icon, text, colorClass, bgClass }: any) => (
  <li className="flex items-center gap-4 text-slate-700 font-bold text-sm">
    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bgClass)}>
      <Icon className={cn("w-4 h-4", colorClass)} />
    </div>
    {text}
  </li>
);

export default function Featured() {
  const [copied, setCopied] = useState(false);

  const codeString = `// Initialize Graph Engine\nconst graph = new FocusGraph({ resolution: 'high' });\ngraph.linkNodes(process_01, data_stream_04);\n\nSTATUS: RENDER_SUCCESS [244ms]`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 font-sans">
      <Header />
      <main className="flex-1 flex flex-col items-center w-full pb-24">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center w-full max-w-7xl pt-20 pb-16 px-4 md:pt-32 md:pb-24 md:px-6 gap-8 relative">
          <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-900/[0.04] dark:bg-[bottom_1px_center] mask-image:linear-gradient(to_bottom,transparent,black)"></div>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-slate-900 tracking-tight text-center leading-none z-10">
            Built for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cu-purple via-cu-pink to-cu-orange pb-2">power user.</span>
          </h1>
          <div className="flex flex-col items-center w-full max-w-2xl mt-12 gap-8 z-10 text-center">
            <p className="text-xl text-slate-500 leading-relaxed">
              Precision tools engineered for high-velocity workflows. No fluff, just pure performance.
            </p>
            <Button variant="outline" className="h-14 px-8 rounded-xl font-bold border-2 border-gray-200 text-slate-700 hover:bg-white shadow-sm flex items-center gap-2">
              <Command className="w-5 h-5 text-slate-400" /> View Documentation
            </Button>
          </div>
        </section>

        {/* Feature 01: Real-time Sync */}
        <section className="flex flex-col md:flex-row max-w-6xl w-full gap-16 md:gap-24 items-center border-t border-gray-200 bg-white py-24 md:py-32 px-6">
          <div className="flex-1 flex flex-col gap-6 items-center text-center md:items-start md:text-left">
            <FeatureBadge icon={Activity} text="01_Sync" colorClass="text-cu-green" />
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Sub-millisecond synchronization.
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              State management reimagined. Your data flows across devices with negligible latency, ensuring your focus remains unbroken across every interface.
            </p>
            <div className="flex items-center gap-4 mt-4 bg-gray-50 px-4 py-2 rounded-lg w-fit border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cu-green animate-pulse"></div>
                <span className="text-sm font-bold text-slate-700">ACTIVE_SYNC</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <span className="text-sm font-medium text-slate-500">LATENCY: 0.8MS</span>
            </div>
          </div>
          <div className="flex-1 w-full bg-gradient-to-br from-cu-green/5 to-cu-blue/5 border border-gray-200 rounded-3xl p-8 md:p-12 flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="relative w-full max-w-md aspect-video bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-center p-8">
              <div className="flex items-center justify-between relative w-full">
                {/* Connecting Line */}
                <div className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-cu-purple via-cu-pink to-cu-blue top-1/2 -translate-y-1/2 opacity-30"></div>
                
                {/* Node A */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cu-purple to-cu-pink shadow-lg flex items-center justify-center z-10 relative">
                  <Layers className="text-white w-8 h-8" />
                </div>
                
                {/* Bouncing Arrow */}
                <div className="w-8 h-8 bg-white border-2 border-cu-pink rounded-full flex items-center justify-center shadow-sm z-10 animate-bounce relative">
                  <ArrowRight className="w-4 h-4 text-cu-pink" />
                </div>
                
                {/* Node B */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cu-blue to-cu-green shadow-lg flex items-center justify-center z-10 relative">
                  <Share2 className="text-white w-8 h-8" />
                </div>
              </div>
              
              {/* Text Labels */}
              <div className="flex justify-between w-full mt-4 px-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-16">Node A</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-16">Node B</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 02: Command Palette */}
        <section className="flex flex-col items-center w-full border-t border-gray-200 bg-gray-50/50 py-32 px-6">
          <div className="flex flex-col items-center w-full max-w-4xl gap-6 text-center mb-16">
            <FeatureBadge icon={Command} text="02_Control" colorClass="text-cu-purple" />
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Total control at your fingertips.
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">
              The Command Palette is the nervous system of Focus. Navigate, search, and execute complex operations without ever touching your mouse.
            </p>
          </div>

          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-105 transform origin-top">
            <div className="flex items-center px-4 py-4 border-b border-gray-100 bg-gray-50/50">
              <Search className="w-5 h-5 text-cu-purple mr-3" />
              <input 
                type="text" 
                placeholder="Search commands or files..." 
                className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                readOnly
              />
              <div className="flex items-center gap-1">
                <kbd className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold text-slate-500 shadow-sm">⌘</kbd>
                <kbd className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold text-slate-500 shadow-sm">K</kbd>
              </div>
            </div>
            <div className="p-2 flex flex-col gap-1">
              <div className="flex items-center justify-between px-3 py-2.5 bg-cu-purple/10 rounded-xl cursor-default">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-cu-purple" />
                  <span className="text-sm font-bold text-cu-purple">Execute Rapid Indexing</span>
                </div>
                <div className="flex items-center gap-1">
                   <kbd className="text-xs font-bold text-cu-purple/60">SHIFT</kbd>
                   <span className="text-cu-purple/40 text-xs">+</span>
                   <kbd className="text-xs font-bold text-cu-purple/60">ENTER</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-xl cursor-default transition-colors">
                <div className="flex items-center gap-3">
                  <Command className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Open Shell Integration</span>
                </div>
              </div>
               <div className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-xl cursor-default transition-colors">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Toggle Advanced Debugger</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 03: Flow */}
        <section className="flex flex-col md:flex-row-reverse max-w-6xl w-full gap-16 md:gap-24 items-center border-t border-gray-200 bg-white py-24 md:py-32 px-6">
          <div className="flex-1 flex flex-col gap-6 items-center text-center md:items-start md:text-left">
            <FeatureBadge icon={Zap} text="03_Flow" colorClass="text-cu-pink" />
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Zero-latency interaction.
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Customizable key bindings that mirror your mental model. Every shortcut is globally accessible and optimized for minimal finger travel.
            </p>
            <ul className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-6">
              <FlowItem icon={Layers} text="Fully Remappable HID" colorClass="text-cu-pink" bgClass="bg-cu-pink/10" />
              <FlowItem icon={Command} text="JSON-based config exports" colorClass="text-cu-orange" bgClass="bg-cu-orange/10" />
              <FlowItem icon={Zap} text="Multi-layered modal editing" colorClass="text-cu-blue" bgClass="bg-cu-blue/10" />
            </ul>
          </div>
          <div className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-3xl p-8 md:p-12 flex items-center justify-center relative overflow-hidden shadow-sm aspect-square md:aspect-auto md:min-h-[400px]">
            <div className="grid grid-cols-3 gap-4 w-full max-w-xs relative z-10">
              <div className="aspect-square bg-white border-2 border-gray-200 rounded-2xl shadow-sm flex items-center justify-center group hover:border-cu-pink hover:shadow-cu-pink/20 transition-all cursor-default">
                <span className="text-2xl font-black text-slate-300 group-hover:text-cu-pink">Q</span>
              </div>
              <div className="aspect-square bg-gradient-to-br from-cu-purple to-cu-pink border-2 border-transparent rounded-2xl shadow-xl flex items-center justify-center scale-110 z-10">
                <span className="text-3xl font-black text-white">W</span>
              </div>
              <div className="aspect-square bg-white border-2 border-gray-200 rounded-2xl shadow-sm flex items-center justify-center group hover:border-cu-orange hover:shadow-cu-orange/20 transition-all cursor-default">
                <span className="text-2xl font-black text-slate-300 group-hover:text-cu-orange">E</span>
              </div>
              <div className="col-span-3 h-12 mt-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm flex items-center justify-center group hover:border-cu-blue transition-all">
                  <span className="text-sm font-bold text-slate-400 group-hover:text-cu-blue">SPACE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 04: Global Graph */}
        <section className="flex flex-col md:flex-row max-w-6xl w-full gap-16 md:gap-24 items-center border-t border-gray-200 bg-gray-50/50 py-24 md:py-32 px-6">
          <div className="flex-1 flex flex-col gap-6 items-center text-center md:items-start md:text-left">
            <FeatureBadge icon={Share2} text="04_Graph" colorClass="text-cu-blue" />
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Visualizing the network.
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
              See how your projects, tasks, and data points interconnect. Our Global Graph engine generates architectural-style visualizations of your entire workflow architecture.
            </p>
            
            <div className="mt-6 w-full bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-800 relative group">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy code</span>
              </Button>
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-cu-red"></div>
                <div className="w-3 h-3 rounded-full bg-cu-yellow"></div>
                <div className="w-3 h-3 rounded-full bg-cu-green"></div>
              </div>
              <pre className="font-mono text-xs md:text-sm leading-loose overflow-x-auto pr-4 md:pr-8">
                <code className="text-slate-400">{'// Initialize Graph Engine'}</code><br/>
                <code className="text-cu-pink">const</code> <code className="text-white">graph =</code> <code className="text-cu-pink">new</code> <code className="text-cu-blue">FocusGraph</code><code className="text-white">({'{'} resolution: </code><code className="text-cu-orange">'high'</code> <code className="text-white">{'}'});</code><br/>
                <code className="text-white">graph.</code><code className="text-cu-blue">linkNodes</code><code className="text-white">(process_01, data_stream_04);</code><br/>
                <br/>
                <code className="text-cu-green font-bold bg-cu-green/20 px-2 py-1 rounded">STATUS: RENDER_SUCCESS [244ms]</code>
              </pre>
            </div>
          </div>

          <div className="flex-1 w-full bg-white border border-gray-200 rounded-3xl p-4 md:p-12 flex items-center justify-center relative overflow-hidden shadow-sm aspect-square md:aspect-auto md:min-h-[450px]">
            <div className="relative w-full max-w-[240px] md:max-w-sm aspect-square">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-tr from-cu-purple to-cu-blue shadow-xl z-20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/20"></div>
              </div>
              <div className="absolute top-[18.18%] left-[18.18%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cu-pink/20 border-2 border-cu-pink flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-cu-pink"></div>
              </div>
              <div className="absolute top-[81.82%] left-[81.82%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cu-orange/20 border-2 border-cu-orange flex items-center justify-center z-10">
                  <div className="w-4 h-4 rounded-full bg-cu-orange"></div>
              </div>
              <div className="absolute top-[28.79%] left-[71.21%] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cu-green/20 border-2 border-cu-green flex items-center justify-center z-10">
                  <div className="w-2 h-2 rounded-full bg-cu-green"></div>
              </div>

              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                {/* SVG dashed circles matching the paths */}
                <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="6 6" className="animate-[spin_60s_linear_infinite]" style={{ transformOrigin: '50% 50%' }} />
                <circle cx="50%" cy="50%" r="30%" fill="none" stroke="#f3f4f6" strokeWidth="2" />
                
                <line x1="50%" y1="50%" x2="18.18%" y2="18.18%" stroke="url(#grad1)" strokeWidth="3" strokeDasharray="6 6" />
                <line x1="50%" y1="50%" x2="81.82%" y2="81.82%" stroke="url(#grad2)" strokeWidth="3" strokeDasharray="6 6" />
                <line x1="50%" y1="50%" x2="71.21%" y2="28.79%" stroke="url(#grad3)" strokeWidth="3" strokeDasharray="6 6" />
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7b68ee" />
                    <stop offset="100%" stopColor="#ff5cba" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7b68ee" />
                    <stop offset="100%" stopColor="#ff8d36" />
                  </linearGradient>
                    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7b68ee" />
                    <stop offset="100%" stopColor="#00a843" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
