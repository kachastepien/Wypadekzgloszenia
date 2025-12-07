import { useEffect } from 'react';
import { useWizard } from './WizardContext';
import { FileCheck, AlertTriangle, CheckCircle, XCircle, FileText } from 'lucide-react';

interface DocumentReviewStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function DocumentReviewStep({ onNext, onPrevious }: DocumentReviewStepProps) {
  const { data, analyzeCompleteness } = useWizard();

  useEffect(() => {
    analyzeCompleteness();
  }, []);

  const hasWarnings = data.missingElements.length > 0 || data.recommendations.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-blue-900 mb-2">Przegląd i analiza zgłoszenia</h2>
        <p className="text-gray-600">
          Sprawdź kompletność Twojego zgłoszenia oraz listę wymaganych dokumentów.
        </p>
      </div>

      {/* Podsumowanie zgłoszenia */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileCheck className="w-6 h-6 text-blue-600" />
          <h3 className="text-gray-900">Podsumowanie zgłoszenia</h3>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-1">Rodzaj zgłoszenia</p>
              <p className="text-gray-900">
                {data.reportType === 'accident' && 'Zawiadomienie o wypadku'}
                {data.reportType === 'explanation' && 'Wyjaśnienia poszkodowanego'}
                {data.reportType === 'both' && 'Zawiadomienie i wyjaśnienia'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-1">Poszkodowany</p>
              <p className="text-gray-900">
                {data.injuredName} {data.injuredSurname}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-1">Data wypadku</p>
              <p className="text-gray-900">
                {new Date(data.accidentDate).toLocaleDateString('pl-PL')} o godz. {data.accidentTime}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-1">Działalność gospodarcza</p>
              <p className="text-gray-900">
                NIP: {data.nip}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-1">Rodzaj działalności (PKD)</p>
            <p className="text-gray-900">
              {data.pkdCode} - {data.pkdDescription}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-1">Rodzaj obrażenia</p>
            <p className="text-gray-900">
              {data.injuryType} - {data.injuryLocation}
            </p>
          </div>
        </div>
      </div>

      {/* Analiza kompletności */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">Analiza kompletności zgłoszenia</h3>

        {/* Brakujące elementy */}
        {data.missingElements.length > 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="text-red-900 mb-2">Brakujące elementy</h4>
                <ul className="space-y-1">
                  {data.missingElements.map((element, index) => (
                    <li key={index} className="text-red-800 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                      <span>{element}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-green-900 mb-1">Zgłoszenie kompletne</h4>
                <p className="text-green-800">
                  Wszystkie wymagane informacje zostały podane. Możesz przejść do pobierania dokumentu.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ostrzeżenia i zalecenia */}
        {data.recommendations.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="text-amber-900 mb-2">Ważne uwagi</h4>
                <ul className="space-y-2">
                  {data.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-amber-800 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wymagane dokumenty */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-gray-900">Dokumenty do załączenia</h3>
        </div>

        <p className="text-gray-700 mb-4">
          Do zawiadomienia o wypadku musisz dołączyć następujące dokumenty:
        </p>

        <div className="space-y-2">
          {data.requiredDocuments.map((doc, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-900">{doc}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700">
            <strong>Pamiętaj:</strong> Dokumenty możesz złożyć elektronicznie przez PUE/eZUS 
            lub dostarczyć osobiście do dowolnej placówki ZUS.
          </p>
        </div>
      </div>

      {/* Kryteria wypadku przy pracy - weryfikacja */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">Weryfikacja kryteriów wypadku przy pracy</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border-2 ${
            data.wasSudden === 'tak' 
              ? 'border-green-500 bg-green-50' 
              : 'border-red-500 bg-red-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {data.wasSudden === 'tak' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <h4 className={data.wasSudden === 'tak' ? 'text-green-900' : 'text-red-900'}>
                Nagłość
              </h4>
            </div>
            <p className={data.wasSudden === 'tak' ? 'text-green-800' : 'text-red-800'}>
              {data.wasSudden === 'tak' 
                ? 'Zdarzenie nastąpiło nagle' 
                : 'Brak kryterium nagłości'}
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            data.externalCause && data.externalCause !== 'brak'
              ? 'border-green-500 bg-green-50' 
              : 'border-red-500 bg-red-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {data.externalCause && data.externalCause !== 'brak' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <h4 className={
                data.externalCause && data.externalCause !== 'brak'
                  ? 'text-green-900' 
                  : 'text-red-900'
              }>
                Przyczyna zewnętrzna
              </h4>
            </div>
            <p className={
              data.externalCause && data.externalCause !== 'brak'
                ? 'text-green-800' 
                : 'text-red-800'
            }>
              {data.externalCause && data.externalCause !== 'brak'
                ? data.externalCause 
                : 'Nie określono przyczyny'}
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            data.injuryDescription 
              ? 'border-green-500 bg-green-50' 
              : 'border-red-500 bg-red-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {data.injuryDescription ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <h4 className={data.injuryDescription ? 'text-green-900' : 'text-red-900'}>
                Uraz
              </h4>
            </div>
            <p className={data.injuryDescription ? 'text-green-800' : 'text-red-800'}>
              {data.injuryDescription 
                ? `${data.injuryType} - ${data.injuryLocation}` 
                : 'Brak opisu urazu'}
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            data.wasWorkRelated === 'tak' 
              ? 'border-green-500 bg-green-50' 
              : 'border-red-500 bg-red-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {data.wasWorkRelated === 'tak' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <h4 className={data.wasWorkRelated === 'tak' ? 'text-green-900' : 'text-red-900'}>
                Związek z pracą
              </h4>
            </div>
            <p className={data.wasWorkRelated === 'tak' ? 'text-green-800' : 'text-red-800'}>
              {data.wasWorkRelated === 'tak' 
                ? 'Podczas wykonywania działalności' 
                : 'Brak związku z działalnością'}
            </p>
          </div>
        </div>
      </div>

      {hasWarnings && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="text-amber-900 mb-2">Uwaga!</h3>
              <p className="text-amber-800">
                Zidentyfikowano braki lub problemy w zgłoszeniu. Zalecamy przejrzenie danych 
                i uzupełnienie brakujących informacji przed wysłaniem zgłoszenia do ZUS. 
                Możesz wrócić do poprzednich kroków i poprawić dane.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Wstecz - popraw dane
        </button>
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generuj dokumenty
        </button>
      </div>
    </div>
  );
}
