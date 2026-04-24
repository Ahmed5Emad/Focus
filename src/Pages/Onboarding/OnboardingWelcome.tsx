import React from 'react';
import Hero from '../../sections/onboarding/Hero';
import Visuals from '../../sections/onboarding/Visuals';
import Header from '../../sections/onboarding/Header';
import { Slider } from '../../components/ui/slider';
import { Link } from 'react-router-dom';

const OnboardingWelcome: React.FC = () => {
  console.log("Rendering OnboardingWelcome");
  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="grow relative kinetic-gradient flex flex-col items-center justify-center overflow-hidden">
        <div className="max-w-7xl w-full px-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
          <Hero />
          <Visuals />
        </div>
        <div className="pb-8 w-full max-w-7xl px-8 flex justify-between items-center">
            <Slider totalSteps={4} currentStep={0} />
            <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-500">STEP 1 OF 4</span>
                <button className="text-slate-900 font-bold">Back</button>
                <Link to="/onboarding/deep-work" className="bg-cu-purple hover:bg-cu-purple/90 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2">
                    Next <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
            </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingWelcome;
