import { FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
          <FileText className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-blue-900 mb-4">
          Witamy w systemie zgłaszania wypadków przy pracy
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Ten asystent pomoże Ci krok po kroku przygotować zawiadomienie o wypadku przy pracy 
          lub zapis wyjaśnień poszkodowanego dla osoby prowadzącej pozarolniczą działalność gospodarczą.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-blue-900 mb-1">Co zrobi ten asystent?</h3>
            <ul className="text-gray-700 space-y-2 list-disc list-inside ml-2">
              <li>Przeprowadzi Cię przez proces zgłoszenia wypadku</li>
              <li>Pomoże opisać szczegółowo przebieg zdarzenia</li>
              <li>Zweryfikuje kompletność zgłoszenia</li>
              <li>Automatycznie pobierze dane o działalności gospodarczej na podstawie NIP/REGON</li>
              <li>Wygeneruje gotowy dokument do podpisu i wysłania</li>
              <li>Poinformuje o wymaganych dokumentach i kolejnych krokach</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-amber-900 mb-1">Przygotuj przed rozpoczęciem</h3>
            <ul className="text-gray-700 space-y-2 list-disc list-inside ml-2">
              <li>NIP lub REGON prowadzonej działalności gospodarczej</li>
              <li>Dokładną datę i godzinę wypadku</li>
              <li>Szczegółowe informacje o przebiegu zdarzenia</li>
              <li>Dokumentację medyczną (jeśli posiadasz)</li>
              <li>Pełnomocnictwo (jeśli zgłaszasz wypadek w imieniu poszkodowanego)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-3">Kryteria wypadku przy pracy</h3>
        <p className="text-gray-700 mb-3">
          Aby zdarzenie mogło zostać uznane za wypadek przy pracy, musi spełniać następujące warunki:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded border border-gray-200">
            <h4 className="text-gray-900 mb-2">Nagłość</h4>
            <p className="text-gray-600">Zdarzenie musi nastąpić nagle, w krótkim czasie</p>
          </div>
          <div className="bg-white p-4 rounded border border-gray-200">
            <h4 className="text-gray-900 mb-2">Przyczyna zewnętrzna</h4>
            <p className="text-gray-600">Musi istnieć identyfikowalna przyczyna z zewnątrz</p>
          </div>
          <div className="bg-white p-4 rounded border border-gray-200">
            <h4 className="text-gray-900 mb-2">Uraz lub śmierć</h4>
            <p className="text-gray-600">Skutkiem musi być obrażenie ciała</p>
          </div>
          <div className="bg-white p-4 rounded border border-gray-200">
            <h4 className="text-gray-900 mb-2">Związek z pracą</h4>
            <p className="text-gray-600">Zdarzenie podczas wykonywania działalności gospodarczej</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Rozpocznij zgłoszenie
        </button>
      </div>
    </div>
  );
}
