import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { initialPharmacies } from '../../data/initialData';
import { Pharmacy } from '../../types';
import {
  X,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  Navigation,
  Phone,
  ShieldCheck,
  ShoppingBag,
  List,
  Map,
} from 'lucide-react';

interface PharmacyRefillModalProps {
  medicineId: string;
  onClose: () => void;
}

export const PharmacyRefillModal: React.FC<PharmacyRefillModalProps> = ({
  medicineId,
  onClose,
}) => {
  const { medicines, orderRefill, patient } = useApp();
  const med = medicines.find((m) => m.id === medicineId);

  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy>(initialPharmacies[0]);
  const [quantity, setQuantity] = useState<number>(30);
  const [isOrdered, setIsOrdered] = useState<boolean>(false);

  if (!med) return null;

  const handlePlaceOrder = () => {
    orderRefill(medicineId, selectedPharmacy, quantity);
    setIsOrdered(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                Pharmacy Network
              </span>
              <span className="text-xs text-slate-400">Verified Local Partners</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Order Refill for {med.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Current stock: {med.currentStock} {med.unit} remaining
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isOrdered ? (
          /* SUCCESS STATE */
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">
              Refill Order Confirmed!
            </h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              <strong>{selectedPharmacy.name}</strong> is preparing your {quantity} {med.unit} of{' '}
              {med.name} {med.strength}.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 max-w-sm mx-auto text-left space-y-1">
              <p>
                <strong>Delivery Address:</strong> {patient.name}, Somajiguda, Hyderabad
              </p>
              <p>
                <strong>Estimated Delivery:</strong> {selectedPharmacy.deliveryTime}
              </p>
              <p>
                <strong>Payment:</strong> Caregiver Family Wallet (Pre-approved)
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Back to Medicine Runway
            </button>
          </div>
        ) : (
          /* PHARMACY SELECTION & ORDER FLOW */
          <div className="space-y-4">
            {/* View Mode Switcher: List vs Map */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Nearby Licensed Pharmacies ({initialPharmacies.length})
              </span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setViewMode('LIST')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all ${
                    viewMode === 'LIST'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  onClick={() => setViewMode('MAP')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all ${
                    viewMode === 'MAP'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
              </div>
            </div>

            {/* MAP VIEW SIMULATION */}
            {viewMode === 'MAP' && (
              <div className="h-44 rounded-2xl bg-slate-100 border border-slate-300 relative overflow-hidden flex items-center justify-center text-center p-4">
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-center gap-6">
                    {initialPharmacies.map((ph) => (
                      <button
                        key={ph.id}
                        onClick={() => setSelectedPharmacy(ph)}
                        className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          selectedPharmacy.id === ph.id
                            ? 'bg-teal-700 text-white shadow-md scale-105'
                            : 'bg-white text-slate-700 border border-slate-200 shadow-xs'
                        }`}
                      >
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span className="truncate max-w-[90px]">{ph.name.split('—')[0]}</span>
                        <span className="text-[10px] opacity-80">{ph.distanceKm} km</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Showing verified pharmacies within 2.5 km radius of Ravi's residence
                  </p>
                </div>
              </div>
            )}

            {/* PHARMACY LIST CARDS */}
            <div className="space-y-2.5">
              {initialPharmacies.map((pharmacy) => {
                const isSelected = selectedPharmacy.id === pharmacy.id;
                return (
                  <div
                    key={pharmacy.id}
                    onClick={() => setSelectedPharmacy(pharmacy)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{pharmacy.name}</h4>
                          <span className="flex items-center gap-0.5 text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {pharmacy.rating}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-teal-600" />
                            {pharmacy.distanceKm} km away
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-600" />
                            {pharmacy.deliveryTime} delivery
                          </span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-sm text-teal-900">
                          {pharmacy.priceFormatted}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-bold block">
                          ● In Stock
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER QUANTITY & SUMMARY */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Select Quantity:
                </span>
                <div className="flex gap-2">
                  {[15, 30, 60].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setQuantity(qty)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        quantity === qty
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {qty} {med.unit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500">Selected Pharmacy:</span>
                <span className="font-bold text-slate-800">{selectedPharmacy.name}</span>
              </div>
            </div>

            {/* ORDER BUTTON */}
            <div className="pt-2">
              <button
                onClick={handlePlaceOrder}
                className="w-full py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-extrabold text-base shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>CONFIRM REFILL ORDER ({quantity} {med.unit})</span>
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Order updates are synced automatically with caregiver Tagore.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
