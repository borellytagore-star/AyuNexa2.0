import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AIChatMessage } from '../../types';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldAlert,
  PhoneCall,
  UserCheck,
  RotateCcw,
  AlertTriangle,
  Pill,
  Package,
  HeartPulse,
} from 'lucide-react';

export const MediAssistant: React.FC = () => {
  const {
    patient,
    caregiver,
    dosesToday,
    medicines,
    takeDose,
    triggerSOS,
    speakText,
    isAssistedMode,
  } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello ${patient.name.split(' ')[0]}! I am AyuNexa AI, your connected health assistant. You can speak to me or tap any quick action below. How can I assist you right now?`,
      timestamp: 'Just now',
    },
  ]);

  // Structured health check triage state
  const [triageStep, setTriageStep] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Audio wave pulse animation simulation
  const [waveHeight, setWaveHeight] = useState([12, 24, 16, 32, 20]);
  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(() => {
      setWaveHeight([
        Math.floor(Math.random() * 28) + 8,
        Math.floor(Math.random() * 36) + 12,
        Math.floor(Math.random() * 30) + 10,
        Math.floor(Math.random() * 40) + 14,
        Math.floor(Math.random() * 26) + 8,
      ]);
    }, 120);
    return () => clearInterval(interval);
  }, [isListening]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Process intelligence & Safety Controller logic
    setTimeout(() => {
      processAssistantResponse(textToSend.toLowerCase());
    }, 600);
  };

  const processAssistantResponse = (query: string) => {
    let responseText = '';
    let safetyLevel: 'LOW' | 'ATTENTION' | 'EMERGENCY' = 'LOW';
    let actions: AIChatMessage['actionSuggestions'] = undefined;

    // 1. DIZZINESS / SYMPTOM ESCALATION TRIAGE (PRD §19, §20, §54)
    if (query.includes('dizzy') || query.includes('dizziness') || query.includes('not feel well') || query.includes('unwell')) {
      setTriageStep(1);
      responseText = "I'm sorry you're feeling unwell, Ravi. When did the dizziness begin?";
      safetyLevel = 'ATTENTION';
      actions = [
        { label: 'Just now', actionType: 'QUICK_REPLY', payload: 'Just now' },
        { label: 'A few hours ago', actionType: 'QUICK_REPLY', payload: 'A few hours ago' },
        { label: 'Since yesterday', actionType: 'QUICK_REPLY', payload: 'Since yesterday' },
        { label: "I'm not sure", actionType: 'QUICK_REPLY', payload: 'Not sure' },
      ];
    } else if (triageStep === 1) {
      setTriageStep(2);
      responseText = "Understood. Are you experiencing any chest pressure, shortness of breath, or numbness in your arms?";
      safetyLevel = 'ATTENTION';
      actions = [
        { label: 'No, just lightheaded', actionType: 'QUICK_REPLY', payload: 'No, just lightheaded' },
        { label: 'Yes, feeling chest tightness', actionType: 'QUICK_REPLY', payload: 'Yes, feeling chest tightness' },
      ];
    } else if (triageStep === 2) {
      if (query.includes('chest') || query.includes('tightness') || query.includes('yes') || query.includes('breath')) {
        // Severe Escalation -> Emergency Mode
        setTriageStep(0);
        responseText = "⚠️ EMERGENCY WARNING: Chest tightness and acute dizziness require immediate emergency attention. Please stay seated and seek help.";
        safetyLevel = 'EMERGENCY';
        actions = [
          { label: '🚨 CALL EMERGENCY (112)', actionType: 'CALL_SOS' },
          { label: `📞 Alert ${caregiver.name} (Son)`, actionType: 'CONTACT_CAREGIVER' },
        ];
      } else {
        // Moderate Attention -> Recommend caregiver
        setTriageStep(0);
        responseText = `Thank you for clarifying. Your symptoms look like mild orthostatic lightheadedness. It is recommended to sit down, drink a glass of water, and inform ${caregiver.name}.`;
        safetyLevel = 'ATTENTION';
        actions = [
          { label: `📞 Contact ${caregiver.name}`, actionType: 'CONTACT_CAREGIVER' },
          { label: '✓ I am sitting & resting', actionType: 'QUICK_REPLY', payload: 'I am resting now' },
        ];
      }
    } else if (query.includes('medicine now') || query.includes('what medicine') || query.includes('take now')) {
      const pending = dosesToday.find((d) => d.status === 'SCHEDULED' || d.status === 'REMINDER_SENT');
      if (pending) {
        responseText = `You have one medicine scheduled now: ${pending.medicineName}, ${pending.doseQuantity} ${pending.unit} scheduled for ${pending.scheduledTime}. Have you taken this?`;
        actions = [
          { label: 'Yes, I took it', actionType: 'QUICK_REPLY', payload: 'I took it' },
          { label: 'Remind me after 10 mins', actionType: 'QUICK_REPLY', payload: 'Remind me in 10 minutes' },
        ];
      } else {
        responseText = 'You have already taken all scheduled medicines for this time. Your next dose is Atorvastatin 20 mg at 9:00 PM.';
      }
    } else if (query.includes('i took it') || query.includes('taken')) {
      const pending = dosesToday.find((d) => d.status === 'SCHEDULED' || d.status === 'REMINDER_SENT');
      if (pending) {
        takeDose(pending.id);
        responseText = `Great! I have recorded your ${pending.medicineName} as taken and updated your pill inventory.`;
      } else {
        responseText = 'All set! All your doses are currently marked as taken.';
      }
    } else if (query.includes('stock') || query.includes('run out') || query.includes('how much left')) {
      const lowStockMed = medicines.find((m) => m.currentStock <= m.reorderThreshold);
      if (lowStockMed) {
        responseText = `Attention: ${lowStockMed.name} has only ${lowStockMed.currentStock} ${lowStockMed.unit} remaining (~2 days supply). Would you like me to open the pharmacy refill finder?`;
        actions = [
          { label: '📦 Find Pharmacies for Refill', actionType: 'SCHEDULE_REFILL', payload: lowStockMed.id },
        ];
      } else {
        responseText = 'All your medications have healthy stock levels. Amlodipine has 18 tablets (~9 days) and Atorvastatin has 22 tablets (~22 days).';
      }
    } else if (query.includes('emergency') || query.includes('help') || query.includes('sos')) {
      responseText = 'Activating emergency mode right now.';
      safetyLevel = 'EMERGENCY';
      triggerSOS();
      return;
    } else {
      responseText = `I hear you, Ravi. I am tracking your daily schedule, medicine inventory, and emergency caregiver links. You can ask me: “What medicine do I take now?”, “How is my stock?”, or tell me how you are feeling.`;
    }

    const assistantMsg: AIChatMessage = {
      id: `asst-${Date.now()}`,
      sender: safetyLevel === 'EMERGENCY' ? 'safety_controller' : 'assistant',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      safetyLevel,
      actionSuggestions: actions,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    speakText(responseText);
  };

  const handleVoiceToggle = () => {
    if (!isListening) {
      setIsListening(true);
      speakText('Listening... Tell me what you need, Ravi.');

      // Check if browser SpeechRecognition is available
      type SpeechRecognitionType = new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: (e: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: SpeechRecognitionType; webkitSpeechRecognition?: SpeechRecognitionType }).SpeechRecognition ||
        (window as unknown as { SpeechRecognition?: SpeechRecognitionType; webkitSpeechRecognition?: SpeechRecognitionType }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.lang = 'en-US';
          recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setIsListening(false);
            handleSendMessage(transcript);
          };
          recognition.onerror = () => setIsListening(false);
          recognition.onend = () => setIsListening(false);
          recognition.start();
        } catch {
          // Fallback simulation after 3.5s
          simulateVoiceInput();
        }
      } else {
        simulateVoiceInput();
      }
    } else {
      setIsListening(false);
    }
  };

  const simulateVoiceInput = () => {
    setTimeout(() => {
      setIsListening(false);
      handleSendMessage('What medicine do I take now?');
    }, 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[75vh] max-h-[700px]">
      {/* Top Assistant Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-blue-800 text-white p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white">AyuNexa AI</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                Active
              </span>
            </div>
            <p className="text-xs text-indigo-200">
              Wake phrase: <strong className="text-white">“Hey AyuNexa”</strong> • Safety Controller Active
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'msg-welcome',
                sender: 'assistant',
                text: `Hello ${patient.name.split(' ')[0]}! How can I help with your medicines or health?`,
                timestamp: 'Just now',
              },
            ]);
            setTriageStep(0);
          }}
          className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Voice Listening Waveform Display */}
      {isListening && (
        <div className="bg-indigo-50 border-b border-indigo-200 p-3 flex items-center justify-center gap-3 animate-in fade-in">
          <span className="text-xs font-bold text-indigo-900 animate-pulse">
            🎙️ AyuNexa AI is listening to your voice...
          </span>
          <div className="flex items-center gap-1">
            {waveHeight.map((h, i) => (
              <div
                key={i}
                className="w-1 bg-indigo-600 rounded-full transition-all duration-100"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isEmergency = msg.safetyLevel === 'EMERGENCY';
          const isAttention = msg.safetyLevel === 'ATTENTION';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-sm font-medium shadow-xs transition-all ${
                  isUser
                    ? 'bg-teal-700 text-white rounded-br-xs'
                    : isEmergency
                    ? 'bg-rose-600 text-white border-2 border-rose-300 rounded-bl-xs font-bold'
                    : isAttention
                    ? 'bg-amber-50 text-amber-950 border border-amber-300 rounded-bl-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                } ${isAssistedMode ? 'text-base sm:text-lg' : 'text-sm'}`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-1 opacity-75">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isEmergency ? 'SAFETY CONTROLLER' : 'AyuNexa AI'}</span>
                  </div>
                )}
                <p className="leading-relaxed">{msg.text}</p>
              </div>

              {/* Action Suggestion Chips (PRD §18, §20) */}
              {msg.actionSuggestions && msg.actionSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 max-w-[85%]">
                  {msg.actionSuggestions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (action.actionType === 'CALL_SOS') {
                          triggerSOS();
                        } else if (action.actionType === 'CONTACT_CAREGIVER') {
                          speakText(`Connecting to ${caregiver.name} at ${caregiver.phone}`);
                          window.location.href = `tel:${caregiver.phone}`;
                        } else if (action.actionType === 'QUICK_REPLY' && action.payload) {
                          handleSendMessage(action.payload);
                        } else if (action.actionType === 'SCHEDULE_REFILL') {
                          handleSendMessage('Order refill now');
                        }
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        action.actionType === 'CALL_SOS'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-sm'
                          : action.actionType === 'CONTACT_CAREGIVER'
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-sm'
                          : 'bg-white hover:bg-teal-50 text-teal-900 border-teal-300 shadow-xs'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-slate-400 px-1">{msg.timestamp}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* QUICK ACTIONS CHIPS BAR (PRD §18) */}
      <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap">
        {[
          { label: '💊 Medicine now', query: 'What medicine do I take now?' },
          { label: '📦 My stock', query: 'How much medicine do I have left?' },
          { label: '❤️ I feel dizzy', query: 'I am feeling dizzy.' },
          { label: '🕐 Remind me', query: 'Remind me after 15 minutes' },
          { label: `👨‍👩‍👧 Contact ${caregiver.name}`, query: `Please contact my caregiver ${caregiver.name}` },
        ].map((chip) => (
          <button
            key={chip.label}
            onClick={() => handleSendMessage(chip.query)}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 font-semibold border border-slate-200 transition-colors shrink-0"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* INPUT & MICROPHONE CONTROLS */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2">
        {/* Voice push-to-talk button */}
        <button
          onClick={handleVoiceToggle}
          title={isListening ? 'Stop listening' : 'Push to talk with AyuNexa AI'}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
              : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          placeholder="Ask AyuNexa AI anything or describe how you feel..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
          className="flex-1 p-3 rounded-2xl bg-slate-100 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        {/* Send button */}
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim()}
          className="p-3 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-30 text-white transition-all cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
