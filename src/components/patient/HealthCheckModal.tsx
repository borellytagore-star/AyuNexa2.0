import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Camera,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Sun,
  User,
  Activity,
  Heart,
  RotateCcw,
} from 'lucide-react';

interface HealthCheckModalProps {
  onClose: () => void;
}

type CheckStage = 'CONSENT' | 'QUALITY_CHECK' | 'SCANNING' | 'RESULTS';

export const HealthCheckModal: React.FC<HealthCheckModalProps> = ({ onClose }) => {
  const { speakText } = useApp();
  const [stage, setStage] = useState<CheckStage>('CONSENT');
  const [qualityPassed, setQualityPassed] = useState(false);
  const [qualityFeedback, setQualityFeedback] = useState('Checking camera lighting and face position...');
  const [scanProgress, setScanProgress] = useState(0);

  // Quality gate simulation
  useEffect(() => {
    if (stage === 'QUALITY_CHECK') {
      const t1 = setTimeout(() => {
        setQualityFeedback('Lighting adequate. Center face in oval frame.');
      }, 1000);
      const t2 = setTimeout(() => {
        setQualityFeedback('Face detected and steady. Ready to scan.');
        setQualityPassed(true);
      }, 2000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [stage]);

  // Scan progress simulation (4 seconds)
  useEffect(() => {
    if (stage === 'SCANNING') {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStage('RESULTS');
            speakText('Observation check complete. Mild fatigue pattern detected.');
            return 100;
          }
          return prev + 5;
        });
      }, 180);
      return () => clearInterval(interval);
    }
  }, [stage, speakText]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Optional Health Check</h3>
              <p className="text-xs text-slate-500 font-medium">
                Observable pattern check • Non-diagnostic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STAGE 1: CONSENT & PRIVACY NOTICE (PRD §28, §30, §45) */}
        {stage === 'CONSENT' && (
          <div className="space-y-4">
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                <Shield className="w-4 h-4 text-teal-700" />
                <span>Explicit Privacy & Safety Guarantee</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                This short, camera-based check observes physical posture, facial symmetry, and blink cadence. It is an assistive observation tool, <strong>not a medical diagnosis</strong>.
              </p>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                <li>Raw video is <strong>never recorded or stored</strong> on any server.</li>
                <li>Camera turns off automatically the moment the check ends.</li>
                <li>You are in full control and may cancel at any moment.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setStage('QUALITY_CHECK');
                  speakText('Starting quality check. Please hold your phone steady.');
                }}
                className="w-full py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-extrabold text-base shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>I Understand — Start Health Check</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: QUALITY CHECK (PRD §29) */}
        {stage === 'QUALITY_CHECK' && (
          <div className="space-y-4 text-center">
            {/* Viewfinder frame */}
            <div className="relative w-48 h-60 mx-auto rounded-3xl bg-slate-900 overflow-hidden border-2 border-dashed border-teal-400 flex flex-col items-center justify-center text-white">
              <User className="w-24 h-24 text-slate-600 opacity-60" />
              <div className="absolute inset-0 border-4 border-teal-500/40 rounded-full m-4 pointer-events-none" />
              <div className="absolute bottom-3 text-[10px] bg-slate-800/80 px-2 py-0.5 rounded-full font-bold text-teal-300">
                Position Face in Oval
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">{qualityFeedback}</p>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Lighting: Good
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" /> Position: Steady
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setStage('SCANNING');
                speakText('Scanning observable patterns. Keep looking at the camera.');
              }}
              disabled={!qualityPassed}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              {qualityPassed ? 'Begin 4-Second Observation Scan' : 'Checking Camera...'}
            </button>
          </div>
        )}

        {/* STAGE 3: SCANNING (PRD §28) */}
        {stage === 'SCANNING' && (
          <div className="space-y-4 text-center py-4">
            <div className="relative w-48 h-60 mx-auto rounded-3xl bg-slate-950 overflow-hidden flex flex-col items-center justify-center text-white">
              {/* Scanline visual */}
              <div
                className="absolute inset-x-0 h-1 bg-teal-400 shadow-[0_0_12px_#2dd4bf] transition-all duration-100"
                style={{ top: `${scanProgress}%` }}
              />
              <Heart className="w-16 h-16 text-teal-400 animate-pulse" />
              <div className="absolute bottom-3 text-xs bg-black/60 px-3 py-1 rounded-full font-mono text-teal-300">
                Scanning... {scanProgress}%
              </div>
            </div>

            <p className="text-sm font-bold text-slate-800">
              Observing facial fatigue and resting symmetry...
            </p>
          </div>
        )}

        {/* STAGE 4: RESULTS (PRD §28) */}
        {stage === 'RESULTS' && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-900 font-extrabold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Observable Pattern: Mild Drowsiness
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                  Confidence: 86%
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Eye blink frequency is slower than your morning baseline, suggesting possible fatigue or drowsiness.
              </p>
              <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Recommended Next Steps:</p>
                <p>• Drink a glass of water and rest for 20 minutes.</p>
                <p>• Note: Your 8:00 PM Metformin dose is still pending confirmation.</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center italic">
              Camera has been turned off. No video or biometric tokens were saved.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setStage('CONSENT');
                  setScanProgress(0);
                  setQualityPassed(false);
                }}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repeat Check</span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
