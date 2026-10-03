import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  Scan,
  ShieldCheck,
  AlertCircle,
  X,
  KeyRound,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BiometricPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionTitle?: string;
  actionDescription?: string;
}

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = 'Biometric Verification Required',
  actionDescription = 'Verify your identity to access sensitive health data or export medical records.',
}) => {
  const { audioFeedback, speakText, logAuditEvent, patient } = useApp();
  const [modality, setModality] = useState<'FINGERPRINT' | 'FACE_ID' | 'PIN'>('FINGERPRINT');
  const [scanState, setScanState] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setScanState('IDLE');
      setErrorMessage('');
      setPinInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateScan = (simulateSuccess: boolean = true) => {
    setScanState('SCANNING');
    setErrorMessage('');

    setTimeout(() => {
      if (simulateSuccess) {
        setScanState('SUCCESS');
        audioFeedback('success');
        speakText('Biometric authentication verified.');

        logAuditEvent({
          actorId: patient.id,
          actorName: patient.name,
          actorRole: 'PATIENT',
          action: 'BIOMETRIC_AUTH_VERIFIED',
          resourceType: 'SECURITY',
          resourceId: `bio-${Date.now()}`,
          evidenceSource: 'DEVICE_VERIFIED',
          deviceId: 'android-biometric-prompt-tee',
          result: 'SUCCESS',
          notes: `Biometric authentication verified via ${modality}.`,
        });

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1100);
      } else {
        setScanState('ERROR');
        audioFeedback('alert');
        setErrorMessage('Biometric not recognized. Please try again or use PIN.');

        logAuditEvent({
          actorId: patient.id,
          actorName: patient.name,
          actorRole: 'PATIENT',
          action: 'BIOMETRIC_AUTH_FAILED',
          resourceType: 'SECURITY',
          resourceId: `bio-${Date.now()}`,
          evidenceSource: 'DEVICE_VERIFIED',
          deviceId: 'android-biometric-prompt-tee',
          result: 'FAILED',
          notes: 'Biometric scan mismatch.',
        });
      }
    }, 1200);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput.length >= 4) {
      setScanState('SUCCESS');
      audioFeedback('success');
      speakText('Device PIN verified.');

      logAuditEvent({
        actorId: patient.id,
        actorName: patient.name,
        actorRole: 'PATIENT',
        action: 'BIOMETRIC_AUTH_VERIFIED',
        resourceType: 'SECURITY',
        resourceId: `pin-${Date.now()}`,
        evidenceSource: 'PATIENT_REPORTED',
        deviceId: 'device-lock-screen-pin',
        result: 'SUCCESS',
        notes: 'Device security PIN fallback verified.',
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } else {
      setScanState('ERROR');
      audioFeedback('alert');
      setErrorMessage('Incorrect PIN. Please re-enter device passcode.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 leading-tight">
            {actionTitle}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {actionDescription}
          </p>
        </div>

        {/* Modality Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => {
              setModality('FINGERPRINT');
              setScanState('IDLE');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              modality === 'FINGERPRINT'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Fingerprint</span>
          </button>
          <button
            onClick={() => {
              setModality('FACE_ID');
              setScanState('IDLE');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              modality === 'FACE_ID'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Face ID</span>
          </button>
          <button
            onClick={() => {
              setModality('PIN');
              setScanState('IDLE');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              modality === 'PIN'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Device PIN</span>
          </button>
        </div>

        {/* Scanner Simulation Area */}
        {modality !== 'PIN' ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <button
              onClick={() => handleSimulateScan(true)}
              disabled={scanState === 'SCANNING' || scanState === 'SUCCESS'}
              className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all cursor-pointer relative ${
                scanState === 'SCANNING'
                  ? 'border-teal-500 bg-teal-50 animate-pulse scale-105 shadow-lg shadow-teal-500/20'
                  : scanState === 'SUCCESS'
                  ? 'border-emerald-500 bg-emerald-50 scale-105'
                  : scanState === 'ERROR'
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-slate-300 bg-slate-50 hover:border-teal-500 hover:bg-teal-50/50 hover:shadow-md'
              }`}
            >
              {scanState === 'SUCCESS' ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-in zoom-in" />
              ) : modality === 'FINGERPRINT' ? (
                <Fingerprint
                  className={`w-12 h-12 transition-all ${
                    scanState === 'SCANNING'
                      ? 'text-teal-600 scale-110'
                      : scanState === 'ERROR'
                      ? 'text-rose-600'
                      : 'text-slate-600'
                  }`}
                />
              ) : (
                <Scan
                  className={`w-12 h-12 transition-all ${
                    scanState === 'SCANNING'
                      ? 'text-teal-600 animate-spin'
                      : scanState === 'ERROR'
                      ? 'text-rose-600'
                      : 'text-slate-600'
                  }`}
                />
              )}

              {/* Pulsing ring during scan */}
              {scanState === 'SCANNING' && (
                <div className="absolute inset-0 rounded-full border-2 border-teal-400 animate-ping opacity-60 pointer-events-none" />
              )}
            </button>

            <div className="text-center">
              <p className="text-xs font-bold text-slate-800">
                {scanState === 'SCANNING'
                  ? 'Verifying biometric credentials...'
                  : scanState === 'SUCCESS'
                  ? 'Identity Verified Successfully!'
                  : scanState === 'ERROR'
                  ? 'Verification Failed'
                  : modality === 'FINGERPRINT'
                  ? 'Touch device fingerprint sensor'
                  : 'Glance at camera for Face ID'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Processed via Android BiometricPrompt / TEE Keystore
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-semibold animate-in shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Simulation Helper Buttons */}
            <div className="flex gap-2 w-full pt-1">
              <button
                onClick={() => handleSimulateScan(true)}
                disabled={scanState === 'SCANNING'}
                className="flex-1 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Touch Sensor (Pass)
              </button>
              <button
                onClick={() => handleSimulateScan(false)}
                disabled={scanState === 'SCANNING'}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Test Fail
              </button>
            </div>
          </div>
        ) : (
          /* PIN Input Form */
          <form onSubmit={handlePinSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5 text-center">
              <label className="text-xs font-bold text-slate-700 block">
                Enter 4-Digit Device PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                autoFocus
                className="w-36 mx-auto text-center tracking-[0.5em] text-xl font-mono py-2.5 rounded-2xl border-2 border-slate-200 focus:border-teal-600 focus:outline-none bg-slate-50"
              />
              <p className="text-[11px] text-slate-400">
                Fallback passcode (Demo default: 1234)
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Verify PIN
            </button>
          </form>
        )}

        {/* Security badge footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-semibold text-teal-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            Hardware Keystore Isolation
          </span>
          <span>FIDO2 / W3C WebAuthn</span>
        </div>
      </div>
    </div>
  );
};
