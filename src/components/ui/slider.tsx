import React from 'react';

interface SliderProps {
  readonly totalSteps: number;
  readonly currentStep: number;
  readonly className?: string;
}

export const Slider: React.FC<SliderProps> = ({ totalSteps, currentStep, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ${
            index === currentStep
              ? 'w-10 bg-cu-purple'
              : 'w-10 bg-cu-purple/20'
          }`}
        />
      ))}
    </div>
  );
};

export default Slider;
