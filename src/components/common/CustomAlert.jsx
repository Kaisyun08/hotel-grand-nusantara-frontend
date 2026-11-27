import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function CustomAlert({ isOpen, onClose, title, message, type = 'success' }) {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all scale-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {isSuccess ? <CheckCircle2 size={26} /> : <AlertCircle size={26} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isSuccess ? 'text-emerald-600' : 'text-red-500'}`}>
                {isSuccess ? 'Berhasil' : 'Peringatan'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className={`w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition ${
              isSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}