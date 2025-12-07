import { useRef, useEffect, useState } from 'react';
import { useWizard } from './WizardContext';
import { useChat, ChatMessage } from './ChatContext';
import { Send, Bot, User, Sparkles, CheckCircle, AlertCircle, Download, Save, Loader2, Zap } from 'lucide-react';
import { openaiService } from '../services/openaiService';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { generateReportPDF } from '../utils/pdfGenerator';

export function ChatbotInterface() {
  const { data, updateData, analyzeCompleteness, saveProgress, isSaving } = useWizard();
  
  const { 
    messages, setMessages, 
    input, setInput,
    isTyping, setIsTyping,
  } = useChat();

  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
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
        const welcomeMessage: ChatMessage = {
          id: '1',
          role: 'bot',
          content: 'Dzień dobry! Jestem asystentem ZUS. Pomogę Ci przygotować zgłoszenie wypadku przy pracy lub wyjaśnienia poszkodowanego.\n\nMożesz pisać do mnie w języku naturalnym, a ja poprowadzę Cię przez cały proces. Na początek powiedz, co chcesz przygotować: zawiadomienie o wypadku, czy tylko wyjaśnienia?',
          timestamp: new Date(),
          suggestions: ['Zawiadomienie o wypadku', 'Wyjaśnienia poszkodowanego', 'Oba dokumenty'],
        };

        setMessages([welcomeMessage]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Dodaj wiadomość użytkownika
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // Konwersja historii czatu do formatu OpenAI
      const chatHistory = newMessages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content
      }));

      // Wywołanie serwisu OpenAI
      const response = await openaiService.sendMessage(chatHistory, data);

      // Aktualizacja danych formularza jeśli zostały wyodrębnione
      if (response.extractedData && Object.keys(response.extractedData).length > 0) {
        updateData(response.extractedData);
        analyzeCompleteness();
      }

      // Dodanie odpowiedzi bota
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
        data: (response.extractedData && Object.keys(response.extractedData).length > 0) ? response.extractedData : undefined,
      };

      if (response.shouldGeneratePdf) {
          botMessage.content += "\n\n[SYSTEM: Dokument PDF jest gotowy do pobrania]";
          // Dodajemy specjalną sugestię lub obsługujemy to w renderowaniu
          botMessage.suggestions = [...(botMessage.suggestions || []), "Pobierz PDF teraz"];
      }

      setMessages([...newMessages, botMessage]);
    } catch (error) {
      console.error('Błąd chatbota:', error);
      toast.error("Wystąpił problem z połączeniem z asystentem.");
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Przepraszam, wystąpił chwilowy problem z połączeniem. Proszę spróbuj ponownie za chwilę.',
        timestamp: new Date(),
      };

      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (suggestion === "Pobierz PDF teraz") {
        setIsPdfGenerating(true);
        try {
            await generateReportPDF(data);
            toast.success("Dokument został pobrany.");
        } catch (e) {
            toast.error("Błąd generowania PDF.");
        } finally {
            setIsPdfGenerating(false);
        }
        return;
    }

    setInput(suggestion);
    // Opcjonalnie można od razu wysłać, ale lepiej dać użytkownikowi możliwość edycji
    // handleSend(); 
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    const filled = fields.filter(f => f && f !== 'brak' && f !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Główny chat */}
      <div className="lg:col-span-2">
        <div className="flex flex-col h-[700px] border border-gray-200 rounded-2xl overflow-hidden">
          {/* Nagłówek minimalistyczny */}
          <div className="border-b border-gray-100 p-6 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-gray-900">Inteligentny Asystent ZUS</h3>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      AI Powered
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-gray-400 text-sm">
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
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
                            <span>Zapisane dane</span>
                          </div>
                          <div className="text-sm text-green-800 space-y-1">
                            {Object.entries(message.data).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="text-green-600 font-medium">{key}:</span>
                                <span className="text-green-900">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => {
                            const isDownload = suggestion === "Pobierz PDF teraz";
                            return (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                disabled={isPdfGenerating && isDownload}
                                className={`text-sm px-3 py-1.5 rounded-full transition-colors border text-left flex items-center gap-2 ${
                                  isDownload 
                                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                {isDownload && (
                                    isPdfGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Download className="w-3 h-3"/>
                                )}
                                {suggestion}
                              </button>
                            );
                          })}
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
                placeholder="Napisz wiadomość..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-gray-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
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
              Odpowiadaj naturalnie. Wszystkie dane są automatycznie zapisywane w tle. Asystent ZUS pomaga wypełnić formularz zgodnie z przepisami.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
