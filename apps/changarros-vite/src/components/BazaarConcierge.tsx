import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Sparkles } from "lucide-react";
import { getGeminiChatResponse } from "../services/geminiService";
import { ChatMessage } from "../types";

export const BazaarConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "¡Hola! Bienvenid@ a Bazar NINA. 🌿 ¿Buscas algo especial para tu hogar o un regalo único?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userText = inputText;
    setInputText("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsLoading(true);

    const responseText = await getGeminiChatResponse(userText);

    setMessages((prev) => [...prev, { role: "model", text: responseText }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-40 bg-stone-800 text-white p-4 rounded-full shadow-xl hover:bg-stone-700 transition-all hover:scale-105 group"
        >
          <Sparkles
            size={24}
            className="group-hover:rotate-12 transition-transform duration-500"
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-[80vh] sm:h-[600px] z-50 flex flex-col bg-white sm:rounded-2xl shadow-2xl border border-stone-100 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-stone-100 p-4 flex justify-between items-center border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-300 overflow-hidden">
                <img
                  src="https://picsum.photos/seed/avatar/100/100"
                  alt="Aura"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-900">Aura</h3>
                <p className="text-xs text-stone-500">Concierge Virtual</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-stone-400 hover:text-stone-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${
                      msg.role === "user"
                        ? "bg-stone-800 text-stone-50 rounded-tr-none"
                        : "bg-white text-stone-700 border border-stone-100 rounded-tl-none"
                    }
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-100 p-3 rounded-2xl rounded-tl-none flex space-x-1 items-center">
                  <div
                    className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-stone-100 flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Pregunta algo..."
              className="flex-1 bg-stone-50 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-stone-300 outline-none text-stone-800 placeholder-stone-400"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2 bg-stone-800 text-white rounded-full hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
