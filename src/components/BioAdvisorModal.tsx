import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  MessageSquare,
  Bot
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BioAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BioAdvisorModal: React.FC<BioAdvisorModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || question;
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);
    stopAudio();

    try {
      const response = await fetch('/api/farm-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          languageCode: language.code
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get advisory answer');
      }

      const res = await response.json();
      setAnswer(res.answer);
    } catch (err: any) {
      setError(err?.message || 'Error communicating with advisory service');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        pa: 'pa-IN'
      };
      recognition.lang = langMap[language.code] || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuestion(transcript);
          handleAsk(transcript);
        }
      };
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const toggleAudio = () => {
    if (!answer) return;
    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(answer);
    const langMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      pa: 'pa-IN'
    };
    utterance.lang = langMap[language.code] || 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Bio-Agronomy Advisor</h3>
              <p className="text-[11px] text-slate-400">Ask any organic farming or pest remedy question</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Answer Box */}
        {answer && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Agronomist Advisory
              </span>
              <button
                onClick={toggleAudio}
                className="p-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                title={isPlayingAudio ? 'Stop speech' : 'Listen speech'}
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4 text-emerald-700" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {answer}
            </p>
          </div>
        )}

        {/* Input */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How to prepare 10% Dashaparni ark for sucking pests on cotton?"
              className="w-full p-3 pr-12 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
            <button
              onClick={toggleMic}
              type="button"
              className={`absolute right-3 bottom-3 p-2 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-white text-slate-600 hover:text-emerald-700 border-slate-200'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400">
              Speak or type in your regional language.
            </span>
            <button
              onClick={() => handleAsk()}
              disabled={isLoading || !question.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Ask Advisor</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            {error}
          </div>
        )}

      </div>
    </div>
  );
};
