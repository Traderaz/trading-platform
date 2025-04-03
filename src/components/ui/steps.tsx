'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface Step {
  title: string
  description: string
}

interface StepsProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function Steps({ steps, currentStep, onStepClick }: StepsProps) {
  return (
    <div className="flex items-center">
      {steps.map((step, index) => (
        <React.Fragment key={step.title}>
          <div 
            className={cn(
              "flex items-center cursor-pointer",
              onStepClick && "hover:opacity-80"
            )}
            onClick={() => onStepClick?.(index + 1)}
          >
            <div className="flex flex-col items-center">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep > index + 1 && "bg-primary text-primary-foreground",
                  currentStep === index + 1 && "bg-primary text-primary-foreground",
                  currentStep < index + 1 && "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              <div className="flex flex-col items-center mt-2">
                <span className="text-sm font-medium">{step.title}</span>
                <span className="text-xs text-muted-foreground">{step.description}</span>
              </div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div 
              className={cn(
                "h-[2px] flex-1 mx-4",
                currentStep > index + 1 ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
} 