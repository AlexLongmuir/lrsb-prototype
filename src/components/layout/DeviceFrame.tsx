"use client";

import { useState, ReactNode } from "react";

type DeviceFrameProps = {
  children: ReactNode;
};

export function DeviceFrame({ children }: DeviceFrameProps) {
  const [showFrame, setShowFrame] = useState(true);

  return (
    <div className="min-h-screen bg-gray-200 relative">
      <button
        onClick={() => setShowFrame(!showFrame)}
        className="fixed top-4 right-4 z-50 bg-white text-sub text-gray-600 px-3 py-1.5 rounded-md shadow-md hover:bg-gray-50"
      >
        {showFrame ? "Remove frame" : "Show frame"}
      </button>

      {showFrame ? (
        <div className="flex items-start justify-center pt-8 pb-8 min-h-screen">
          <div className="relative">
            <div className="w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl border-4 border-gray-800 overflow-hidden relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-gray-800 rounded-b-2xl z-10" />
              <div className="h-full overflow-y-auto pt-[30px]">
                {children}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto min-h-screen bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
