import React from 'react';
import Header from '../../sections/onboarding/Header';
import { FinalSetupHero } from '../../sections/onboarding/FinalSetupHero';
import { FinalSetupForm } from '../../sections/onboarding/FinalSetupForm';
import { Slider } from '../../components/ui/slider';
import { Link } from 'react-router-dom';

const OnboardingFinalSetup: React.FC = () => {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow relative kinetic-gradient flex flex-col items-center justify-center overflow-hidden">
        <div className="max-w-[1280px] w-full px-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
          <FinalSetupHero />
          <div className="lg:col-span-7">
            <FinalSetupForm />
          </div>
        </div>
        <div className="pb-8 w-full max-w-[1280px] px-8 flex justify-between items-center">
            <Slider totalSteps={4} currentStep={3} />
            <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-500">STEP 4 OF 4</span>
                <Link to="/onboarding/power-tools" className="text-slate-900 font-bold">Back</Link>
            </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingFinalSetup;
