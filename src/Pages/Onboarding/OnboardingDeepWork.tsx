import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../sections/onboarding/Header';
import { DeepWorkHero } from '../../sections/onboarding/DeepWorkHero';
import { DeepWorkVisuals } from '../../sections/onboarding/DeepWorkVisuals';
import { Slider } from '../../components/ui/slider';
import { OnboardingData } from '../../data/mockData';

const OnboardingDeepWork: React.FC = () => {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow relative kinetic-gradient flex flex-col items-center justify-center overflow-hidden">
        <div className="max-w-[1280px] w-full px-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
          <DeepWorkHero />
          <DeepWorkVisuals />
        </div>
        <div className="pb-8 w-full max-w-[1280px] px-8 flex justify-between items-center">
            <Slider totalSteps={4} currentStep={1} />
            <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-500">STEP 2 OF 4</span>
                <Link to="/onboarding" className="text-slate-900 font-bold">Back</Link>
                <Link to="/onboarding/power-tools" className="bg-cu-purple hover:bg-cu-purple/90 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2">
                    {OnboardingData.deepWork.primaryButton} <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingDeepWork;
