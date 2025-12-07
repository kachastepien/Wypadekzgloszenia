import { createContext, useContext, useState, ReactNode } from 'react';
import { storageService } from '../services/storageService';
import { toast } from 'sonner@2.0.3';

export interface WizardData {
  id?: string;
  // Rodzaj zgłoszenia
  reportType: 'accident' | 'explanation' | 'both' | null;
  
  // Dane zgłaszającego
  isProxy: boolean;
  hasProxyDocument: boolean;
  proxyName: string;
  proxyRelation: string;
  
  // Dane poszkodowanego
  injuredName: string;
  injuredSurname: string;
  injuredPesel: string;
  injuredEmail: string;
  injuredPhone: string;
  
  // Dane działalności
  nip: string;
  regon: string;
  pkdCode: string;
  pkdDescription: string;
  businessName: string;
  businessAddress: string;
  
  // Szczegóły wypadku
  accidentDate: string;
  accidentTime: string;
  accidentLocation: string;
  wasWorkRelated: string;
  activityBeforeAccident: string;
  
  // Przebieg wypadku
  accidentSequence: Array<{
    step: number;
    description: string;
    time?: string;
  }>;
  
  // Nagłość i przyczyna
  wasSudden: string;
  externalCause: string;
  causeDetails: string;
  
  // Obrażenia
  injuryType: string;
  injuryLocation: string;
  injuryDescription: string;
  medicalAttention: string;
  hospitalName: string;
  
  // Świadkowie
  witnesses: Array<{
    name: string;
    contact: string;
  }>;
  
  // Brakujące elementy
  missingElements: string[];
  requiredDocuments: string[];
  recommendations: string[];
}

interface WizardContextType {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
  analyzeCompleteness: () => void;
  saveProgress: () => Promise<void>;
  isSaving: boolean;
}

const defaultData: WizardData = {
  id: undefined,
  reportType: null,
  isProxy: false,
  hasProxyDocument: false,
  proxyName: '',
  proxyRelation: '',
  injuredName: '',
  injuredSurname: '',
  injuredPesel: '',
  injuredEmail: '',
  injuredPhone: '',
  nip: '',
  regon: '',
  pkdCode: '',
  pkdDescription: '',
  businessName: '',
  businessAddress: '',
  accidentDate: '',
  accidentTime: '',
  accidentLocation: '',
  wasWorkRelated: '',
  activityBeforeAccident: '',
  accidentSequence: [],
  wasSudden: '',
  externalCause: '',
  causeDetails: '',
  injuryType: '',
  injuryLocation: '',
  injuryDescription: '',
  medicalAttention: '',
  hospitalName: '',
  witnesses: [],
  missingElements: [],
  requiredDocuments: [],
  recommendations: [],
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WizardData>(defaultData);
  const [isSaving, setIsSaving] = useState(false);

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const saveProgress = async () => {
    setIsSaving(true);
    try {
      const result = await storageService.saveReport(data);
      if (result.success && result.id) {
        // If we didn't have an ID before, update it now
        if (!data.id) {
            updateData({ id: result.id });
        }
        toast.success("Postępy zostały zapisane");
      }
    } catch (error) {
      console.error("Error saving progress:", error);
      toast.error("Nie udało się zapisać postępów");
    } finally {
      setIsSaving(false);
    }
  };

  const analyzeCompleteness = () => {
    const missing: string[] = [];
    const documents: string[] = [];
    const recommendations: string[] = [];

    // Sprawdzenie pełnomocnictwa
    if (data.isProxy && !data.hasProxyDocument) {
      missing.push('Pełnomocnictwo do reprezentowania poszkodowanego');
      documents.push('Pełnomocnictwo (oryginał lub urzędowo poświadczony odpis)');
    }

    // Sprawdzenie danych działalności
    if (!data.nip && !data.regon) {
      missing.push('NIP lub REGON działalności gospodarczej');
    }

    // Sprawdzenie elementów wypadku
    if (data.wasSudden === 'nie') {
      recommendations.push('Zdarzenie może nie spełniać kryterium nagłości wypadku przy pracy');
    }

    if (!data.externalCause || data.externalCause === 'brak') {
      missing.push('Przyczyna zewnętrzna zdarzenia');
      recommendations.push('Należy szczegółowo opisać przyczynę zewnętrzną wypadku');
    }

    if (!data.injuryDescription) {
      missing.push('Szczegółowy opis obrażeń');
    }

    if (data.wasWorkRelated === 'nie') {
      recommendations.push('UWAGA: Zdarzenie może nie zostać uznane za wypadek przy pracy - nie było związane z wykonywaną działalnością gospodarczą');
    }

    // Dokumenty medyczne
    if (data.medicalAttention === 'tak') {
      documents.push('Karta informacyjna ze szpitala lub zaświadczenie lekarskie o obrażeniach');
    }

    // Brak sekwencji zdarzeń
    if (data.accidentSequence.length < 2) {
      missing.push('Szczegółowy opis przebiegu wypadku (sekwencja zdarzeń)');
    }

    // Brak aktywności przed wypadkiem
    if (!data.activityBeforeAccident) {
      missing.push('Opis czynności wykonywanych przed wypadkiem');
    }

    // Dodatkowe dokumenty
    documents.push('Zaświadczenie lekarskie o czasowej niezdolności do pracy (ZUS Z-3)');
    documents.push('Kopia wpisu do CEIDG lub zaświadczenie o prowadzeniu działalności');

    updateData({
      missingElements: missing,
      requiredDocuments: documents,
      recommendations: recommendations,
    });
  };

  return (
    <WizardContext.Provider value={{ data, updateData, analyzeCompleteness, saveProgress, isSaving }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider');
  }
  return context;
}
