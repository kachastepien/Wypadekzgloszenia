import { useState, useEffect } from 'react';
import { useWizard } from './WizardContext';
import { AlertTriangle, User } from 'lucide-react';

interface ReporterInfoStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function ReporterInfoStep({ onNext, onPrevious }: ReporterInfoStepProps) {
  const { data, updateData } = useWizard();
  const [formData, setFormData] = useState({
    isProxy: data.isProxy,
    hasProxyDocument: data.hasProxyDocument,
    proxyName: data.proxyName,
    proxyRelation: data.proxyRelation,
    injuredName: data.injuredName,
    injuredSurname: data.injuredSurname,
    injuredPesel: data.injuredPesel,
    injuredEmail: data.injuredEmail,
    injuredPhone: data.injuredPhone,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.injuredName) newErrors.injuredName = 'Imię jest wymagane';
    if (!formData.injuredSurname) newErrors.injuredSurname = 'Nazwisko jest wymagane';
    if (!formData.injuredPesel) {
      newErrors.injuredPesel = 'PESEL jest wymagany';
    } else if (!/^\d{11}$/.test(formData.injuredPesel)) {
      newErrors.injuredPesel = 'PESEL musi składać się z 11 cyfr';
    }
    if (formData.injuredEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.injuredEmail)) {
      newErrors.injuredEmail = 'Nieprawidłowy format email';
    }
    if (formData.injuredPhone && !/^\d{9,}$/.test(formData.injuredPhone.replace(/\s/g, ''))) {
      newErrors.injuredPhone = 'Nieprawidłowy numer telefonu';
    }

    if (formData.isProxy && !formData.proxyName) {
      newErrors.proxyName = 'Imię i nazwisko pełnomocnika jest wymagane';
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
      // Zapisujemy częściowe dane
      updateData(formData);
      onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-blue-900 mb-2">Dane zgłaszającego i poszkodowanego</h2>
        <p className="text-gray-600">
          Podaj dane osoby, która zgłasza wypadek oraz dane poszkodowanego.
        </p>
      </div>

      {/* Pytanie o pełnomocnika */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isProxy}
            onChange={(e) => setFormData({ ...formData, isProxy: e.target.checked })}
            className="mt-1 w-5 h-5 text-blue-600 rounded"
          />
          <div>
            <span className="text-gray-900">
              Zgłaszam wypadek jako pełnomocnik poszkodowanego
            </span>
            <p className="text-gray-600 mt-1">
              Zaznacz, jeśli nie jesteś osobą poszkodowaną, a działasz w jej imieniu
            </p>
          </div>
        </label>
      </div>

      {/* Dane pełnomocnika */}
      {formData.isProxy && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-amber-900 mb-2">Dane pełnomocnika</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    Imię i nazwisko pełnomocnika *
                  </label>
                  <input
                    type="text"
                    value={formData.proxyName}
                    onChange={(e) => setFormData({ ...formData, proxyName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jan Kowalski"
                  />
                  {errors.proxyName && (
                    <p className="text-red-600 mt-1">{errors.proxyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">
                    Relacja z poszkodowanym
                  </label>
                  <input
                    type="text"
                    value={formData.proxyRelation}
                    onChange={(e) => setFormData({ ...formData, proxyRelation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="np. współmałżonek, rodzic, prawnik"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasProxyDocument}
                    onChange={(e) => setFormData({ ...formData, hasProxyDocument: e.target.checked })}
                    className="mt-1 w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-gray-900">
                      Posiadam pełnomocnictwo do reprezentowania poszkodowanego
                    </span>
                  </div>
                </label>

                {!formData.hasProxyDocument && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-800">
                      <strong>Uwaga:</strong> Będziesz musiał dostarczyć pełnomocnictwo 
                      (oryginał lub urzędowo poświadczony odpis) wraz z zawiadomieniem.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dane poszkodowanego */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-6 h-6 text-blue-600" />
          <h3 className="text-gray-900">Dane poszkodowanego</h3>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">
                Imię *
              </label>
              <input
                type="text"
                value={formData.injuredName}
                onChange={(e) => setFormData({ ...formData, injuredName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Jan"
              />
              {errors.injuredName && (
                <p className="text-red-600 mt-1">{errors.injuredName}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Nazwisko *
              </label>
              <input
                type="text"
                value={formData.injuredSurname}
                onChange={(e) => setFormData({ ...formData, injuredSurname: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Kowalski"
              />
              {errors.injuredSurname && (
                <p className="text-red-600 mt-1">{errors.injuredSurname}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              PESEL *
            </label>
            <input
              type="text"
              value={formData.injuredPesel}
              onChange={(e) => setFormData({ ...formData, injuredPesel: e.target.value })}
              maxLength={11}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="12345678901"
            />
            {errors.injuredPesel && (
              <p className="text-red-600 mt-1">{errors.injuredPesel}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              Adres email
            </label>
            <input
              type="email"
              value={formData.injuredEmail}
              onChange={(e) => setFormData({ ...formData, injuredEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="jan.kowalski@email.pl"
            />
            {errors.injuredEmail && (
              <p className="text-red-600 mt-1">{errors.injuredEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              Numer telefonu
            </label>
            <input
              type="tel"
              value={formData.injuredPhone}
              onChange={(e) => setFormData({ ...formData, injuredPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123456789"
            />
            {errors.injuredPhone && (
              <p className="text-red-600 mt-1">{errors.injuredPhone}</p>
            )}
          </div>
        </div>
      </div>

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
                Uzupełnij później
            </button>
            <button
            onClick={handleContinue}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
            Dalej
            </button>
        </div>
      </div>
    </div>
  );
}
