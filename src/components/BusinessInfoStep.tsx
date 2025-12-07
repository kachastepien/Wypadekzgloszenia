import { useState } from 'react';
import { useWizard } from './WizardContext';
import { Building2, Search, CheckCircle, Loader, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface ReporterInfoStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function BusinessInfoStep({ onNext, onPrevious }: ReporterInfoStepProps) {
  const { data, updateData } = useWizard();
  const [formData, setFormData] = useState({
    nip: data.nip,
    regon: data.regon,
    pkdCode: data.pkdCode,
    pkdDescription: data.pkdDescription,
    businessName: data.businessName,
    businessAddress: data.businessAddress,
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const searchCEIDG = async () => {
    if (!formData.nip && !formData.regon) {
      setErrors({ nip: 'Podaj NIP lub REGON działalności' });
      return;
    }

    setIsSearching(true);
    setErrors({});

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1ba4d8f6/ceidg-lookup`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ nip: formData.nip || formData.regon })
      });
      
      const result = await response.json().catch(() => ({}));
      
      if (!response.ok) {
          throw new Error(result.error || `Błąd serwera: ${response.status}`);
      }

      // POPRAWKA: Obsługa braku firmy bez rzucania błędu
      if (!result.name) {
         toast.info("Nie znaleziono firmy w bazie. Proszę uzupełnić dane ręcznie.");
         setSearchComplete(true);
         setFormData(prev => ({
             ...prev,
             businessName: prev.businessName || "",
             businessAddress: prev.businessAddress || "",
             pkdCode: prev.pkdCode || "",
             pkdDescription: prev.pkdDescription || ""
         }));
         setErrors({});
         return;
      }

      setFormData({
        ...formData,
        businessName: result.name,
        businessAddress: result.address,
        pkdCode: result.pkd,
        pkdDescription: result.pkdDesc,
      });
      
      if (!result.pkd) {
          toast.warning("Pobrano dane adresowe z VIES. Kod PKD należy uzupełnić ręcznie na podstawie CEIDG.", { duration: 5000 });
      } else {
          toast.success("Dane firmy zostały pobrane");
      }
      setSearchComplete(true);

    } catch (err: any) {
        console.error("CEIDG Lookup Error:", err);
        const msg = err.message || "Nie udało się pobrać danych";
        setErrors({ nip: msg });
        toast.error(msg);
    } finally {
        setIsSearching(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nip && !formData.regon) {
      newErrors.nip = 'Podaj NIP lub REGON działalności';
    }

    if (formData.nip && !/^\d{10}$/.test(formData.nip.replace(/-/g, ''))) {
      newErrors.nip = 'NIP musi składać się z 10 cyfr';
    }

    if (formData.regon && !/^\d{9}$/.test(formData.regon)) {
      newErrors.regon = 'REGON musi składać się z 9 cyfr';
    }
    
    if (!formData.pkdCode && searchComplete) {
       // warning only
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      updateData(formData);
      onNext();
    }
  };

  const handleSkip = () => {
      // Pozwalamy przejść dalej mimo braków
      // Zapisujemy to co jest (nawet puste)
      updateData(formData);
      toast.info("Krok pominięty. Pamiętaj o uzupełnieniu danych firmy przed finalnym złożeniem dokumentów.", {
          duration: 4000,
          icon: '⚠️'
      });
      onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-blue-900 mb-2">Dane działalności gospodarczej</h2>
        <p className="text-gray-600">
          Podaj NIP lub REGON prowadzonej działalności gospodarczej. System automatycznie pobierze 
          pozostałe dane z Centralnej Ewidencji i Informacji o Działalności Gospodarczej.
        </p>
      </div>

      {/* Formularz NIP/REGON */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h3 className="text-gray-900">Identyfikacja działalności</h3>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">
                NIP działalności *
              </label>
              <input
                type="text"
                value={formData.nip}
                onChange={(e) => {
                  setFormData({ ...formData, nip: e.target.value });
                  setSearchComplete(false);
                }}
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1234567890"
              />
              {errors.nip && (
                <p className="text-red-600 mt-1">{errors.nip}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                REGON (opcjonalnie)
              </label>
              <input
                type="text"
                value={formData.regon}
                onChange={(e) => {
                  setFormData({ ...formData, regon: e.target.value });
                  setSearchComplete(false);
                }}
                maxLength={9}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123456789"
              />
              {errors.regon && (
                <p className="text-red-600 mt-1">{errors.regon}</p>
              )}
            </div>
          </div>

          <button
            onClick={searchCEIDG}
            disabled={isSearching || (!formData.nip && !formData.regon)}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Wyszukiwanie w CEIDG...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Pobierz dane z CEIDG
              </>
            )}
          </button>
        </div>
      </div>

      {/* Wyniki wyszukiwania */}
      {searchComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3 text-green-800">
            <CheckCircle className="w-6 h-6" />
            <h3>Dane pobrane z CEIDG</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-gray-700 mb-1">Nazwa działalności</label>
              <div className="bg-white px-4 py-2 border border-green-300 rounded-lg">
                {formData.businessName}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Adres prowadzenia działalności</label>
              <div className="bg-white px-4 py-2 border border-green-300 rounded-lg">
                {formData.businessAddress}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Główny kod PKD</label>
              <div className="bg-white px-4 py-2 border border-green-300 rounded-lg">
                <strong>{formData.pkdCode}</strong> - {formData.pkdDescription}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-gray-700">
              <strong>Informacja:</strong> System przeanalizuje zakres Twojej działalności 
              na podstawie kodu PKD podczas zadawania pytań o przebieg wypadku.
            </p>
          </div>
        </div>
      )}

      {/* Możliwość ręcznej edycji */}
      {searchComplete && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-gray-900 mb-4">
            Opcjonalnie: popraw lub uzupełnij dane
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">
                Nazwa działalności
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Adres prowadzenia działalności
              </label>
              <input
                type="text"
                value={formData.businessAddress}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-gray-700">
                            Kod PKD *
                        </label>
                        <div className="flex items-center gap-1">
                            <a 
                               href="https://aplikacja.ceidg.gov.pl/ceidg/ceidg.public.ui/search.aspx"
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-normal"
                               title="Otwórz wyszukiwarkę CEIDG"
                            >
                              CEIDG <ExternalLink className="w-3 h-3" />
                            </a>
                            <span className="text-gray-300 text-xs">|</span>
                            <a 
                               href="https://wyszukiwarkaregon.stat.gov.pl/appBIR/index.aspx"
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-normal"
                               title="Otwórz wyszukiwarkę GUS (REGON)"
                            >
                              GUS <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                    <input
                        type="text"
                        value={formData.pkdCode}
                        onChange={(e) => setFormData({ ...formData, pkdCode: e.target.value })}
                        placeholder="np. 41.20.Z"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!formData.pkdCode ? 'border-amber-300 bg-amber-50' : 'border-gray-300'}`}
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-gray-700 mb-1">
                        Opis działalności (PKD) *
                    </label>
                    <input
                        type="text"
                        value={formData.pkdDescription}
                        onChange={(e) => setFormData({ ...formData, pkdDescription: e.target.value })}
                        placeholder="np. Roboty budowlane..."
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!formData.pkdDescription ? 'border-amber-300 bg-amber-50' : 'border-gray-300'}`}
                    />
                </div>
            </div>
            
            {!formData.pkdCode && (
                <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-md border border-amber-200 flex items-start gap-2">
                    <div className="mt-0.5">ℹ️</div>
                    <p>
                        <strong>Uwaga:</strong> Rejestr VIES nie udostępnia kodów PKD. 
                        Wyszukaj firmę w <strong>CEIDG</strong> lub <strong>GUS</strong> (linki powyżej) i przepisz główny kod PKD, 
                        aby system mógł poprawnie zweryfikować okoliczności wypadku.
                    </p>
                </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 items-center">
        <button
          onClick={onPrevious}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Wstecz
        </button>
        
        <div className="flex items-center gap-4">
            <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium underline decoration-dotted underline-offset-4 hover:decoration-solid transition-all"
            >
                Nie mam teraz danych (uzupełnij później)
            </button>
            
            <button
            onClick={handleContinue}
            disabled={!searchComplete}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
            Dalej
            </button>
        </div>
      </div>
    </div>
  );
}