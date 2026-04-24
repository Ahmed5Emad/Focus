import React from 'react';
import { ArrowRight } from 'lucide-react';
import Header from '../../sections/onboarding/Header';
import { PowerToolsHero } from '../../sections/onboarding/PowerToolsHero';
import { PowerToolsVisuals } from '../../sections/onboarding/PowerToolsVisuals';
import { Slider } from '../../components/ui/slider';
import { Link } from 'react-router-dom';
import { OnboardingData } from '../../data/mockData';

const OnboardingPowerTools: React.FC = () => {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow relative kinetic-gradient flex flex-col items-center justify-center overflow-hidden">
        <div className="max-w-[1280px] w-full px-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
          <PowerToolsHero />
          <PowerToolsVisuals />
        </div>
        <div className="pb-8 w-full max-w-[1280px] px-8 flex justify-between items-center">
            <Slider totalSteps={4} currentStep={2} />
            <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-500">STEP 3 OF 4</span>
                <Link to="/onboarding/deep-work" className="text-slate-900 font-bold">Back</Link>
                <Link to="/onboarding/final-setup" className="bg-cu-purple hover:bg-cu-purple/90 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2">
                    {OnboardingData.powerTools.primaryButton} <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingPowerTools;
