import { projectId, publicAnonKey } from '../utils/supabase/info';
import { WizardData } from '../components/WizardContext';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1ba4d8f6`;

export interface ChatResponse {
  message: string;
  suggestions: string[];
  extractedData: Record<string, any>;
}

export const openaiService = {
  async sendMessage(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    currentData: WizardData
  ): Promise<ChatResponse> {
    try {
      if (!projectId) {
        console.error("Configuration Error: projectId is missing in supabase/info");
        throw new Error("Configuration Error: projectId is missing");
      }
      
      // Filtrujemy dane, aby nie wysyłać zbędnych rzeczy (np. dużych obiektów jeśli takie są)
      // ale wysyłamy wszystko co istotne dla kontekstu
      const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          messages,
          currentData
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send chat message:', error);
      throw error;
    }
  }
};
