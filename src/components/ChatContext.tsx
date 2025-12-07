import { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  data?: Record<string, any>;
}

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  input: string;
  setInput: (input: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      addMessage,
      setMessages,
      isTyping,
      setIsTyping,
      input,
      setInput,
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
