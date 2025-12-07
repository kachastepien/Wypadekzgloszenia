import { useState } from 'react';
import { useWizard } from './WizardContext';
import { Plus, Trash2, GitBranch, HelpCircle } from 'lucide-react';

interface AccidentSequenceStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function AccidentSequenceStep({ onNext, onPrevious }: AccidentSequenceStepProps) {
  const { data, updateData } = useWizard();
  const [sequence, setSequence] = useState(
    data.accidentSequence.length > 0 
      ? data.accidentSequence 
      : [{ step: 1, description: '', time: '' }]
  );
  const [externalCause, setExternalCause] = useState(data.externalCause);
  const [causeDetails, setCauseDetails] = useState(data.causeDetails);
  const [showHelp, setShowHelp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addStep = () => {
    setSequence([...sequence, { step: sequence.length + 1, description: '', time: '' }]);
  };

  const removeStep = (index: number) => {
    if (sequence.length > 1) {
      const newSequence = sequence.filter((_, i) => i !== index);
      setSequence(newSequence.map((s, i) => ({ ...s, step: i + 1 })));
    }
  };

  const updateStep = (index: number, field: 'description' | 'time', value: string) => {
    const newSequence = [...sequence];
    newSequence[index] = { ...newSequence[index], [field]: value };
    setSequence(newSequence);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (sequence.some(s => !s.description)) {
      newErrors.sequence = 'Wszystkie kroki muszą mieć opis';
    }

    if (sequence.length < 2) {
      newErrors.sequence = 'Dodaj przynajmniej 2 kroki opisujące przebieg wypadku';
    }

    if (!externalCause || externalCause === 'brak') {
      newErrors.externalCause = 'Wskazanie przyczyny zewnętrznej jest wymagane';
    }

    if (!causeDetails) {
      newErrors.causeDetails = 'Szczegółowy opis przyczyny jest wymagany';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      updateData({ 
        accidentSequence: sequence,
        externalCause,
        causeDetails,
      });
      onNext();
    }
  };

  // Dynamiczne sugestie przyczyn bazujące na kodzie PKD
  const getSuggestedCauses = () => {
    const pkdCode = data.pkdCode;
    
    if (pkdCode?.startsWith('43')) {
      // Budownictwo
      return [
        'Upadek z wysokości (drabina, rusztowanie)',
        'Uderzenie przez spadający przedmiot',
        'Poślizgnięcie się lub potknięcie',
        'Przecięcie ostrym narzędziem',
        'Porażenie prądem',
        'Nadmierny wysiłek fizyczny',
        'Kontakt z niebezpieczną substancją',
      ];
    } else if (pkdCode?.startsWith('62') || pkdCode?.startsWith('63')) {
      // IT
      return [
        'Upadek na równej powierzchni',
        'Poślizgnięcie się w biurze',
        'Uraz przy przemieszczaniu sprzętu',
        'Wypadek komunikacyjny (dojazd do klienta)',
        'Nadmierny wysiłek przy podnoszeniu',
      ];
    } else if (pkdCode?.startsWith('56')) {
      // Gastronomia
      return [
        'Oparzenie gorącym płynem lub przedmiotem',
        'Poślizgnięcie się na mokrej podłodze',
        'Przecięcie nożem lub innym ostrym narzędziem',
        'Upadek przy noszeniu ciężkich przedmiotów',
        'Kontakt z gorącymi powierzchniami',
      ];
    }
    
    return [
      'Upadek z wysokości',
      'Poślizgnięcie się',
      'Uderzenie przez przedmiot',
      'Wypadek komunikacyjny',
      'Nadmierny wysiłek fizyczny',
      'Kontakt z niebezpieczną substancją',
      'Porażenie prądem',
      'Oparzenie',
      'Przecięcie',
      'Inna przyczyna',
    ];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-blue-900 mb-2">Przebieg wypadku - sekwencja zdarzeń</h2>
        <p className="text-gray-600">
          Opisz dokładnie, jak doszło do wypadku. Podziel zdarzenie na kolejne kroki, 
          które doprowadziły do urazu. Im więcej szczegółów, tym lepiej.
        </p>
      </div>

      {/* Pomoc - drzewo przyczyn */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <GitBranch className="w-6 h-6 text-blue-600" />
          <h3 className="text-blue-900">Metoda "drzewa przyczyn"</h3>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="ml-auto p-2 hover:bg-blue-100 rounded"
          >
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        {showHelp && (
          <div className="text-gray-700 space-y-3">
            <p>
              Drzewo przyczyn pomaga zidentyfikować wszystkie fakty, które doprowadziły do wypadku:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                <strong>Co się stało?</strong> - opisz skutek (uraz)
              </li>
              <li>
                <strong>Co bezpośrednio spowodowało uraz?</strong> - przyczyna bezpośrednia
              </li>
              <li>
                <strong>Co doprowadziło do przyczyny bezpośredniej?</strong> - przyczyny pośrednie
              </li>
              <li>
                <strong>Jakie były warunki?</strong> - okoliczności sprzyjające
              </li>
            </ol>
            <div className="bg-white border border-blue-200 rounded p-3 mt-3">
              <p className="text-gray-900 mb-2">
                <strong>Przykład dla upadku z drabiny:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Krok 1: Wspiąłem się na drabiną, aby wymienić żarówkę</li>
                <li>Krok 2: Sięgnąłem po narzędzie leżące obok</li>
                <li>Krok 3: Straciłem równowagę i upadłem z wysokości 2m</li>
                <li>Krok 4: Uderzyłem plecami o betonową podłogę</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Sekwencja zdarzeń */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900">Kolejne kroki prowadzące do wypadku</h3>
          <button
            onClick={addStep}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Dodaj krok
          </button>
        </div>

        <div className="space-y-4">
          {sequence.map((step, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-blue-600 text-white px-3 py-1 rounded">
                  Krok {step.step}
                </span>
                {sequence.length > 1 && (
                  <button
                    onClick={() => removeStep(index)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 mb-1">
                    Opis kroku *
                  </label>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Opisz co się wydarzyło w kroku ${step.step}, np. "Wszedłem na drabiną do montażu instalacji"`}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">
                    Przybliżony czas (opcjonalnie)
                  </label>
                  <input
                    type="time"
                    value={step.time}
                    onChange={(e) => updateStep(index, 'time', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.sequence && (
          <p className="text-red-600 mt-3">{errors.sequence}</p>
        )}
      </div>

      {/* Przyczyna zewnętrzna */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">
          Przyczyna zewnętrzna wypadku
        </h3>
        <p className="text-gray-600 mb-4">
          Wybierz główną przyczynę zewnętrzną, która doprowadziła do urazu:
        </p>

        <div className="space-y-2">
          {getSuggestedCauses().map((cause) => (
            <label
              key={cause}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="externalCause"
                value={cause}
                checked={externalCause === cause}
                onChange={(e) => setExternalCause(e.target.value)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-900">{cause}</span>
            </label>
          ))}

          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="externalCause"
              value="brak"
              checked={externalCause === 'brak'}
              onChange={(e) => setExternalCause(e.target.value)}
              className="w-5 h-5 text-blue-600"
            />
            <span className="text-gray-900">Nie potrafię określić przyczyny zewnętrznej</span>
          </label>
        </div>

        {errors.externalCause && (
          <p className="text-red-600 mt-3">{errors.externalCause}</p>
        )}

        {externalCause === 'brak' && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800">
              <strong>Uwaga:</strong> Wypadek przy pracy musi mieć przyczynę zewnętrzną. 
              Spróbuj dokładniej przeanalizować przebieg zdarzenia lub skonsultuj się z ZUS.
            </p>
          </div>
        )}
      </div>

      {/* Szczegółowy opis przyczyny */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">
          Szczegółowy opis przyczyny wypadku *
        </h3>
        <p className="text-gray-600 mb-4">
          Opisz dokładnie, co spowodowało wypadek. Uwzględnij warunki, w jakich pracowałeś, 
          stan narzędzi, pogodę (jeśli miała znaczenie), itp.
        </p>
        
        <textarea
          value={causeDetails}
          onChange={(e) => setCauseDetails(e.target.value)}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={`Przykład:\n"Podczas montażu instalacji elektrycznej używałem drabiny aluminiowej. Drabina stała na śliskiej podłodze. Gdy sięgałem po narzędzie, drabina się przesunęła, straciłem równowagę i upadłem z wysokości około 2 metrów, uderzając plecami o betonową posadzkę."`}
        />
        {errors.causeDetails && (
          <p className="text-red-600 mt-1">{errors.causeDetails}</p>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-gray-700">
          <strong>Wskazówka:</strong> Dokładny opis przebiegu wypadku i jego przyczyn znacznie 
          ułatwi i przyspieszy rozpatrzenie Twojego zgłoszenia przez ZUS.
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
          className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Dalej
        </button>
      </div>
    </div>
  );
}
