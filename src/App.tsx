import { useState } from 'react';
import { WizardProvider, useWizard } from './components/WizardContext';
import { ChatProvider } from './components/ChatContext';
import { WelcomeStep } from './components/WelcomeStep';
import { ReportTypeStep } from './components/ReportTypeStep';
import { ReporterInfoStep } from './components/ReporterInfoStep';
import { BusinessInfoStep } from './components/BusinessInfoStep';
import { AccidentDetailsStep } from './components/AccidentDetailsStep';
import { AccidentSequenceStep } from './components/AccidentSequenceStep';
import { InjuryDetailsStep } from './components/InjuryDetailsStep';
import { DocumentReviewStep } from './components/DocumentReviewStep';
import { CompletionStep } from './components/CompletionStep';
import { ProgressBar } from './components/ProgressBar';
import { ProgressPanel } from './components/ProgressPanel';
import { ChatbotInterface } from './components/ChatbotInterface';
import { MessageSquare, FileText } from 'lucide-react';

function MainApp() {
  const { data } = useWizard();
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'chatbot' | 'form'>('chatbot');

  const steps = [
    { component: WelcomeStep, title: 'Witamy' },
    { component: ReportTypeStep, title: 'Rodzaj zgłoszenia' },
    { component: ReporterInfoStep, title: 'Dane zgłaszającego' },
    { component: BusinessInfoStep, title: 'Działalność gospodarcza' },
    { component: AccidentDetailsStep, title: 'Szczegóły zdarzenia' },
    { component: AccidentSequenceStep, title: 'Przebieg wypadku' },
    { component: InjuryDetailsStep, title: 'Obrażenia' },
    { component: DocumentReviewStep, title: 'Przegląd dokumentu' },
    { component: CompletionStep, title: 'Zakończenie' },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleTabChange = (tab: 'chatbot' | 'form') => {
    setActiveTab(tab);
    // Jeśli przechodzimy do formularza i jesteśmy na ekranie powitalnym,
    // a mamy już wybrany rodzaj zgłoszenia, przejdźmy od razu do kroku 1
    if (tab === 'form' && currentStep === 0 && data.reportType) {
      setCurrentStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header minimalistyczny */}
        <header className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-gray-900 mb-3">Zgłoszenie wypadku przy pracy</h1>
            <p className="text-gray-500">
              Pozarolnicza działalność gospodarcza • ZUS
            </p>
          </div>

          {/* Zakładki minimalistyczne */}
          <div className="flex justify-center gap-2 border-b border-gray-200">
            <button
              onClick={() => handleTabChange('chatbot')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
                activeTab === 'chatbot'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Asystent
            </button>
            <button
              onClick={() => handleTabChange('form')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
                activeTab === 'form'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              Formularz
            </button>
          </div>

          {activeTab === 'form' && currentStep > 0 && currentStep < steps.length - 1 && (
            <div className="mt-8">
              <ProgressBar 
                currentStep={currentStep} 
                totalSteps={steps.length - 2}
                currentTitle={steps[currentStep].title}
              />
            </div>
          )}
        </header>

        {activeTab === 'chatbot' ? (
          <ChatbotInterface />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <main className="lg:col-span-2">
              <CurrentStepComponent 
                onNext={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
                onPrevious={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
                isFirst={currentStep === 0}
                isLast={currentStep === steps.length - 1}
              />
            </main>

            {currentStep > 0 && currentStep < steps.length - 1 && (
              <aside className="lg:col-span-1">
                <ProgressPanel />
              </aside>
            )}
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm">
            Zakład Ubezpieczeń Społecznych © 2025
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WizardProvider>
      <ChatProvider>
        <MainApp />
      </ChatProvider>
    </WizardProvider>
  );
}
