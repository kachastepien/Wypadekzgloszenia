import { useState } from 'react';
import { useWizard } from './WizardContext';
import { Download, CheckCircle, Loader2, AlertCircle, CloudUpload, AlertTriangle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { generateReportPDF } from '../utils/pdfGenerator';

interface CompletionStepProps {
  onPrevious: () => void;
}

export function CompletionStep({ onPrevious }: CompletionStepProps) {
  const { data } = useWizard();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const missingFields: string[] = [];
  if (!data.nip && !data.regon) missingFields.push("NIP/REGON Firmy");
  if (!data.pkdCode) missingFields.push("Kod PKD");
  if (!data.injuredName) missingFields.push("Imię Poszkodowanego");
  if (!data.injuredSurname) missingFields.push("Nazwisko Poszkodowanego");
  if (!data.injuredPesel) missingFields.push("PESEL Poszkodowanego");
  if (!data.accidentDate) missingFields.push("Data wypadku");
  if (!data.accidentLocation) missingFields.push("Miejsce wypadku");

  // Automatyczny zapis po wejściu na ten krok (tylko raz)
  useState(() => {
      const saveReport = async () => {
          if (saveStatus !== 'idle') return;
          setIsSaving(true);
          try {
              // Przygotuj payload
              const payload = {
                  ...data,
                  status: 'Analiza', // Domyślny status dla Eksperta
                  createdAt: new Date().toISOString()
              };

              const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1ba4d8f6/report`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${publicAnonKey}`
                  },
                  body: JSON.stringify(payload)
              });

              if (response.ok) {
                  setSaveStatus('success');
                  console.log("Zgłoszenie zapisane w systemie.");
              } else {
                  console.error("Błąd zapisu zgłoszenia:", await response.text());
                  setSaveStatus('error');
              }
          } catch (e) {
              console.error("Network error saving report:", e);
              setSaveStatus('error');
          } finally {
              setIsSaving(false);
          }
      };

      saveReport();
  });

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await generateReportPDF(data);
    } catch (error) {
      alert("Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-green-900 mb-2">Zgłoszenie gotowe!</h2>
        
        {/* Status zapisu do systemu */}
        <div className="flex items-center justify-center gap-2 mb-4 h-6">
            {isSaving && <span className="text-sm text-blue-600 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Przesyłanie do ZUS...</span>}
            {saveStatus === 'success' && <span className="text-sm text-green-600 flex items-center gap-1"><CloudUpload className="w-3 h-3"/> Zarejestrowano w systemie</span>}
            {saveStatus === 'error' && <span className="text-sm text-red-500">Błąd zapisu online (PDF nadal dostępny)</span>}
        </div>

        <p className="text-gray-700 max-w-2xl mx-auto">
          Dane zostały przetworzone. Pobierz gotowy dokument PDF do wydruku i podpisu.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">Pobierz dokument</h3>
        
        {missingFields.length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-red-800 font-bold">
                    <AlertTriangle className="w-5 h-5" />
                    <h4>Wymagane uzupełnienie danych</h4>
                </div>
                <p className="text-sm text-red-700 mb-2">
                    Twoje zgłoszenie zostało przyjęte do systemu, ale wygenerowany PDF będzie niekompletny. 
                    Przed wysłaniem dokumentu do ZUS musisz ręcznie uzupełnić następujące pola:
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-2">
                    {missingFields.map((field, i) => (
                        <li key={i}>{field}</li>
                    ))}
                </ul>
            </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="flex flex-col items-center gap-3 p-6 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            ) : (
              <Download className="w-8 h-8 text-blue-600" />
            )}
            <div className="text-center">
              <p className="text-gray-900 font-medium">Pobierz PDF</p>
              <p className="text-sm text-gray-600">Gotowy do wydruku</p>
            </div>
          </button>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>
                <strong>Uwaga:</strong> Wygenerowany plik jest sformatowany do druku. 
                Polskie znaki zostały zastąpione odpowiednikami (np. ą - a) dla zachowania kompatybilności.
                <br/><br/>
                Po wydrukowaniu możesz uzupełnić brakujące ogonki ręcznie lub złożyć dokument w tej formie (jest czytelny i akceptowalny w trybie awaryjnym).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">Lista załączników</h3>
        <div className="space-y-2">
          {data.requiredDocuments.map((doc, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-900">{doc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Wstecz
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nowe zgłoszenie
        </button>
      </div>
    </div>
  );
}
