import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getChatHealth } from '../services/api';
import { Bot, Send, X, ExternalLink, HelpCircle, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What is Ayushman Bharat PM-JAY eligibility?',
  'What health insurance schemes are available in Tamil Nadu?',
  'What documents are required to apply for CMCHIS?',
  'How do I apply for MEDISEP?'
];

const FloatingChatWidget = ({ forceOpen = false, onCloseForce }) => {
  const [isOpen, setIsOpen] = useState(forceOpen);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Namaste! I am KAAPAN AI Assistant — Your Guide to Government Health Benefits. Ask me about government health schemes, eligibility criteria, benefits, or required documents.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    getChatHealth()
      .then((data) => setServiceStatus(data))
      .catch(() => setServiceStatus({ status: 'offline' }));
  }, []);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isSending) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setIsSending(true);

    try {
      const response = await sendChatMessage(textToSend.trim(), conversationId);

      if (response.conversationId || response.conversation_id) {
        setConversationId(response.conversationId || response.conversation_id);
      }

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.answer || 'Information retrieved.',
        decision: response.decision,
        intent: response.intent,
        sources: response.sources || [],
        handoff: response.handoff,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'I couldn\'t complete that request right now. Please check if the KAAPAN microservice is online and try again.',
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const toggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (!nextState && onCloseForce) {
      onCloseForce();
    }
  };

  return (
    <>
      {/* Floating Action Launcher Button (Visible when closed) */}
      {!isOpen && (
        <button
          id="floating-chat-trigger"
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#0F4C5C] hover:bg-[#0B3C49] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-teal-300 border border-teal-400/30 group cursor-pointer"
          aria-label="Open KAAPAN AI Assistant"
        >
          <Bot className="w-7 h-7 text-teal-200 group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
        </button>
      )}

      {/* Floating Chat Overlay Window */}
      {isOpen && (
        <div
          id="floating-chat-window"
          className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] h-[92vh] sm:h-[620px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
        >
          {/* Header */}
          <div className="bg-[#0B2545] text-white p-4 border-b border-slate-800 flex items-center justify-between select-none">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-[#126E82] text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border border-teal-400/20">
                <Bot className="w-5 h-5 text-teal-200" />
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight text-white flex items-center gap-1.5">
                  <span>KAAPAN AI Assistant</span>
                  <span className="text-[10px] bg-teal-950/80 text-teal-300 border border-teal-800 px-1.5 py-0.2 rounded font-mono">
                    AI Guided
                  </span>
                </h2>
                <span className="text-[11px] text-teal-300/90 font-medium block">
                  Your Guide to Government Health Benefits
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-right mr-1">
                {serviceStatus?.status === 'ok' ? (
                  <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span>Online</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-[10px] text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    <span>Ready</span>
                  </span>
                )}
              </div>
              <button
                onClick={toggleOpen}
                className="w-7 h-7 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg flex items-center justify-center text-base transition cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-2xs text-xs sm:text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#0F4C5C] text-white rounded-br-none'
                      : msg.isError
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-none'
                      : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-none'
                  }`}
                >
                  {/* Intent & Decision Badges */}
                  {msg.sender === 'assistant' && (msg.intent || msg.decision) && (
                    <div className="flex items-center space-x-1.5 mb-2 pb-1.5 border-b border-slate-100">
                      {msg.intent && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          INTENT: {msg.intent}
                        </span>
                      )}
                      {msg.decision && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                          {msg.decision}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                  {/* Sources / Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 space-y-1.5">
                      <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">
                        Verified Sources:
                      </span>
                      <ul className="space-y-1">
                        {msg.sources.map((src, i) => (
                          <li key={i} className="flex items-center justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
                            <span className="font-semibold text-slate-800 truncate max-w-[200px]">• {src.schemeName}</span>
                            {src.sourceUrl && (
                              <a
                                href={src.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-0.5 ml-1 flex-shrink-0"
                              >
                                <span>Source</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Handoff Notice */}
                  {msg.handoff && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200/90 rounded-xl text-amber-900 text-[11px] space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                        <UserCheck className="w-4 h-4 text-amber-700" />
                        <span>Human Assistance Recommended</span>
                      </div>
                      <p className="text-amber-800/90 leading-relaxed">{msg.handoff.reason}</p>
                    </div>
                  )}

                  <span
                    className={`text-[9px] block mt-1.5 text-right ${
                      msg.sender === 'user' ? 'text-teal-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex items-start space-x-2">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-2xs text-xs text-slate-600 flex items-center space-x-2.5">
                  <div className="w-4 h-4 border-2 border-[#0F4C5C] border-t-transparent rounded-full animate-spin" />
                  <span>Searching government scheme knowledge...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="p-3 bg-slate-100/80 border-t border-slate-200 flex flex-wrap gap-1.5 text-[11px]">
              <span className="w-full text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                Suggested Questions:
              </span>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="bg-white text-slate-700 hover:bg-[#0F4C5C] hover:text-white border border-slate-200/90 px-2.5 py-1 rounded-full transition-colors text-left font-medium cursor-pointer shadow-2xs"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask about schemes, eligibility, documents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="px-3.5 py-2.5 bg-[#0F4C5C] hover:bg-[#0B3C49] text-white font-medium text-xs sm:text-sm rounded-xl transition disabled:opacity-50 flex items-center space-x-1 cursor-pointer shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget;
