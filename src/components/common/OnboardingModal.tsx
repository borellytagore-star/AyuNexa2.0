import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  Pill,
  HeartHandshake,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: 'Welcome to AyuNexa',
      subtitle: 'Connected Care. Smarter Health.',
      icon: Pill,
      badge: 'Official Tagline',
      description:
        'A calm, trustworthy companion designed for elderly users and young caregivers alike. No complex medical jargon.',
      bgColor: 'from-teal-600 to-cyan-700',
    },
    {
      step: 2,
      title: 'Never Miss Your Medicine',
      subtitle: 'Instant 3-second comprehension.',
      icon: CheckCircle2,
      badge: 'Simple by Default',
      description:
        'Large, crystal-clear reminders. Tap "Taken" with a single press, snooze if busy, or use your voice.',
      bgColor: 'from-emerald-600 to-teal-700',
    },
    {
      step: 3,
      title: 'Stay Connected With Your People',
      subtitle: 'Peace of mind for Tagore & your family.',
      icon: HeartHandshake,
      badge: 'Caregiver Connectivity',
      description:
        'Your caregiver Tagore automatically knows you are safe and your prescriptions are stocked, without nagging phone calls.',
      bgColor: 'from-indigo-600 to-blue-700',
    },
    {
      step: 4,
      title: 'Get Help When You Need It',
      subtitle: 'Emergency SOS & Intelligent AyuNexa AI.',
      icon: ShieldAlert,
      badge: 'Safety First',
      description:
        'Immediate one-touch emergency calling with cellular fallback, plus AyuNexa AI to listen whenever you feel unwell or dizzy.',
      bgColor: 'from-rose-600 to-amber-700',
    },
  ];

  const current = steps[step - 1];
  const IconComponent = current.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        {/* Step indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {steps.map((s) => (
              <div
                key={s.step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s.step === step
                    ? 'w-8 bg-teal-600'
                    : s.step < step
                    ? 'w-2 bg-teal-300'
                    : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onComplete}
            className="text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            Skip Intro
          </button>
        </div>

        {/* Visual Hero */}
        <div
          className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${current.bgColor} text-white flex items-center justify-center shadow-lg shadow-teal-700/20`}
        >
          <IconComponent className="w-10 h-10" />
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
            {current.badge}
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{current.title}</h3>
          <p className="text-sm font-bold text-slate-700">{current.subtitle}</p>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto pt-1">
            {current.description}
          </p>
        </div>

        {/* Next / Get Started button */}
        <div className="pt-2">
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="w-full py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>GET STARTED WITH AYUNEXA</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
