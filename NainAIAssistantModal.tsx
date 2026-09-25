import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  ShoppingBag, 
  IndianRupee, 
  Volume2, 
  Copy, 
  Check, 
  RotateCcw,
  Languages,
  Headphones,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { AIAssistantMessage, AppView } from '../../types';

interface NainAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView?: (view: AppView) => void;
}

const DEFAULT_WELCOME_MESSAGE: AIAssistantMessage = {
  id: 'msg_welcome',
  role: 'assistant',
  content: `**Namaste! Nain Music AI Assistant me aapka swagat hai.** 🎧✨\n\nMain aapka personal 24/7 AI guide hoon. Main **Hindi** (हिंदी / Hinglish) aur **English** dono me baat kar sakta hoon.\n\nAapko kis baare me jankari ya help chahiye?\n• **Music Gigs banana ya packages setup karna**\n• **Order status, Deliveries aur Revisions**\n• **80% Seller Earnings aur Razorpay/UPI/PayPal payments**\n• **1 to 5 Star Reviews aur Seller public responses**\n\nNeeche diye gaye quick topics chunein ya apna sawal type karein!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  source: 'Nain AI Core'
};

const SUGGESTED_QUESTIONS = [
  { label: '🎵 Gig kaise banayein?', query: 'Nain Music par naya music gig kaise banayein aur packages kaise set karein?' },
  { label: '💰 80% Earnings & Payout', query: 'Nain Music me earnings kaise milti hai aur platform fee kitni hai?' },
  { label: '🎧 Mixing vs Mastering Guide', query: 'Mixing aur Mastering me kya difference hai aur buyer ko kya chahiye hota hai?' },
  { label: '💳 UPI & Razorpay Payments', query: 'Payment methods kaunse supported hain? UPI ya Razorpay kaise kaam karta hai?' },
  { label: '⭐ Review & 1-5 Star Ratings', query: 'Order deliver hone ke baad review aur rating kaise kaam karti hai?' },
  { label: '📦 Orders & Delivery Workflow', query: 'Order aane par audio files kaise deliver karein aur revisions kaise handle karein?' },
  { label: '🤝 Human Support / Contact Seller', query: 'Mujhe human customer support ya seller se seedhe baat karni hai' }
];

export const NainAIAssistantModal: React.FC<NainAIAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateView
}) => {
  const { 
    setIsChatOpen, 
    createNewGig, 
    setCurrentGig, 
    gigs, 
    aiAssistantInitialQuery 
  } = useGig();

  const [messages, setMessages] = useState<AIAssistantMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [languagePref, setLanguagePref] = useState<'auto' | 'hi' | 'en'>('auto');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Handle external query trigger
  useEffect(() => {
    if (isOpen && aiAssistantInitialQuery) {
      handleSendMessage(aiAssistantInitialQuery);
    }
  }, [isOpen, aiAssistantInitialQuery]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: AIAssistantMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Call server-side API endpoint
      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            text: m.content
          })),
          languagePreference: languagePref
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const replyContent = data.reply || 'Main abhi aapke sawal ka jawab process kar raha hoon. Kripya thodi der me punah prayas karein.';

      const assistantMessage: AIAssistantMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'Nain AI'
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err: any) {
      console.warn('Network call failed, utilizing built-in bilingual studio intelligence fallback:', err);
      
      // Fallback bilingual answer generator
      const fallbackReply = generateClientFallback(text, languagePref);
      const fallbackMsg: AIAssistantMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Nain AI Studio Core'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateClientFallback = (query: string, lang: 'auto' | 'hi' | 'en'): string => {
    const q = query.toLowerCase();
    const isHindi = lang === 'hi' || (lang === 'auto' && /[अ-ह]|kaise|kya|btao|batao|karna|chahiye|madad|paise|karein|hoga|hogi|bana|suno|karo/i.test(query));

    if (q.includes('gig') || q.includes('banaye') || q.includes('create') || q.includes('package')) {
      if (isHindi) {
        return `🎵 **Nain Music par Gig Kaise Banayein (Full Studio Guide):**\n\n1. **Service Chuniye:** Top navigation me '+ Create Gig' par click karein. Aap Mixing & Mastering, Beat Production, Vocal Tuning, ya Lyric Writing me se select kar sakte hain.\n2. **Packages & Pricing:** 3 levels (Basic, Standard, Premium) banayein. Har package ka INR (₹) price, delivery days, revisions limit aur track count set karein.\n3. **Audio Features:** Stem count, analog summing gear, aur 24-bit 48kHz WAV delivery format specify karein.\n4. **Requirements:** Buyer se kya raw files chahiye (stems, BPM, reference links) mention karein.\n5. **Publish:** 'Publish Gig' par click karte hi aapka music gig public marketplace me live ho jata hai!\n\nKya aap chahte hain ki main abhi naya gig create karne me aapki madad karun?`;
      }
      return `🎵 **How to Create a Gig on Nain Music:**\n\n1. **Select Service:** Click '+ Create Gig' in the top header and choose your audio specialty (e.g. Mixing & Mastering, Beat Production, Vocal Tuning).\n2. **Packages & Rates:** Define Basic, Standard, and Premium tiers with delivery timelines, revisions, and INR (₹) pricing.\n3. **Studio Deliverables:** Specify 24-bit lossless WAV format, stems count, and analog hybrid gear.\n4. **Buyer Instructions:** Outline stem requirements (BPM, sample rate, dry/wet vocals).\n5. **Publish:** Click Publish to make your Gig live for discoverability and checkout!\n\nWould you like to start building a gig right now?`;
    }

    if (q.includes('earning') || q.includes('paise') || q.includes('fee') || q.includes('payout') || q.includes('percent')) {
      if (isHindi) {
        return `💰 **Earnings aur Payouts ki Puri Jankari:**\n\n• **80% Seller Net Share:** Nain Music par aap jo bhi order complete karte hain, uska seedha **80% hissa** aapke bank/wallet me credit hota hai.\n• **20% Platform Fee:** 20% transparent platform fee hai jisme payment processing, fraud security, hosting aur buyer marketing shamil hai.\n• **Base Currency INR (₹):** Saare orders standard INR me process hote hain, aur foreign buyers ke liye real-time currency conversion automatically hota hai.\n• Header me 'Earnings (80%)' par click karke aap apna total revenue, clearing balance, aur withdrawal status dekh sakte hain!`;
      }
      return `💰 **Marketplace Economics & Earnings:**\n\n• **80% Seller Earnings:** You keep a direct **80% net share** on every completed order.\n• **20% Transparent Platform Fee:** Covers escrow security, server infrastructure, and client acquisition.\n• **Base Currency INR (₹):** All core accounting is anchored in INR with real-time conversion for foreign clients.\n• Click 'Earnings (80%)' in the top bar to inspect your withdrawal wallet and revenue breakdown!`;
    }

    if (q.includes('payment') || q.includes('razorpay') || q.includes('paypal') || q.includes('upi')) {
      if (isHindi) {
        return `💳 **Payment Gateway & Security:**\n\n• **Indian Payments:** Razorpay integration ke zariye **UPI (Google Pay, PhonePe, Paytm, BHIM)**, Credit/Debit cards, aur NetBanking se payment instantly hoti hai.\n• **International Payments:** Global clients ke liye **PayPal** aur International credit cards support hain.\n• **Escrow Protection:** Payment tab tak Nain Escrow me surakshit rehti hai jab tak seller final WAV files deliver na kar de aur buyer unhe verify na kar le.`;
      }
      return `💳 **Secure Payment Methods:**\n\n• **Domestic (India):** Instant checkout via Razorpay supporting UPI (GPay, PhonePe, Paytm), Debit/Credit cards, and NetBanking.\n• **Global:** PayPal and International cards with live FX exchange conversion.\n• **Escrow Protection:** Funds are held securely in studio escrow until deliverable approval.`;
    }

    if (q.includes('review') || q.includes('star') || q.includes('rating')) {
      if (isHindi) {
        return `⭐ **Reviews & 1 to 5 Star Rating System:**\n\n• Order complete hone ke baad Buyer ko 1 se 5 stars tak rate karne ka vikalp milta hai.\n• **Empty Initial State:** Stars pehle se bhare hue nahi hote, buyer apni pasand se 1, 2, 3, 4, ya 5 stars click kar sakta hai.\n• **3-Criteria Breakdown:** Communication, Service as Described, aur Quality of Delivery.\n• **Seller Reply:** Review aane ke baad seller official text response submit kar sakta hai jo marketplace par publicly visible rehta hai.`;
      }
      return `⭐ **Review & Star Ratings:**\n\n• Buyers rate orders from 1 to 5 stars upon project completion.\n• The stars start unfilled so buyers can deliberately choose their exact rating.\n• Features a 3-Criteria Evaluation: Communication, Service as Described, and Delivery Quality.\n• Sellers have full capability to submit an official public reply!`;
    }

    if (q.includes('human') || q.includes('contact') || q.includes('support') || q.includes('seller') || q.includes('baat')) {
      if (isHindi) {
        return `🤝 **Human Support & Direct Seller Chat:**\n\nAap kisi bhi samay hamare official support team ya studio seller se seedhe connect ho sakte hain:\n• Top bar me **'Messages'** par click karke aap seller ke sath 1-to-1 private chat khol sakte hain aur custom offer mang sakte hain.\n• Yadi koi technical samasya hai, toh aap hume support ticket bhej sakte hain. Hum 2 ghante ke andar reply karte hain!`;
      }
      return `🤝 **Human Support & Direct Messaging:**\n\nYou can reach a human representative or studio seller directly:\n• Click **'Messages'** in the top navigation to start a 1-to-1 private chat with any buyer or seller.\n• You can request custom studio offers or negotiate stem deliverables in real-time!`;
    }

    if (isHindi) {
      return `Main aapka sawal samajh gaya hoon! 🎧\n\nNain Music studio platform par aap music production gigs create kar sakte hain, audio stems deliver kar sakte hain, 80% net earnings kama sakte hain, aur buyers ke sath secure private chat kar sakte hain.\n\nAapko specific kisme guide chahiye? Kripya batayein ya upar diye gaye options me se chunein!`;
    }

    return `I am here to assist you with every aspect of the Nain Music platform! 🎧\n\nWhether you need help launching a gig, understanding 80% earnings, reviewing orders, or configuring audio stem formats, feel free to ask your specific question in Hindi or English!`;
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
  };

  // Helper to format assistant message text into structured bold and bullets
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Bold formatting **text**
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const renderedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span className="text-slate-800">{renderedLine}</span>
              </div>
            );
          }

          if (/^\d+\./.test(line.trim())) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 font-medium">
                <span className="text-amber-600 font-bold shrink-0">{line.trim().split('.')[0]}.</span>
                <span className="text-slate-800">{renderedLine}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-slate-800">
              {renderedLine}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[720px] transition-all">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white border-b border-slate-800 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                <Bot className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Online" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                  Nain AI Assistant
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Help & Support
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                24/7 First Response • Hindi & English Fluent
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            
            {/* Language Selector Toggle */}
            <div className="hidden sm:flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setLanguagePref('auto')}
                className={`px-2 py-1 rounded-lg transition font-medium ${
                  languagePref === 'auto' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Auto-detect Hindi or English"
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setLanguagePref('hi')}
                className={`px-2 py-1 rounded-lg transition font-medium ${
                  languagePref === 'hi' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Reply in Hindi / Hinglish"
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLanguagePref('en')}
                className={`px-2 py-1 rounded-lg transition font-medium ${
                  languagePref === 'en' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Reply in English"
              >
                English
              </button>
            </div>

            {/* Reset button */}
            <button
              type="button"
              onClick={handleResetChat}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close support assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Language Toggle row */}
        <div className="sm:hidden flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs">
          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
            <Languages className="w-3.5 h-3.5 text-amber-600" />
            Bhasha / Language:
          </span>
          <div className="flex items-center gap-1">
            {(['auto', 'hi', 'en'] as const).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguagePref(l)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                  languagePref === l ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {l === 'auto' ? 'Auto' : l === 'hi' ? 'हिंदी' : 'Eng'}
              </button>
            ))}
          </div>
        </div>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60">
          {messages.map((msg) => {
            const isAI = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 shadow-2xs space-y-2 ${
                  isAI
                    ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                    : 'bg-amber-500 text-slate-950 font-medium rounded-tr-sm shadow-xs'
                }`}>
                  
                  {/* Sender metadata */}
                  <div className="flex items-center justify-between gap-2 text-[10px] pb-1 border-b border-slate-100">
                    <span className={`font-bold flex items-center gap-1 ${isAI ? 'text-amber-700' : 'text-slate-950'}`}>
                      {isAI ? 'Nain AI Support' : 'Aap (You)'}
                      {isAI && <Sparkles className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={isAI ? 'text-slate-400' : 'text-slate-900/70 font-medium'}>
                        {msg.timestamp}
                      </span>
                      {isAI && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="text-slate-400 hover:text-slate-700 transition"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div>
                    {isAI ? (
                      renderMessageContent(msg.content)
                    ) : (
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {msg.content}
                      </p>
                    )}
                  </div>

                  {/* Action Shortcuts for common topics */}
                  {isAI && (msg.content.includes('Gig') || msg.content.includes('Order') || msg.content.includes('Messages')) && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      {msg.content.includes('Gig') && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            createNewGig('mixing-mastering');
                            if (onNavigateView) onNavigateView('builder');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Plus className="w-3 h-3 text-amber-600" />
                          Open Gig Builder
                        </button>
                      )}

                      {msg.content.includes('Order') && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onNavigateView) onNavigateView('order_workspace');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <ShoppingBag className="w-3 h-3 text-slate-600" />
                          Go to Orders
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          setIsChatOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        Human Support / Chat
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Typing animation when AI is thinking */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-2xs flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Nain AI is typing...</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 sm:p-2.5 bg-white border-t border-slate-200 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 min-w-max">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 mr-1">
              Suggestions:
            </span>
            {SUGGESTED_QUESTIONS.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(sug.query)}
                className="px-2.5 py-1 rounded-xl text-xs bg-slate-100 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-300 border border-slate-200 text-slate-700 transition font-medium whitespace-nowrap active:scale-95 cursor-pointer"
              >
                {sug.label}
              </button>
            ))}
          </div>
        </div>

        {/* User Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Apna sawal poochhein (Hindi ya English me)..."
              disabled={isLoading}
              className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition"
            />
            {inputText.trim() && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-2xl flex items-center justify-center transition shadow-xs cursor-pointer ${
              inputText.trim() && !isLoading
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Footer reassurance */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Nain Music Verified AI Support Assistant
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              setIsChatOpen(true);
            }}
            className="text-amber-600 hover:text-amber-700 font-semibold underline"
          >
            Need Human Support?
          </button>
        </div>

      </div>
    </div>
  );
};
