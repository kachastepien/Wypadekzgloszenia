import { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage } from './ChatbotLogic';

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  currentQuestion: number;
  setCurrentQuestion: (question: number) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  input: string;
  setInput: (input: string) => void;
  useLangflow: boolean;
  setUseLangflow: (use: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [useLangflow, setUseLangflow] = useState(false);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      addMessage,
      setMessages,
      currentQuestion,
      setCurrentQuestion,
      isTyping,
      setIsTyping,
      input,
      setInput,
      useLangflow,
      setUseLangflow
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
