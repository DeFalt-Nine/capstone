
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { askLaTrinidadGuide } from '../services/laTrinidadAiService';
import { analyzeIntent } from '../services/intentService';
import { logChatInteraction } from '../services/apiService';
import type { ChatMessage } from '../types';
import { MessageAuthor } from '../types';

const SUGGESTIONS = [
  "Strawberry Picking? 🍓",
  "One Day Itinerary 🗓️",
  "Entrance Fees? 💰",
  "Hiking Trails ⛰️",
  "Where to eat? 🍴"
];

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { author: MessageAuthor.BOT, text: "Hello! I'm your La Trinidad guide. I can help with directions, pricing, or planning your day! 🍓" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (textToSend.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { author: MessageAuthor.USER, text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Easter Egg
    if (textToSend.toLowerCase().includes('james yuri avila')) {
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                author: MessageAuthor.BOT, 
                text: "Ah, the lead developer! The guy behind the code. 😎",
                image: "https://i.imgur.com/fzRsKZo.jpeg" 
            }]);
            setIsLoading(false);
        }, 600);
        return;
    }

    const instantReply = analyzeIntent(textToSend);
    if (instantReply) {
        setTimeout(() => {
            setMessages(prev => [...prev, { author: MessageAuthor.BOT, text: instantReply }]);
            setIsLoading(false);
            logChatInteraction(textToSend, instantReply, true);
        }, 500);
        return;
    }
    
    const botMessagePlaceholder: ChatMessage = { author: MessageAuthor.BOT, text: '' };
    setMessages(prev => [...prev, botMessagePlaceholder]);

    try {
      await askLaTrinidadGuide(textToSend, (chunk) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessageIndex = newMessages.length - 1;
          newMessages[lastMessageIndex] = {
            ...newMessages[lastMessageIndex],
            text: newMessages[lastMessageIndex].text + chunk
          };
          return newMessages;
        });
      });
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessageIndex = newMessages.length - 1;
        newMessages[lastMessageIndex] = {
            ...newMessages[lastMessageIndex],
            text: newMessages[lastMessageIndex].text + "\n\n(I'm having trouble reaching the server.)"
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlaceLink = (name: string) => {
      setIsOpen(false); 
      navigate(`/tourist-spots?spot=${encodeURIComponent(name)}`);
  };

  const formatMessage = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      if (line.trim() === '') return <br key={lineIndex} />;

      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|\[\[.*?\]\])/g);

      return (
        <div key={lineIndex} className="min-h-[1.2em]">
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={partIndex} className="font-bold text-lt-red">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={partIndex} className="italic">{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('[[') && part.endsWith(']]')) {
              const spotName = part.slice(2, -2);
              return (
                <button 
                  key={partIndex}
                  onClick={() => handlePlaceLink(spotName)}
                  className="inline-flex items-center gap-1 bg-lt-blue/10 text-lt-blue hover:bg-lt-blue hover:text-white px-2 py-0.5 rounded-md font-bold text-[13px] transition-all border border-lt-blue/20 mx-0.5 align-middle group shadow-sm"
                >
                  <i className="fas fa-map-marker-alt text-[10px] opacity-70 group-hover:scale-110 transition-transform"></i>
                  {spotName}
                </button>
              );
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-lt-yellow text-slate-900 rounded-full w-16 h-16 flex items-center justify-center shadow-lg shadow-lt-yellow/40 hover:bg-lt-orange hover:text-white transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-lt-orange z-50"
        aria-label="Open chatbot"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-comment-dots'} text-2xl transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}></i>
      </button>

      <div className={`fixed bottom-24 right-6 w-[calc(100%-3rem)] max-w-sm h-[60vh] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 z-50 border border-slate-200 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="bg-gradient-to-r from-lt-orange to-lt-yellow text-slate-900 p-4 rounded-t-2xl flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center border border-white/20 shadow-inner"><i className="fas fa-robot text-slate-800"></i></div>
             <div><h3 className="font-bold text-lg leading-none">Ask Guide</h3><span className="text-[10px] font-semibold opacity-70">La Trinidad Assistant</span></div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><i className="fas fa-times"></i></button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 custom-scrollbar">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'}`}>
                {msg.author === MessageAuthor.BOT && <div className="w-8 h-8 rounded-full bg-lt-blue text-white flex items-center justify-center flex-shrink-0 border border-lt-blue/50"><i className="fas fa-mountain"></i></div>}
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl shadow-sm ${msg.author === MessageAuthor.USER ? 'bg-lt-yellow text-slate-900 rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'}`}>
                  <div className="text-sm leading-relaxed">
                    {msg.author === MessageAuthor.BOT ? formatMessage(msg.text) : msg.text}
                    {msg.image && <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 shadow-md"><img src={msg.image} alt="" className="w-full h-auto object-cover" /></div>}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="border-t border-slate-200 bg-white rounded-b-2xl">
          <div className="px-4 pt-3 pb-1 flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
            {SUGGESTIONS.map((chip, index) => (
                <button key={index} onClick={() => handleSend(chip)} disabled={isLoading} className="flex-shrink-0 bg-slate-100 hover:bg-lt-orange/10 hover:text-lt-orange text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-200 transition-colors whitespace-nowrap active:scale-95">{chip}</button>
            ))}
          </div>
          <div className="p-4 pt-2">
            <div className="flex items-center space-x-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type your question..." className="flex-1 px-4 py-2 bg-slate-100 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-lt-yellow text-slate-800 text-sm" disabled={isLoading} />
                <button onClick={() => handleSend()} disabled={isLoading} className="bg-lt-yellow text-slate-900 rounded-full w-10 h-10 flex items-center justify-center hover:bg-lt-orange hover:text-white disabled:bg-slate-300 transition-colors shadow-md active:scale-90"><i className="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
