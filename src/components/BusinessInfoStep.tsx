import { useState } from 'react';
import { useWizard } from './WizardContext';
import { Building2, Search, CheckCircle, Loader } from 'lucide-react';

interface ReporterInfoStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

// Mock dane PKD
const mockPKDDatabase: Record<string, string> = {
  '43.21': 'Roboty związane z budową instalacji elektrycznych i hydraulicznych oraz pozostałe instalacje budowlane',
  '47.11': 'Sprzedaż detaliczna w niewyspecjalizowanych sklepach z przewagą żywności, napojów i wyrobów tytoniowych',
  '62.01': 'Działalność związana z oprogramowaniem',
  '69.20': 'Działalność rachunkowo-księgowa; doradztwo podatkowe',
  '71.11': 'Działalność w zakresie architektury',
  '43.99': 'Pozostała specjalistyczna działalność budowlana, gdzie indziej niesklasyfikowana',
  '56.10': 'Restauracje i inne placówki gastronomiczne',
  '85.51': 'Pozaszkolne formy edukacji sportowej oraz zajęć sportowych i rekreacyjnych',
};

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

    // Symulacja zapytania do CEIDG
    setTimeout(() => {
      // Mock dane - w rzeczywistości pobrane z CEIDG
      const mockData = {
        businessName: 'P.H.U. "PRZYKŁAD" Jan Kowalski',
        businessAddress: 'ul. Przykładowa 123, 00-001 Warszawa',
        pkdCode: Object.keys(mockPKDDatabase)[Math.floor(Math.random() * Object.keys(mockPKDDatabase).length)],
      };

      const pkdDescription = mockPKDDatabase[mockData.pkdCode] || 'Nieznana działalność';

      setFormData({
        ...formData,
        businessName: mockData.businessName,
        businessAddress: mockData.businessAddress,
        pkdCode: mockData.pkdCode,
        pkdDescription: pkdDescription,
      });

      setIsSearching(false);
      setSearchComplete(true);
    }, 1500);
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

    if (!formData.pkdCode) {
      newErrors.pkdCode = 'Należy pobrać dane z CEIDG';
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
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Wstecz
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
  );
}
