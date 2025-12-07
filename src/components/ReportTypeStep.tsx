import { useState } from 'react';
import { useWizard } from './WizardContext';
import { FileText, MessageSquare, Files } from 'lucide-react';

interface ReportTypeStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function ReportTypeStep({ onNext, onPrevious }: ReportTypeStepProps) {
  const { data, updateData } = useWizard();
  const [selected, setSelected] = useState(data.reportType);

  const handleContinue = () => {
    if (selected) {
      updateData({ reportType: selected });
      onNext();
    }
  };

  const options = [
    {
      value: 'accident' as const,
      icon: FileText,
      title: 'Zawiadomienie o wypadku',
      description: 'Chcę zgłosić wypadek przy pracy, który miał miejsce podczas wykonywania działalności gospodarczej',
    },
    {
      value: 'explanation' as const,
      icon: MessageSquare,
      title: 'Wyjaśnienia poszkodowanego',
      description: 'Chcę złożyć wyjaśnienia dotyczące zgłoszonego już wypadku',
    },
    {
      value: 'both' as const,
      icon: Files,
      title: 'Zawiadomienie i wyjaśnienia',
      description: 'Chcę złożyć zarówno zawiadomienie o wypadku, jak i wyjaśnienia poszkodowanego',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-blue-900 mb-2">Wybierz rodzaj zgłoszenia</h2>
        <p className="text-gray-600">
          Wybierz, jaki dokument chcesz przygotować. Możesz wybrać jedną lub obie opcje.
        </p>
      </div>

      <div className="space-y-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.value;

          return (
            <button
              key={option.value}
              onClick={() => setSelected(option.value)}
              className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${isSelected ? 'bg-blue-600' : 'bg-gray-100'}`}>
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1">
                  <h3 className={isSelected ? 'text-blue-900' : 'text-gray-900'}>
                    {option.title}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {option.description}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-blue-600' : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-gray-700">
          <strong>Wskazówka:</strong> Jeśli zgłaszasz wypadek po raz pierwszy, wybierz opcję 
          "Zawiadomienie i wyjaśnienia", aby przygotować kompletną dokumentację.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Wstecz
        </button>
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Dalej
        </button>
      </div>
    </div>
  );
}
