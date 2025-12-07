import { useState, useEffect } from 'react';
import { langflowService } from '../services/langflowService';
import { Settings, Check, X, Zap } from 'lucide-react';

interface LangflowConfigProps {
  onClose: () => void;
  onConfigured: () => void;
}

export function LangflowConfig({ onClose, onConfigured }: LangflowConfigProps) {
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [flowId, setFlowId] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const config = langflowService.getConfig();
    if (config) {
      setEndpoint(config.endpoint);
      setApiKey(config.apiKey);
      setFlowId(config.flowId);
    }
  }, []);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      // Tymczasowo ustaw konfigurację
      langflowService.setConfig(endpoint, apiKey, flowId);
      
      // Testuj połączenie
      await langflowService.sendMessage('Cześć, to test połączenia');
      
      setTestResult('success');
      setTimeout(() => {
        onConfigured();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Błąd testowania:', error);
      setTestResult('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = () => {
    langflowService.setConfig(endpoint, apiKey, flowId);
    onConfigured();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900">Konfiguracja Langflow</h2>
              <p className="text-sm text-gray-500">Połącz swojego chatbota AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Langflow Endpoint URL
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://your-langflow.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL Twojej instancji Langflow (np. http://localhost:7860)
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Znajdziesz go w ustawieniach Langflow
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Flow ID
            </label>
            <input
              type="text"
              value={flowId}
              onChange={(e) => setFlowId(e.target.value)}
              placeholder="uuid-twojego-flow"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              ID przepływu z Langflow (UUID)
            </p>
          </div>
        </div>

        {testResult === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-900">
              Połączenie udane! Langflow działa poprawnie.
            </span>
          </div>
        )}

        {testResult === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
            <X className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-900">
              Błąd połączenia. Sprawdź dane i spróbuj ponownie.
            </span>
          </div>
        )}

        <div className="border-t border-gray-100 pt-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <h3 className="text-sm text-gray-900 mb-2">Jak to działa?</h3>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Stwórz flow w Langflow z komponentem Chat Input i Chat Output</li>
              <li>Dodaj w środku model LLM (OpenAI, Anthropic, itp.)</li>
              <li>Możesz dodać system prompt z instrukcjami dla ZUS</li>
              <li>Skopiuj endpoint URL, API key i Flow ID</li>
              <li>Wklej powyżej i przetestuj połączenie</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleTestConnection}
              disabled={!endpoint || !apiKey || !flowId || isTestingConnection}
              className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isTestingConnection ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Testowanie...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  Testuj połączenie
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={!endpoint || !apiKey || !flowId}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zapisz bez testowania
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
