import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getChatHealth } from '../services/api';
import MainLayout from '../layouts/MainLayout';

const SUGGESTED_QUESTIONS = [
  'What is Ayushman Bharat PM-JAY eligibility?',
  'Are senior citizens aged 70+ covered under PM-JAY?',
  'What documents are required to apply for health insurance schemes?',
  'Can I talk to a human customer care executive?'
];

const ChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Namaste! I am SwasthyaSetu AI Assistant. Ask me anything about government health insurance schemes, eligibility criteria, benefits, or required documents.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.answer || 'Response received.',
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
          text: 'I apologize, but I encountered a communication error with the RAG microservice. Please check if the Node.js server is online.',
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
              🤖
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">SwasthyaSetu AI Assistant</h1>
              <span className="text-[11px] text-emerald-400 font-medium">
                Grounded RAG Engine (E5 + pgvector + Groq)
              </span>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[10px] uppercase">RAG Microservice</span>
            {serviceStatus?.status === 'ok' ? (
              <span className="inline-flex items-center space-x-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>Online</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 text-amber-400 font-bold">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                <span>Standby / Connecting</span>
              </span>
            )}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm text-sm ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : msg.isError
                    ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-none'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                }`}
              >
                {/* Intent / Decision Badge */}
                {msg.sender === 'assistant' && (msg.intent || msg.decision) && (
                  <div className="flex items-center space-x-2 mb-2 pb-1 border-b border-slate-100">
                    {msg.intent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        INTENT: {msg.intent}
                      </span>
                    )}
                    {msg.decision && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {msg.decision}
                      </span>
                    )}
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                {/* Citations / Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <span className="font-semibold text-[11px] text-slate-500 block">
                      Retrieved Sources:
                    </span>
                    <ul className="space-y-1">
                      {msg.sources.map((src, i) => (
                        <li key={i} className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-slate-800">• {src.schemeName}</span>
                          {src.sourceUrl && (
                            <a
                              href={src.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:underline ml-2"
                            >
                              Link ↗
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Handoff Notice */}
                {msg.handoff && (
                  <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                    <strong>Human Handoff Created:</strong> {msg.handoff.reason}
                  </div>
                )}

                <span
                  className={`text-[10px] block mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-start space-x-2">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm text-sm text-slate-500 flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Retrieving knowledge base & generating answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 2 && (
          <div className="p-3 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-2 text-xs">
            <span className="text-slate-500 font-semibold self-center mr-1">Suggested:</span>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-xs transition shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center space-x-3"
        >
          <input
            type="text"
            placeholder="Type your question about government health schemes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center space-x-1"
          >
            <span>Send</span>
            <span>→</span>
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default ChatAssistant;
