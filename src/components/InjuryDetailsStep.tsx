import { useState } from 'react';
import { useWizard } from './WizardContext';
import { Heart, Plus, Trash2, Users } from 'lucide-react';

interface InjuryDetailsStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function InjuryDetailsStep({ onNext, onPrevious }: InjuryDetailsStepProps) {
  const { data, updateData } = useWizard();
  const [formData, setFormData] = useState({
    injuryType: data.injuryType,
    injuryLocation: data.injuryLocation,
    injuryDescription: data.injuryDescription,
    medicalAttention: data.medicalAttention,
    hospitalName: data.hospitalName,
  });
  const [witnesses, setWitnesses] = useState(
    data.witnesses.length > 0 ? data.witnesses : []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const injuryTypes = [
    'Złamanie',
    'Zwichnięcie',
    'Skręcenie',
    'Stłuczenie',
    'Rana cięta',
    'Rana kłuta',
    'Oparzenie',
    'Odmrożenie',
    'Porażenie prądem',
    'Uraz głowy',
    'Uraz kręgosłupa',
    'Uraz wielonarządowy',
    'Inne obrażenia',
  ];

  const bodyParts = [
    'Głowa',
    'Szyja',
    'Klatka piersiowa',
    'Brzuch',
    'Kręgosłup',
    'Bark prawy',
    'Bark lewy',
    'Ręka prawa',
    'Ręka lewa',
    'Dłoń prawa',
    'Dłoń lewa',
    'Palce prawej ręki',
    'Palce lewej ręki',
    'Biodro prawe',
    'Biodro lewe',
    'Noga prawa',
    'Noga lewa',
    'Stopa prawa',
    'Stopa lewa',
    'Wiele części ciała',
  ];

  const addWitness = () => {
    setWitnesses([...witnesses, { name: '', contact: '' }]);
  };

  const removeWitness = (index: number) => {
    setWitnesses(witnesses.filter((_, i) => i !== index));
  };

  const updateWitness = (index: number, field: 'name' | 'contact', value: string) => {
    const newWitnesses = [...witnesses];
    newWitnesses[index] = { ...newWitnesses[index], [field]: value };
    setWitnesses(newWitnesses);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.injuryType) {
      newErrors.injuryType = 'Rodzaj obrażenia jest wymagany';
    }

    if (!formData.injuryLocation) {
      newErrors.injuryLocation = 'Lokalizacja urazu jest wymagana';
    }

    if (!formData.injuryDescription) {
      newErrors.injuryDescription = 'Opis obrażeń jest wymagany';
    }

    if (!formData.medicalAttention) {
      newErrors.medicalAttention = 'Odpowiedź jest wymagana';
    }

    if (formData.medicalAttention === 'tak' && !formData.hospitalName) {
      newErrors.hospitalName = 'Nazwa placówki medycznej jest wymagana';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      updateData({ ...formData, witnesses });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-blue-900 mb-2">Obrażenia i konsekwencje wypadku</h2>
        <p className="text-gray-600">
          Opisz szczegółowo obrażenia, jakich doznałeś w wyniku wypadku oraz czy otrzymałeś 
          pomoc medyczną.
        </p>
      </div>

      {/* Rodzaj obrażenia */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-red-600" />
          <h3 className="text-gray-900">Rodzaj obrażenia *</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-2">
          {injuryTypes.map((type) => (
            <label
              key={type}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="injuryType"
                value={type}
                checked={formData.injuryType === type}
                onChange={(e) => setFormData({ ...formData, injuryType: e.target.value })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-900">{type}</span>
            </label>
          ))}
        </div>

        {errors.injuryType && (
          <p className="text-red-600 mt-3">{errors.injuryType}</p>
        )}
      </div>

      {/* Lokalizacja urazu */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">Lokalizacja urazu *</h3>

        <div className="grid md:grid-cols-2 gap-2">
          {bodyParts.map((part) => (
            <label
              key={part}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="injuryLocation"
                value={part}
                checked={formData.injuryLocation === part}
                onChange={(e) => setFormData({ ...formData, injuryLocation: e.target.value })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-900">{part}</span>
            </label>
          ))}
        </div>

        {errors.injuryLocation && (
          <p className="text-red-600 mt-3">{errors.injuryLocation}</p>
        )}
      </div>

      {/* Szczegółowy opis obrażeń */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">
          Szczegółowy opis obrażeń *
        </h3>
        <p className="text-gray-600 mb-4">
          Opisz dokładnie obrażenia, w tym stopień ciężkości, ból, ograniczenie ruchomości, itp.
        </p>
        
        <textarea
          value={formData.injuryDescription}
          onChange={(e) => setFormData({ ...formData, injuryDescription: e.target.value })}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={`Przykład:\n"Złamanie żeber po stronie lewej (4 i 5 żebro), silny ból w okolicy klatki piersiowej, utrudnione oddychanie, siniaki. Ból nasila się przy głębokim wdechu i podczas ruchu."`}
        />
        {errors.injuryDescription && (
          <p className="text-red-600 mt-1">{errors.injuryDescription}</p>
        )}
      </div>

      {/* Pomoc medyczna */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">
          Czy otrzymałeś pomoc medyczną? *
        </h3>

        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="medicalAttention"
              value="tak"
              checked={formData.medicalAttention === 'tak'}
              onChange={(e) => setFormData({ ...formData, medicalAttention: e.target.value })}
              className="w-5 h-5 text-blue-600"
            />
            <span className="text-gray-900">
              Tak, otrzymałem pomoc medyczną (szpital, przychodnia, pogotowie)
            </span>
          </label>

          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="medicalAttention"
              value="nie"
              checked={formData.medicalAttention === 'nie'}
              onChange={(e) => setFormData({ ...formData, medicalAttention: e.target.value })}
              className="w-5 h-5 text-blue-600"
            />
            <span className="text-gray-900">
              Nie, nie otrzymałem pomocy medycznej
            </span>
          </label>
        </div>

        {errors.medicalAttention && (
          <p className="text-red-600 mb-3">{errors.medicalAttention}</p>
        )}

        {formData.medicalAttention === 'tak' && (
          <div>
            <label className="block text-gray-700 mb-1">
              Nazwa szpitala/przychodni/pogotowia *
            </label>
            <input
              type="text"
              value={formData.hospitalName}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="np. Szpital Wojewódzki w Warszawie, ul. Szpitalna 1"
            />
            {errors.hospitalName && (
              <p className="text-red-600 mt-1">{errors.hospitalName}</p>
            )}
            <p className="text-gray-600 mt-2">
              Podaj pełną nazwę i adres placówki, która udzieliła Ci pomocy
            </p>
          </div>
        )}

        {formData.medicalAttention === 'nie' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800">
              <strong>Zalecenie:</strong> Jeśli doznałeś obrażeń, zaleca się wizytę u lekarza 
              w celu dokumentacji medycznej. Zaświadczenie lekarskie będzie potrzebne do 
              rozpatrzenia wniosku o świadczenia z tytułu wypadku przy pracy.
            </p>
          </div>
        )}
      </div>

      {/* Świadkowie */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-blue-600" />
          <h3 className="text-gray-900">Świadkowie wypadku (opcjonalnie)</h3>
        </div>

        <p className="text-gray-600 mb-4">
          Jeśli były osoby, które widziały wypadek lub mogą potwierdzić jego okoliczności, 
          podaj ich dane kontaktowe.
        </p>

        <div className="space-y-4">
          {witnesses.map((witness, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700">Świadek {index + 1}</span>
                <button
                  onClick={() => removeWitness(index)}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    Imię i nazwisko
                  </label>
                  <input
                    type="text"
                    value={witness.name}
                    onChange={(e) => updateWitness(index, 'name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jan Kowalski"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">
                    Telefon lub email
                  </label>
                  <input
                    type="text"
                    value={witness.contact}
                    onChange={(e) => updateWitness(index, 'contact', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123456789 lub email@example.com"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addWitness}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-700"
          >
            <Plus className="w-5 h-5" />
            Dodaj świadka
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-gray-700">
          <strong>Ważne:</strong> Do zawiadomienia o wypadku będziesz musiał dołączyć 
          zaświadczenie lekarskie ZUS Z-3 o czasowej niezdolności do pracy oraz dokumentację 
          medyczną potwierdzającą obrażenia (np. kartę informacyjną ze szpitala).
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
