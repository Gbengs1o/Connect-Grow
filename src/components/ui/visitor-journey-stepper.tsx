import { CheckCircle, Circle } from 'lucide-react';
import { VisitorStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const journeySteps: VisitorStatus[] = ["First Visit", "Second Visit", "Integration", "Membership"];

interface VisitorJourneyStepperProps {
  currentStatus: VisitorStatus;
}

export function VisitorJourneyStepper({ currentStatus }: VisitorJourneyStepperProps) {
  const currentIndex = journeySteps.indexOf(currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {journeySteps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;
          const isLast = index === journeySteps.length - 1;

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step indicator and label */}
              <div className="flex flex-col items-center">
                {/* Step indicator */}
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                    {
                      "bg-primary border-primary text-primary-foreground": isCompleted,
                      "border-primary bg-background text-primary ring-4 ring-primary/20": isCurrent,
                      "border-gray-200 bg-gray-100 text-gray-400": isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className={cn("w-5 h-5", {
                      "fill-current": isCurrent
                    })} />
                  )}
                </div>
                
                {/* Step label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-xs font-medium transition-colors duration-200",
                      {
                        "text-primary font-semibold": isCompleted,
                        "text-primary font-bold": isCurrent,
                        "text-gray-400": isUpcoming,
                      }
                    )}
                  >
                    {step}
                  </p>
                </div>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div className="flex-1 mx-4">
                  <div
                    className={cn(
                      "h-0.5 transition-colors duration-200",
                      {
                        "bg-primary": isCompleted,
                        "bg-gray-200": isCurrent || isUpcoming,
                      }
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress description */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {currentIndex === 0 && "Welcome! This is their first visit with us."}
          {currentIndex === 1 && "Great! They've returned for a second visit."}
          {currentIndex === 2 && "They're actively integrating into our community."}
          {currentIndex === 3 && "Wonderful! They've become a member of our church family."}
        </p>
      </div>
    </div>
  );
}