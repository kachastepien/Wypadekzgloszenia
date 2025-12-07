import { useWizard } from './WizardContext';
import { Sparkles, CheckCircle, Circle, AlertCircle, Save, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export function ProgressPanel() {
  const { data, saveProgress, isSaving } = useWizard();
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Obliczanie postępu dla każdej sekcji
  const getInjuredDataProgress = () => {
    const fields = [data.injuredName, data.injuredSurname, data.injuredPesel, data.injuredEmail];
    const filled = fields.filter(f => f).length;
    return { filled, total: 4 };
  };

  const getBusinessDataProgress = () => {
    const fields = [data.nip, data.regon, data.pkdCode, data.businessName];
    const filled = fields.filter(f => f).length;
    return { filled, total: 4 };
  };

  const getAccidentDetailsProgress = () => {
    const fields = [
      data.accidentDate,
      data.accidentTime,
      data.accidentLocation,
      data.wasWorkRelated,
    ];
    const filled = fields.filter(f => f).length;
    return { filled, total: 4 };
  };

  const getAccidentDescriptionProgress = () => {
    const fields = [
      data.activityBeforeAccident,
      data.externalCause,
      data.causeDetails,
      data.accidentSequence.length >= 2 ? 'yes' : '',
      data.wasSudden,
    ];
    const filled = fields.filter(f => f).length;
    return { filled, total: 5 };
  };

  const getInjuryProgress = () => {
    const fields = [data.injuryType, data.injuryLocation, data.injuryDescription];
    const filled = fields.filter(f => f && f !== 'brak').length;
    return { filled, total: 3 };
  };

  // Całkowity postęp
  const getTotalProgress = () => {
    const sections = [
      getInjuredDataProgress(),
      getBusinessDataProgress(),
      getAccidentDetailsProgress(),
      getAccidentDescriptionProgress(),
      getInjuryProgress(),
    ];

    const totalFilled = sections.reduce((sum, s) => sum + s.filled, 0);
    const totalFields = sections.reduce((sum, s) => sum + s.total, 0);

    return Math.round((totalFilled / totalFields) * 100);
  };

  const totalProgress = getTotalProgress();
  const injuredData = getInjuredDataProgress();
  const businessData = getBusinessDataProgress();
  const accidentDetails = getAccidentDetailsProgress();
  const accidentDescription = getAccidentDescriptionProgress();
  const injuryData = getInjuryProgress();

  // AI - generowanie dynamicznych wskazówek
  useEffect(() => {
    const suggestions: string[] = [];

    // Analiza AI na podstawie wypełnionych danych
    if (!data.injuredName || !data.injuredSurname) {
      suggestions.push('Rozpocznij od podania danych poszkodowanego');
    }

    if (data.injuredName && !data.nip && !data.regon) {
      suggestions.push('Podaj NIP lub REGON działalności, aby system automatycznie pobierze dane z CEIDG');
    }

    if (data.nip && data.pkdCode && !data.accidentDate) {
      suggestions.push('Opisz kiedy i gdzie doszło do wypadku');
    }

    if (data.accidentDate && !data.activityBeforeAccident) {
      suggestions.push('Szczegółowo opisz jakie czynności wykonywałeś przed wypadkiem');
    }

    if (data.activityBeforeAccident && data.accidentSequence.length < 2) {
      suggestions.push('Dodaj kolejne kroki opisujące przebieg wypadku (metoda drzewa przyczyn)');
    }

    if (data.accidentSequence.length >= 2 && (!data.externalCause || data.externalCause === 'brak')) {
      suggestions.push('Wskaż przyczynę zewnętrzną wypadku - to kluczowy element dla ZUS');
    }

    if (data.externalCause && data.externalCause !== 'brak' && !data.injuryDescription) {
      suggestions.push('Opisz szczegółowo obrażenia, jakich doznałeś');
    }

    if (data.injuryDescription && data.medicalAttention === 'tak' && !data.hospitalName) {
      suggestions.push('Podaj nazwę placówki medycznej, która udzieliła pomocy');
    }

    // Ostrzeżenia AI
    if (data.wasWorkRelated === 'nie') {
      suggestions.push('⚠️ UWAGA: Zdarzenie może nie zostać uznane za wypadek przy pracy - nie było związane z działalnością');
    }

    if (data.wasSudden === 'nie') {
      suggestions.push('⚠️ UWAGA: Brak nagłości - zdarzenie może nie spełniać kryterium wypadku przy pracy');
    }

    if (data.isProxy && !data.hasProxyDocument) {
      suggestions.push('⚠️ Pamiętaj o dostarczeniu pełnomocnictwa');
    }

    // Pozytywne wskazówki
    if (totalProgress === 100) {
      suggestions.push('✅ Formularz wypełniony! Możesz przejść do wygenerowania dokumentu');
    } else if (totalProgress >= 80) {
      suggestions.push('Świetnie! Już prawie wszystko wypełnione');
    }

    // Sugestie branżowe bazujące na PKD
    if (data.pkdCode?.startsWith('43') && data.injuryType) {
      suggestions.push('Dla branży budowlanej: pamiętaj o opisaniu środków bezpieczeństwa (jeśli były używane)');
    }

    if (data.pkdCode?.startsWith('62') && data.externalCause === 'Wypadek komunikacyjny (dojazd do klienta)') {
      suggestions.push('Wypadek w drodze do klienta: dołącz dokumentację z miejsca wypadku (np. protokół policji)');
    }

    setAiSuggestions(suggestions.slice(0, 5)); // Max 5 wskazówek
  }, [data, totalProgress]);

  const sections = [
    { name: 'Dane poszkodowanego', progress: injuredData },
    { name: 'Dane pracodawcy', progress: businessData },
    { name: 'Okoliczności wypadku', progress: accidentDetails },
    { name: 'Opis zdarzenia', progress: accidentDescription },
    { name: 'Obrażenia i dokumentacja', progress: injuryData },
  ];

  return (
    <div className="border border-gray-200 rounded-2xl p-6 sticky top-4">
      {/* Główny postęp */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-900">Postęp</h3>
          <span className={`text-3xl ${
            totalProgress === 100 ? 'text-gray-900' :
            totalProgress >= 50 ? 'text-gray-900' :
            'text-gray-900'
          }`}>
            {totalProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-gray-900 h-2 rounded-full transition-all duration-500"
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        <div className="mt-4">
          <Button
            onClick={saveProgress}
            disabled={isSaving}
            className="w-full bg-gray-900 text-white hover:bg-gray-800"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Zapisywanie...' : 'Zapisz postępy'}
          </Button>
        </div>
      </div>

      {/* Sekcje */}
      <div className="space-y-3 mb-8">
        <h4 className="text-sm text-gray-500 mb-3">Sekcje</h4>
        {sections.map((section, index) => {
          const isComplete = section.progress.filled === section.progress.total;
          const isPartial = section.progress.filled > 0;

          return (
            <div key={index} className="flex items-center gap-3">
              {isComplete ? (
                <CheckCircle className="w-4 h-4 text-gray-900 flex-shrink-0" />
              ) : isPartial ? (
                <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-200 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`text-sm ${isComplete ? 'text-gray-900' : 'text-gray-500'}`}>
                  {section.name}
                </p>
              </div>
              <span className={`text-xs ${
                isComplete ? 'text-gray-900' :
                isPartial ? 'text-gray-500' :
                'text-gray-300'
              }`}>
                {section.progress.filled}/{section.progress.total}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tryb AI */}
      <div className="border-t border-gray-100 pt-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gray-900" />
            Asystent AI
          </h3>
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
            Aktywny
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Analizuję formularz i pomagam w przygotowaniu zgłoszenia
        </p>
      </div>

      {/* Wskazówki AI */}
      {aiSuggestions.length > 0 && (
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-gray-900 mb-3 text-sm">Wskazówki</h3>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 text-sm p-3 rounded-xl ${
                  suggestion.includes('⚠️') || suggestion.includes('UWAGA')
                    ? 'bg-amber-50 text-amber-900 border border-amber-100'
                    : suggestion.includes('✅')
                    ? 'bg-green-50 text-green-900 border border-green-100'
                    : 'bg-gray-50 text-gray-700 border border-gray-100'
                }`}
              >
                <span className="mt-0.5">
                  {suggestion.includes('⚠️') ? (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  ) : suggestion.includes('✅') ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-900 block mt-1.5" />
                  )}
                </span>
                <span className="flex-1">{suggestion.replace('⚠️ ', '').replace('✅ ', '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informacja o AI */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-500 leading-relaxed">
          System automatycznie analizuje dane i sugeruje co uzupełnić.
        </p>
      </div>
    </div>
  );
}