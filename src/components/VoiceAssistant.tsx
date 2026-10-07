import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Camera, 
  ScanLine, 
  TrendingUp, 
  Home, 
  ArrowLeft, 
  User, 
  CheckCircle2,
  Globe,
  Radio
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { VoiceIntentType, VoiceIntentResult } from '../services/voiceIntentService';

interface VoiceAssistantProps {
  onSelectTab: (tabId: string) => void;
  onGoBack: () => void;
  onOpenProfile: () => void;
  onOpenAdvisor: () => void;
  onTriggerCamera: () => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onSelectTab,
  onGoBack,
  onOpenProfile,
  onOpenAdvisor,
  onTriggerCamera
}) => {
  const { language } = useLanguage();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Tap microphone and speak in Telugu, Hindi, or English');
  const [spokenResponse, setSpokenResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<'te-IN' | 'hi-IN' | 'en-IN'>('te-IN');

  const recognitionRef = useRef<any>(null);

  // Sync initial recognition language with app context
  useEffect(() => {
    if (language.code === 'te') setSelectedVoiceLang('te-IN');
    else if (language.code === 'hi') setSelectedVoiceLang('hi-IN');
    else setSelectedVoiceLang('te-IN'); // Telugu/mixed by default for high farmer prevalence
  }, [language.code]);

  // Clean up speech synthesis & recognition on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string, langName: string = 'Telugu') => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Language code mapping for high-quality Indian regional voices
    if (langName.toLowerCase().includes('telugu') || /[\u0C00-\u0C7F]/.test(text) || text.includes('chestunnanu') || text.includes('chupistunnanu')) {
      utterance.lang = 'te-IN';
    } else if (langName.toLowerCase().includes('hindi') || /[\u0900-\u097F]/.test(text) || text.includes('खोला') || text.includes('दिखा')) {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const executeAction = (intent: VoiceIntentType) => {
    switch (intent) {
      case 'OPEN_CAMERA':
        onSelectTab('diseaseDetection');
        setTimeout(() => {
          onTriggerCamera();
          window.dispatchEvent(new CustomEvent('agrisahay-open-camera'));
        }, 150);
        break;

      case 'OPEN_DISEASE_DETECTION':
        onSelectTab('diseaseDetection');
        break;

      case 'OPEN_MARKET_PRICES':
        onSelectTab('marketplace');
        break;

      case 'OPEN_FARM_DETAILS':
        onOpenProfile();
        break;

      case 'GO_HOME':
        onSelectTab('home');
        break;

      case 'GO_BACK':
        onGoBack();
        break;

      case 'OPEN_PROFILE':
      case 'OPEN_SETTINGS':
        onOpenProfile();
        break;

      case 'OPEN_COMPOST':
        onSelectTab('compost');
        break;

      case 'OPEN_ROTATION':
        onSelectTab('rotation');
        break;

      case 'OPEN_JOURNAL':
        onSelectTab('journal');
        break;

      case 'OPEN_ADVISOR':
        onOpenAdvisor();
        break;

      case 'UNKNOWN':
      default:
        // Do not execute any unsafe action
        break;
    }
  };

  const processTranscript = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    setIsProcessing(true);
    setStatusMessage('Processing your command...');

    try {
      const response = await fetch('/api/voice-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: spokenText,
          languageCode: selectedVoiceLang.split('-')[0]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to parse intent');
      }

      const result: VoiceIntentResult = await response.json();
      setSpokenResponse(result.spokenResponse);
      setStatusMessage(result.intent !== 'UNKNOWN' ? `Executing: ${result.action}` : 'Please clarify your request');

      // Voice response confirmation
      speakText(result.spokenResponse, result.detectedLanguage);

      // Perform the action automatically
      if (result.intent !== 'UNKNOWN') {
        setTimeout(() => {
          executeAction(result.intent);
        }, 800);
      }
    } catch (e) {
      console.error('Voice processing error:', e);
      const fallback = selectedVoiceLang === 'te-IN' 
        ? 'Meeru emi open cheyyalanukuntunnaru?' 
        : selectedVoiceLang === 'hi-IN'
        ? 'आप क्या खोलना चाहते हैं?'
        : "I didn't understand that. Please tell me what you want to open.";
      setSpokenResponse(fallback);
      speakText(fallback, selectedVoiceLang === 'te-IN' ? 'Telugu' : selectedVoiceLang === 'hi-IN' ? 'Hindi' : 'English');
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMessage('Speech recognition not supported in this browser. Try Chrome/Edge or click sample commands below.');
      return;
    }

    stopListening();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedVoiceLang;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('Listening... Speak now');
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);

        // If final result
        if (event.results[0].isFinal) {
          recognition.stop();
          setIsListening(false);
          processTranscript(current);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event?.error);
        setIsListening(false);
        if (event?.error === 'no-speech') {
          setStatusMessage('No speech detected. Tap mic to try again.');
        } else if (event?.error === 'not-allowed') {
          setStatusMessage('Microphone access blocked. Please allow mic permissions in browser.');
        } else {
          setStatusMessage('Tap mic to try speaking again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Recognition start error:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleToggleVoiceAssistant = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => {
        startListening();
      }, 300);
    } else {
      stopListening();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsOpen(false);
    }
  };

  const sampleCommands = [
    { label: 'Camera open cheyyi', sub: 'Telugu / Mixed', intent: 'OPEN_CAMERA' },
    { label: 'Disease detection open cheyyi', sub: 'Telugu / Mixed', intent: 'OPEN_DISEASE_DETECTION' },
    { label: 'Market prices chupinchu', sub: 'Telugu / Mixed', intent: 'OPEN_MARKET_PRICES' },
    { label: 'Na farm details chupinchu', sub: 'Telugu / Mixed', intent: 'OPEN_FARM_DETAILS' },
    { label: 'Home ki vellu', sub: 'Telugu / Mixed', intent: 'GO_HOME' },
    { label: 'मेरी फसल की बीमारी चेक करो', sub: 'Hindi', intent: 'OPEN_DISEASE_DETECTION' },
    { label: 'Open camera', sub: 'English', intent: 'OPEN_CAMERA' },
  ];

  return (
    <>
      {/* Floating Microphone Button on Main UI */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
        <button
          onClick={handleToggleVoiceAssistant}
          className={`relative group flex items-center gap-2.5 px-4 py-3 rounded-full text-white font-black text-xs shadow-2xl transition-all duration-300 cursor-pointer ${
            isListening
              ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 ring-4 ring-rose-400/40 animate-pulse scale-105'
              : isOpen
              ? 'bg-emerald-700 ring-2 ring-emerald-400'
              : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 hover:scale-105 active:scale-95 shadow-emerald-900/30'
          }`}
          title="Voice Assistant (Telugu, Hindi, English)"
          aria-label="Multilingual AI Voice Assistant"
        >
          {/* Animated soundwave ring when listening */}
          {isListening && (
            <span className="absolute -inset-1 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
          )}

          {isListening ? (
            <Radio className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Mic className="w-5 h-5 text-emerald-100 group-hover:scale-110 transition-transform" />
          )}

          <div className="text-left">
            <span className="block text-xs font-black tracking-tight leading-none">
              {isListening ? 'Listening...' : 'Voice Assistant'}
            </span>
            <span className="block text-[10px] font-medium text-emerald-200/90 leading-tight">
              {isListening ? 'మాట్లాడండి / बोलो' : 'Telugu · हिन्दी · Eng'}
            </span>
          </div>
        </button>
      </div>

      {/* Voice Assistant Modal / Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-5 sm:p-7 space-y-5 mb-2 sm:mb-0">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-1.5">
                    <span>AgriSahay Voice Assistant</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Multilingual AI
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Speaks Telugu, Hindi, English & Mixed Commands
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  stopListening();
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Selector for Voice Engine */}
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-200/80 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                Listening Language:
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVoiceLang('te-IN');
                    stopListening();
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedVoiceLang === 'te-IN'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  తెలుగు (Telugu)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVoiceLang('hi-IN');
                    stopListening();
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedVoiceLang === 'hi-IN'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVoiceLang('en-IN');
                    stopListening();
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedVoiceLang === 'en-IN'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Central Animated Mic Orb */}
            <div className="py-4 flex flex-col items-center justify-center space-y-3">
              <button
                type="button"
                onClick={() => {
                  if (isListening) stopListening();
                  else startListening();
                }}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl cursor-pointer ${
                  isListening
                    ? 'bg-gradient-to-br from-rose-500 to-red-600 ring-8 ring-rose-200 scale-110'
                    : isProcessing
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 ring-4 ring-amber-200 animate-pulse'
                    : 'bg-gradient-to-br from-emerald-600 to-green-700 hover:scale-105 active:scale-95'
                }`}
                title={isListening ? 'Click to stop listening' : 'Click to start speaking'}
              >
                {isListening && (
                  <span className="absolute -inset-2 rounded-full bg-rose-400/30 animate-ping pointer-events-none" />
                )}
                {isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>

              <div className="text-center space-y-1 max-w-sm">
                <span className={`text-xs font-extrabold uppercase tracking-wider block ${
                  isListening ? 'text-rose-600 animate-pulse' : isProcessing ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  {isListening ? '🎙️ Listening... మాట్లాడండి' : isProcessing ? '⚡ Analyzing Intent...' : 'Tap Mic to Speak'}
                </span>
                <p className="text-xs text-slate-500 font-medium">
                  {statusMessage}
                </p>
              </div>
            </div>

            {/* Transcript & Response Display Box */}
            {(transcript || spokenResponse) && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 animate-in fade-in">
                {transcript && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Recognized Speech (మీరు చెప్పారు):
                    </span>
                    <p className="text-sm font-bold text-slate-900 leading-snug">
                      "{transcript}"
                    </p>
                  </div>
                )}

                {spokenResponse && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                        Assistant Response:
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-950 leading-relaxed">
                        {spokenResponse}
                      </p>
                    </div>

                    <button
                      onClick={() => speakText(spokenResponse, selectedVoiceLang === 'te-IN' ? 'Telugu' : selectedVoiceLang === 'hi-IN' ? 'Hindi' : 'English')}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-800 transition-colors shrink-0 cursor-pointer"
                      title="Replay Voice"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-700" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Sample Commands for Farmers (Tap to Execute) */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Try Speaking or Tap a Command:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {sampleCommands.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setTranscript(cmd.label);
                      processTranscript(cmd.label);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50 text-slate-800 text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span>{cmd.label}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 font-normal">
                      {cmd.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
