
import * as React from 'react';
import { motion } from 'motion/react';
import { Clock, Info, ChevronRight, TrendingUp, Star } from 'lucide-react';

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    const state = (this as any).state;
    const props = (this as any).props;

    if (state.hasError) {
      const errorStr = state.error?.toString() || '';
      const isQuotaError = errorStr.includes('Quota limit exceeded') || errorStr.includes('Quota exceeded') || errorStr.includes('Firestore Quota Exceeded') || errorStr.includes('free tier limit');
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-black">
          <div className={`w-20 h-20 ${isQuotaError ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' : 'bg-red-100 dark:bg-red-900/20 text-red-600'} rounded-full flex items-center justify-center mb-6`}>
            {isQuotaError ? <Clock size={40} /> : <Info size={40} />}
          </div>
          <h2 className="text-2xl font-black text-maroon dark:text-white uppercase tracking-tighter mb-4">
            {isQuotaError ? 'Daily Limit Reached' : 'Something went wrong'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
            {isQuotaError 
              ? "The application has reached its free tier limit for database reads for today. This limit resets daily at midnight. Please try again tomorrow."
              : "We encountered an unexpected error. Please try refreshing the page or contact support if the issue persists."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-maroon text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest shadow-lg"
            >
              Refresh Page
            </button>
            {isQuotaError && (
              <a 
                href="https://firebase.google.com/pricing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-maroon border border-maroon px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-2"
              >
                Learn More <ChevronRight size={14} />
              </a>
            )}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-gray-100 dark:bg-gray-900 rounded-xl text-left text-[10px] overflow-auto max-w-full">
              {errorStr}
            </pre>
          )}
        </div>
      );
    }
    return props.children;
  }
}

export const LoadingOverlay = ({ message = "Loading..." }: { message?: string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm"
  >
    <div className="relative w-20 h-20">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-4 border-gray-200 dark:border-gray-800 rounded-full"
      />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-4 border-t-maroon rounded-full"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <TrendingUp className="text-maroon animate-pulse" size={24} />
      </div>
    </div>
    <motion.p 
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-maroon dark:text-white"
    >
      {message}
    </motion.p>
  </motion.div>
);

export const StarRating = ({ rating, onRate, size = 16 }: { rating: number, onRate?: (r: number) => void, size?: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={!onRate}
        onClick={() => onRate?.(star)}
        className={`${onRate ? 'cursor-pointer' : 'cursor-default'} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      >
        <Star size={size} />
      </button>
    ))}
  </div>
);
