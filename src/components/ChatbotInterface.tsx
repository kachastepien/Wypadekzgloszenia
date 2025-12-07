import { useState, useRef, useEffect } from 'react';
import { useWizard } from './WizardContext';
import { useChat } from './ChatContext';
import { Send, Bot, User, Sparkles, CheckCircle, AlertCircle, Download, Settings, Zap, Save, Loader2 } from 'lucide-react';
import { ChatMessage, chatbotLogic } from './ChatbotLogic';
import { langflowService } from '../services/langflowService';
import { LangflowConfig } from './LangflowConfig';
import { Button } from './ui/button';

export function ChatbotInterface() {
  const { data, updateData, analyzeCompleteness, saveProgress, isSaving } = useWizard();
  
  const { 
    messages, setMessages, 
    input, setInput,
    isTyping, setIsTyping,
    currentQuestion, setCurrentQuestion,
    useLangflow, setUseLangflow 
  } = useChat();

  const [showConfig, setShowConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inicjalizacja chatbota
  useEffect(() => {
    if (messages.length === 0) {
        const configured = langflowService.isConfigured();
        setUseLangflow(configured);

        const welcomeMessage: ChatMessage = {
          id: '1',
          role: 'bot',
          content: configured 
            ? 'Cześć! Jestem asystentem ZUS z AI. Pomogę Ci przygotować zgłoszenie wypadku przy pracy. Możesz rozmawiać ze mną naturalnie - odpowiem na Twoje pytania i pomogę wypełnić formularz. Gotowy?'
            : 'Cześć! Jestem asystentem ZUS. Pomogę Ci przygotować zgłoszenie wypadku przy pracy.\n\nBędę zadawać pytania, odpowiadaj naturalnie. Gotowy?',
          timestamp: new Date(),
        };

        const firstQuestion: ChatMessage = {
          id: '2',
          role: 'bot',
          content: 'Co chcesz przygotować?\n\n1. Zawiadomienie o wypadku\n2. Wyjaśnienia poszkodowanego\n3. Oba dokumenty',
          timestamp: new Date(),
          suggestions: ['Zawiadomienie o wypadku', 'Wyjaśnienia', 'Oba'],
        };

        setMessages([welcomeMessage, firstQuestion]);
    }
  }, []);

  const simulateTyping = async (delay: number = 800) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Dodaj wiadomość użytkownika
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    const userInput = input;
    setInput('');

    await simulateTyping();

    try {
      let botResponse: string;
      let extractedData: Record<string, any> = {};

      if (useLangflow) {
        // Użyj Langflow
        botResponse = await langflowService.sendMessage(userInput, data);
        
        // Spróbuj wyodrębnić dane z odpowiedzi AI
        extractedData = extractDataFromAIResponse(botResponse, userInput);
        
        // Zaktualizuj dane jeśli coś wyodrębniono
        if (Object.keys(extractedData).length > 0) {
          updateData(extractedData);
        }
      } else {
        // Użyj lokalnej logiki
        const response = chatbotLogic.processUserResponse(userInput, currentQuestion, data, updateData);
        botResponse = response.message;
        
        if (response.data) {
          extractedData = response.data;
        }
        
        setCurrentQuestion(response.nextQuestion);

        if (response.isComplete) {
          analyzeCompleteness();
        }

        // Dodaj sugestie z lokalnej logiki
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: botResponse,
          timestamp: new Date(),
          suggestions: response.suggestions,
          data: extractedData,
        };

        setMessages([...messages, userMessage, botMessage]);
        return;
      }

      // Dla Langflow - bez sugestii, tylko odpowiedź
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botResponse,
        timestamp: new Date(),
        data: Object.keys(extractedData).length > 0 ? extractedData : undefined,
      };

      setMessages([...messages, userMessage, botMessage]);
    } catch (error) {
      console.error('Błąd chatbota:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Przepraszam, wystąpił problem z połączeniem. Czy chcesz przełączyć się na tryb lokalny?',
        timestamp: new Date(),
        suggestions: ['Przełącz na tryb lokalny'],
      };

      setMessages([...messages, userMessage, errorMessage]);
    }
  };

  // Funkcja do wyodrębniania danych z odpowiedzi AI
  const extractDataFromAIResponse = (response: string, userInput: string): Record<string, any> => {
    const extracted: Record<string, any> = {};

    // Proste heurystyki - możesz rozbudować
    const lowerResponse = response.toLowerCase();
    const lowerInput = userInput.toLowerCase();

    // Wykryj PESEL
    const peselMatch = userInput.match(/\d{11}/);
    if (peselMatch && lowerResponse.includes('pesel')) {
      extracted.injuredPesel = peselMatch[0];
    }

    // Wykryj NIP
    const nipMatch = userInput.match(/\d{10}/);
    if (nipMatch && lowerResponse.includes('nip')) {
      extracted.nip = nipMatch[0];
    }

    // Wykryj datę
    const dateMatch = userInput.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch && (lowerResponse.includes('data') || lowerResponse.includes('wypadku'))) {
      extracted.accidentDate = dateMatch[0];
    }

    // Wykryj email
    const emailMatch = userInput.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
    if (emailMatch) {
      extracted.injuredEmail = emailMatch[0];
    }

    return extracted;
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === 'Przełącz na tryb lokalny') {
      setUseLangflow(false);
      setMessages([]);
      setCurrentQuestion(0);
      return;
    }
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConfigured = () => {
    setUseLangflow(langflowService.isConfigured());
    // Zresetuj konwersację
    setMessages([]);
    setCurrentQuestion(0);
  };

  // Oblicz postęp
  const calculateProgress = () => {
    const fields = [
      data.injuredName,
      data.injuredSurname,
      data.injuredPesel,
      data.nip,
      data.pkdCode,
      data.accidentDate,
      data.accidentTime,
      data.accidentLocation,
      data.activityBeforeAccident,
      data.externalCause,
      data.injuryType,
      data.injuryDescription,
    ];
    const filled = fields.filter(f => f && f !== 'brak').length;
    return Math.round((filled / fields.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {showConfig && (
        <LangflowConfig 
          onClose={() => setShowConfig(false)} 
          onConfigured={handleConfigured}
        />
      )}

      {/* Główny chat */}
      <div className="lg:col-span-2">
        <div className="flex flex-col h-[700px] border border-gray-200 rounded-2xl overflow-hidden">
          {/* Nagłówek minimalistyczny */}
          <div className="border-b border-gray-100 p-6 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${useLangflow ? 'bg-purple-600' : 'bg-gray-900'} rounded-full flex items-center justify-center`}>
                  {useLangflow ? (
                    <Zap className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-gray-900">Asystent ZUS</h3>
                    {useLangflow && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                        AI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-gray-400 text-sm">
                      {useLangflow ? 'Langflow' : 'Lokalny'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowConfig(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Konfiguracja Langflow"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
                <div className="text-right">
                  <div className="text-2xl text-gray-900">{progress}%</div>
                  <div className="text-xs text-gray-400">ukończone</div>
                </div>
              </div>
            </div>
          </div>

          {/* Wiadomości */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {message.role === 'bot' && (
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div className={`inline-block max-w-[85%] rounded-2xl px-5 py-3 ${
                      message.role === 'bot' 
                        ? 'bg-white border border-gray-100' 
                        : 'bg-gray-900 text-white'
                    }`}>
                      <p className={`whitespace-pre-wrap leading-relaxed ${
                        message.role === 'bot' ? 'text-gray-800' : 'text-white'
                      }`}>
                        {message.content}
                      </p>

                      {message.data && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                          <div className="flex items-center gap-2 text-green-900 text-sm mb-2">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Zapisane</span>
                          </div>
                          <div className="text-sm text-green-800 space-y-1">
                            {Object.entries(message.data).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="text-green-600">{key}:</span>
                                <span className="text-green-900">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-sm px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 mt-1.5 block px-2">
                      {message.timestamp.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input minimalistyczny */}
          <div className="border-t border-gray-100 p-6 bg-white">
            <div className="flex gap-3 items-end">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Wpisz odpowiedź..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-gray-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-5 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel boczny minimalistyczny */}
      <div className="lg:col-span-1">
        <div className="border border-gray-200 rounded-2xl p-6 sticky top-4">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-gray-900" />
            <h3 className="text-gray-900">Postęp</h3>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Wypełnienie</span>
              <span className="text-3xl text-gray-900">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-gray-900 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4">
              <Button
                onClick={saveProgress}
                disabled={isSaving}
                className="w-full bg-gray-900 text-white hover:bg-gray-800"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Zapisywanie...' : 'Zapisz postępy'}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm text-gray-500">Zebrane informacje</h4>
              <div className="space-y-2">
                {data.injuredName && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-gray-900" />
                    <span>Dane osobowe</span>
                  </div>
                )}
                {data.nip && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-gray-900" />
                    <span>Działalność</span>
                  </div>
                )}
                {data.accidentDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-gray-900" />
                    <span>Data i miejsce</span>
                  </div>
                )}
                {data.externalCause && data.externalCause !== 'brak' && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-gray-900" />
                    <span>Przyczyna</span>
                  </div>
                )}
                {data.injuryDescription && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-gray-900" />
                    <span>Obrażenia</span>
                  </div>
                )}
              </div>
            </div>

            {data.missingElements && data.missingElements.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm text-amber-900 mb-2">Uwagi</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      {data.missingElements.slice(0, 3).map((element, index) => (
                        <li key={index}>• {element}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {progress === 100 && (
              <div className="bg-gray-900 text-white rounded-xl p-4">
                <div className="flex items-start gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="mb-1">Gotowe!</h4>
                    <p className="text-sm text-gray-300">
                      Możesz pobrać dokument
                    </p>
                  </div>
                </div>
                <button className="w-full bg-white text-gray-900 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Pobierz PDF
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">
              Odpowiadaj naturalnie. Wszystkie dane są automatycznie zapisywane.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
