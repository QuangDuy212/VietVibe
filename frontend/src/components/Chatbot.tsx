import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Sparkles, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { callAiChat } from "@/config/api";
import { toast } from "sonner";

interface Message {
  role: "user" | "model";
  text: string;
}

const SUGGESTIONS = [
  "How do I say 'Thank you' in Vietnamese?",
  "Explain the 6 tones in Vietnamese.",
  "Practice a greeting conversation with me.",
  "What is the difference between 'anh' and 'em'?",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("vibebot_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history:", e);
      }
    } else {
      // Welcome message
      setMessages([
        {
          role: "model",
          text: "Xin chào! I am **VibeBot**, your AI Vietnamese tutor. 🇻🇳✨\n\nHow can I help you learn Vietnamese today? Feel free to ask about grammar, vocabulary, or click a suggestion below to start practicing!",
        },
      ]);
    }
  }, []);

  // Save chat history to sessionStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("vibebot_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = { role: "user", text: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Format history for Google Gemini: [{ role: 'user' | 'model', parts: [{ text: string }] }]
      const apiHistory = updatedMessages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      const res = await callAiChat(apiHistory);
      if (res.data?.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: res.data.reply },
        ]);
      } else {
        toast.error("VibeBot received an empty response. Please try again.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to connect to VibeBot tutor.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      const resetMessages: Message[] = [
        {
          role: "model",
          text: "Conversation reset. How can I help you learn Vietnamese today?",
        },
      ];
      setMessages(resetMessages);
      sessionStorage.removeItem("vibebot_history");
      toast.success("Tutor history cleared!");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Window */}
      {isOpen && (
        <Card className="mb-4 w-[360px] sm:w-[400px] h-[500px] sm:h-[550px] shadow-2xl border border-primary/20 backdrop-blur-xl bg-card/95 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-primary via-accent to-secondary text-white p-4 flex flex-row items-center justify-between space-y-0 rounded-t-3xl shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-black tracking-tight flex items-center gap-1.5">
                  VibeBot <Sparkles className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
                </CardTitle>
                <p className="text-[10px] opacity-85 font-semibold uppercase tracking-wider">AI Language Tutor</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg active:scale-95 transition-all"
                title="Clear Chat History"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg active:scale-95 transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </Button>
            </div>
          </CardHeader>

          {/* Chat Body Area */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role !== "user" && (
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5 border border-primary/5 shadow-sm">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-none font-semibold"
                      : "bg-background border border-border/40 text-foreground rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing/Thinking Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5 border border-primary/5 shadow-sm">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="bg-background border border-border/40 text-foreground rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1 h-[36px]">
                  <span className="w-2 h-2 rounded-full bg-primary/45 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/65 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Prompt Suggestions */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 py-2 bg-muted/20 border-t border-border/20">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" /> Try asking VibeBot:
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    className="w-full text-left px-3 py-1.5 bg-background border border-border/40 rounded-xl text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/[0.02] active:scale-[0.99] transition-all flex items-center justify-between"
                  >
                    <span>{sug}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Input Area */}
          <CardFooter className="p-3 border-t bg-background flex gap-2">
            <input
              type="text"
              placeholder="Ask VibeBot tutor..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) handleSend(input);
              }}
              className="flex-1 px-4 py-2 border rounded-full text-sm font-semibold outline-none focus:ring-2 ring-primary/20 transition-all text-black"
              disabled={isLoading}
            />
            <Button
              size="icon"
              disabled={!input.trim() || isLoading}
              onClick={() => handleSend(input)}
              className="rounded-full bg-primary hover:bg-primary/90 text-white h-9 w-9 flex-shrink-0 active:scale-95 transition-all shadow-md"
            >
              <Send className="h-4.5 w-4.5" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary via-accent to-secondary text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 duration-200 transition-all relative border border-white/20 group"
      >
        <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75 group-hover:hidden" />
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default Chatbot;
