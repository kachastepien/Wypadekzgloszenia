import { WizardData } from '../components/WizardContext';

interface LangflowConfig {
  endpoint: string;
  apiKey: string;
  flowId: string;
}

interface LangflowMessage {
  message: string;
  session_id?: string;
}

interface LangflowResponse {
  outputs: Array<{
    outputs: Array<{
      results: {
        message: {
          text: string;
        };
      };
    }>;
  }>;
}

export class LangflowService {
  private config: LangflowConfig | null = null;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadConfig();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private loadConfig() {
    // Załaduj konfigurację z localStorage lub zmiennych środowiskowych
    const savedConfig = localStorage.getItem('langflow_config');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
    }
  }

  public setConfig(endpoint: string, apiKey: string, flowId: string) {
    this.config = { endpoint, apiKey, flowId };
    localStorage.setItem('langflow_config', JSON.stringify(this.config));
  }

  public isConfigured(): boolean {
    return this.config !== null && 
           this.config.endpoint !== '' && 
           this.config.apiKey !== '' &&
           this.config.flowId !== '';
  }

  public getConfig(): LangflowConfig | null {
    return this.config;
  }

  public async sendMessage(
    message: string, 
    context?: WizardData
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Langflow nie jest skonfigurowany');
    }

    try {
      // Przygotuj kontekst dla Langflow
      const contextString = this.prepareContext(context);

      const payload = {
        input_value: message,
        output_type: 'chat',
        input_type: 'chat',
        tweaks: {
          'ChatInput-1': {},
          'ChatOutput-1': {},
        },
        session_id: this.sessionId,
      };

      // Jeśli mamy kontekst, dodaj go do tweaks
      if (contextString) {
        payload.tweaks['ContextData'] = {
          context: contextString
        };
      }

      const response = await fetch(
        `${this.config!.endpoint}/api/v1/run/${this.config!.flowId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config!.apiKey}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Langflow API error: ${response.status}`);
      }

      const data: LangflowResponse = await response.json();
      
      // Wyciągnij odpowiedź z Langflow
      const botMessage = data.outputs?.[0]?.outputs?.[0]?.results?.message?.text;
      
      if (!botMessage) {
        throw new Error('Nie otrzymano odpowiedzi z Langflow');
      }

      return botMessage;
    } catch (error) {
      console.error('Błąd Langflow:', error);
      throw error;
    }
  }

  private prepareContext(data?: WizardData): string {
    if (!data) return '';

    const context = {
      reportType: data.reportType,
      isProxy: data.isProxy,
      injuredName: data.injuredName,
      injuredSurname: data.injuredSurname,
      injuredPesel: data.injuredPesel,
      injuredEmail: data.injuredEmail,
      nip: data.nip,
      businessName: data.businessName,
      pkdCode: data.pkdCode,
      accidentDate: data.accidentDate,
      accidentTime: data.accidentTime,
      accidentLocation: data.accidentLocation,
      externalCause: data.externalCause,
      injuryType: data.injuryType,
      injuryDescription: data.injuryDescription,
    };

    // Filtruj tylko wypełnione pola
    const filled = Object.entries(context)
      .filter(([_, value]) => value && value !== 'brak')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return filled;
  }

  public resetSession() {
    this.sessionId = this.generateSessionId();
  }
}

// Singleton instance
export const langflowService = new LangflowService();
