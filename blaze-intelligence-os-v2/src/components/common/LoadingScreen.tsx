import * as React from 'react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-blaze-navy dark:bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative">
          {/* Spinning rings */}
          <div className="w-32 h-32 rounded-full border-4 border-blaze-blue/20 border-t-blaze-orange animate-spin" />
          <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-blaze-orange/20 border-b-blaze-blue animate-spin-slow" 
               style={{ animationDirection: 'reverse' }} />
          
          {/* Center logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blaze-orange to-blaze-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">BI</span>
            </div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="mt-8 space-y-2">
          <h2 className="text-xl font-display font-bold text-white">
            Initializing Blaze Intelligence
          </h2>
          <p className="text-blaze-blue text-sm animate-pulse">
            Loading championship-level analytics...
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-blaze-orange rounded-full animate-bounce" 
               style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blaze-orange rounded-full animate-bounce" 
               style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blaze-orange rounded-full animate-bounce" 
               style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}