import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ message = "Memuat data..." }) {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Ring animasi berputar */}
        <div className="h-14 w-14 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin" />
        <Loader2 className="absolute text-amber-600 animate-pulse" size={24} />
      </div>
      <p className="text-sm font-semibold text-gray-600 animate-pulse">
        {message}
      </p>
    </div>
  );
}