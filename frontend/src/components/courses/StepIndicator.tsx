import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop horizontal stepper */}
      <div className="hidden sm:flex items-center justify-center gap-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          return (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300",
                  isCompleted ? "bg-primary border-primary text-primary-foreground" :
                  isActive ? "bg-primary/20 border-primary text-primary" :
                  "bg-secondary border-border text-muted-foreground"
                )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <div className="mt-2 text-center">
                  <p className={cn("text-xs font-semibold", isActive ? "text-primary" : "text-muted-foreground")}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground hidden md:block">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-16 md:w-24 h-0.5 mx-2 mb-8 transition-all duration-300",
                  index < currentStep ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile compact stepper */}
      <div className="sm:hidden flex items-center justify-between mb-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300",
                isCompleted ? "bg-primary border-primary text-primary-foreground" :
                isActive ? "bg-primary/20 border-primary text-primary" :
                "bg-secondary border-border text-muted-foreground"
              )}>
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className={cn("text-xs mt-1 font-medium", isActive ? "text-primary" : "text-muted-foreground")}>{step.label}</span>
              {index < steps.length - 1 && (
                <div className={cn("absolute hidden")} />
              )}
            </div>
          );
        })}
      </div>
      {/* Mobile progress bar */}
      <div className="sm:hidden w-full bg-secondary h-1.5 rounded-full mt-1">
        <div
          className="bg-primary h-full rounded-full transition-all duration-500"
          style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
