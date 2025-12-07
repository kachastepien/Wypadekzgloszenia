interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  currentTitle: string;
}

export function ProgressBar({ currentStep, totalSteps, currentTitle }: ProgressBarProps) {
  const progress = ((currentStep - 1) / totalSteps) * 100;

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="mb-3 flex justify-between items-center">
        <span className="text-gray-900">{currentTitle}</span>
        <span className="text-gray-400 text-sm">
          {currentStep - 1} / {totalSteps}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-gray-900 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}