import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SnackBarMessage } from '../../types';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface SnackBarProps {
  snackBars: SnackBarMessage[];
  onDismiss: (id: string) => void;
}

export const SnackBar: React.FC<SnackBarProps> = ({ snackBars, onDismiss }) => {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-full max-w-md px-4 pointer-events-none">
      <AnimatePresence>
        {snackBars.map((snack) => {
          let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;
          let borderStyle = 'border-neutral-700 bg-neutral-900/95';

          if (snack.type === 'success') {
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
            borderStyle = 'border-emerald-500/30 bg-neutral-900/95';
          } else if (snack.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
            borderStyle = 'border-amber-500/30 bg-neutral-900/95';
          } else if (snack.type === 'error') {
            icon = <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
            borderStyle = 'border-red-500/30 bg-neutral-900/95';
          }

          return (
            <motion.div
              key={snack.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-neutral-100 w-full text-sm font-medium ${borderStyle}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {icon}
                <span className="truncate">{snack.text}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {snack.actionLabel && snack.onAction && (
                  <button
                    onClick={() => {
                      snack.onAction?.();
                      onDismiss(snack.id);
                    }}
                    className="text-xs font-bold text-red-400 hover:text-red-300 uppercase px-2 py-1 rounded-lg bg-red-500/10 transition-colors"
                  >
                    {snack.actionLabel}
                  </button>
                )}
                <button
                  onClick={() => onDismiss(snack.id)}
                  className="text-neutral-400 hover:text-neutral-200 p-1 rounded-full hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
