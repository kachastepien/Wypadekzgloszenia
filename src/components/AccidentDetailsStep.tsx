import { useState, useEffect } from 'react';
import { useWizard } from './WizardContext';
import { Calendar, MapPin, AlertCircle, HelpCircle } from 'lucide-react';

interface AccidentDetailsStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function AccidentDetailsStep({ onNext, onPrevious }: AccidentDetailsStepProps) {
  const { data, updateData } = useWizard();
  const [formData, setFormData] = useState({
    accidentDate: data.accidentDate,
    accidentTime: data.accidentTime,
    accidentLocation: data.accidentLocation,
    wasWorkRelated: data.wasWorkRelated,
    activityBeforeAccident: data.activityBeforeAccident,
    wasSudden: data.wasSudden,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWorkRelatedHelp, setShowWorkRelatedHelp] = useState(false);
  const [showSuddenHelp, setShowSuddenHelp] = useState(false);

  // Analiza odpowiedzi i dostosowanie pytań
  useEffect(() => {
    if (formData.wasWorkRelated === 'nie') {
      setShowWorkRelatedHelp(true);
    }
  }, [formData.wasWorkRelated]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.accidentDate) {
      newErrors.accidentDate = 'Data wypadku jest wymagana';
    }

    if (!formData.accidentTime) {
      newErrors.accidentTime = 'Godzina wypadku jest wymagana';
    }

    if (!formData.accidentLocation) {
      newErrors.accidentLocation = 'Miejsce wypadku jest wymagane';
    }

    if (!formData.wasWorkRelated) {
      newErrors.wasWorkRelated = 'Odpowiedź jest wymagana';
    }

    if (!formData.activityBeforeAccident) {
      newErrors.activityBeforeAccident = 'Opis czynności jest wymagany';
    }

    if (!formData.wasSudden) {
      newErrors.wasSudden = 'Odpowiedź jest wymagana';
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
        <h2 className="text-blue-900 mb-2">Podstawowe informacje o zdarzeniu</h2>
        <p className="text-gray-600">
          Podaj podstawowe informacje o wypadku. Te dane pomogą ustalić, czy zdarzenie 
          spełnia kryteria wypadku przy pracy.
        </p>
      </div>

      {/* Data i godzina */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h3 className="text-gray-900">Kiedy miał miejsce wypadek?</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">
              Data wypadku *
            </label>
            <input
              type="date"
              value={formData.accidentDate}
              onChange={(e) => setFormData({ ...formData, accidentDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.accidentDate && (
              <p className="text-red-600 mt-1">{errors.accidentDate}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              Godzina wypadku (w przybliżeniu) *
            </label>
            <input
              type="time"
              value={formData.accidentTime}
              onChange={(e) => setFormData({ ...formData, accidentTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.accidentTime && (
              <p className="text-red-600 mt-1">{errors.accidentTime}</p>
            )}
          </div>
        </div>
      </div>

      {/* Miejsce */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h3 className="text-gray-900">Gdzie miał miejsce wypadek?</h3>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">
            Dokładne miejsce wypadku *
          </label>
          <input
            type="text"
            value={formData.accidentLocation}
            onChange={(e) => setFormData({ ...formData, accidentLocation: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="np. ul. Przykładowa 123, Warszawa - teren budowy, piętro 2"
          />
          {errors.accidentLocation && (
            <p className="text-red-600 mt-1">{errors.accidentLocation}</p>
          )}
          <p className="text-gray-600 mt-2">
            Podaj jak najdokładniejsze miejsce (adres, nazwa obiektu, pomieszczenie, itp.)
          </p>
        </div>
      </div>

      {/* Związek z pracą */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-blue-600" />
          <h3 className="text-gray-900">Związek z działalnością gospodarczą</h3>
          <button
            onClick={() => setShowWorkRelatedHelp(!showWorkRelatedHelp)}
            className="ml-auto p-2 hover:bg-gray-100 rounded"
          >
            <HelpCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {showWorkRelatedHelp && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-gray-700">
              <strong>Przykłady czynności związanych z działalnością:</strong>
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
              <li>Wykonywanie typowych czynności zawodowych</li>
              <li>Przemieszczanie się między miejscami wykonywania pracy</li>
              <li>Przygotowanie miejsca pracy lub narzędzi</li>
              <li>Udział w spotkaniach biznesowych</li>
              <li>Transport towarów lub materiałów</li>
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-gray-700">
            Czy w momencie wypadku wykonywałeś czynności związane z prowadzoną działalnością gospodarczą? *
          </p>
          
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="wasWorkRelated"
                value="tak"
                checked={formData.wasWorkRelated === 'tak'}
                onChange={(e) => setFormData({ ...formData, wasWorkRelated: e.target.value })}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-900">
                Tak, wykonywałem czynności związane z moją działalnością
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="wasWorkRelated"
                value="nie"
                checked={formData.wasWorkRelated === 'nie'}
                onChange={(e) => setFormData({ ...formData, wasWorkRelated: e.target.value })}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-900">
                Nie, wykonywałem czynności prywatne/niezwiązane z działalnością
              </span>
            </label>
          </div>

          {errors.wasWorkRelated && (
            <p className="text-red-600">{errors.wasWorkRelated}</p>
          )}
        </div>

        {formData.wasWorkRelated === 'nie' && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              <strong>Uwaga:</strong> Jeśli zdarzenie nie było związane z wykonywaniem 
              działalności gospodarczej, może nie zostać uznane za wypadek przy pracy. 
              Upewnij się, że prawidłowo odpowiedziałeś na to pytanie.
            </p>
          </div>
        )}
      </div>

      {/* Czynności przed wypadkiem */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">
          Jakie czynności wykonywałeś bezpośrednio przed wypadkiem? *
        </h3>
        
        <textarea
          value={formData.activityBeforeAccident}
          onChange={(e) => setFormData({ ...formData, activityBeforeAccident: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={`Opisz szczegółowo, co robiłeś przed wypadkiem, np.:\n- Montowałem instalację elektryczną w budynku klienta\n- Jechałem samochodem służbowym do klienta na spotkanie\n- Rozładowywałem towar w magazynie`}
        />
        {errors.activityBeforeAccident && (
          <p className="text-red-600 mt-1">{errors.activityBeforeAccident}</p>
        )}
        <p className="text-gray-600 mt-2">
          Im dokładniej opiszesz wykonywane czynności, tym łatwiej będzie ustalić związek z pracą
        </p>
      </div>

      {/* Nagłość */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-blue-600" />
          <h3 className="text-gray-900">Nagłość zdarzenia</h3>
          <button
            onClick={() => setShowSuddenHelp(!showSuddenHelp)}
            className="ml-auto p-2 hover:bg-gray-100 rounded"
          >
            <HelpCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {showSuddenHelp && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-gray-700">
              <strong>Zdarzenie nagłe</strong> to takie, które nastąpiło w krótkim czasie, 
              niespodziewanie. Przykłady:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
              <li>Upadek z drabiny</li>
              <li>Poślizgnięcie się</li>
              <li>Uderzenie przez spadający przedmiot</li>
              <li>Porażenie prądem</li>
            </ul>
            <p className="text-gray-700 mt-2">
              <strong>NIE jest wypadkiem:</strong> długotrwałe narażenie (np. wieloletnia praca 
              w hałasie), stopniowy rozwój choroby zawodowej.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-gray-700">
            Czy zdarzenie nastąpiło nagle, w krótkim czasie? *
          </p>
          
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="wasSudden"
                value="tak"
                checked={formData.wasSudden === 'tak'}
                onChange={(e) => setFormData({ ...formData, wasSudden: e.target.value })}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-900">
                Tak, zdarzenie nastąpiło nagle i nieoczekiwanie
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="wasSudden"
                value="nie"
                checked={formData.wasSudden === 'nie'}
                onChange={(e) => setFormData({ ...formData, wasSudden: e.target.value })}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-900">
                Nie, było to stopniowe lub długotrwałe narażenie
              </span>
            </label>
          </div>

          {errors.wasSudden && (
            <p className="text-red-600">{errors.wasSudden}</p>
          )}
        </div>

        {formData.wasSudden === 'nie' && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800">
              <strong>Uwaga:</strong> Jeśli zdarzenie nie było nagłe, może nie spełniać 
              kryterium wypadku przy pracy. Może to być choroba zawodowa - skonsultuj się 
              z lekarzem medycyny pracy.
            </p>
          </div>
        )}
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
