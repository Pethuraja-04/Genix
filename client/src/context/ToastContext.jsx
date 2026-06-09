import React, { createContext, useContext, useState, useCallback } from "react";
import { HiCheck, HiExclamation, HiX } from "react-icons/hi";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((title, description, type = "success", duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`relative overflow-hidden flex items-start gap-4 p-5 rounded-3xl shadow-xl transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-auto animate-slide-in ${
              toast.type === "success"
                ? "bg-[#D1FAE5] border border-emerald-200/50 text-emerald-900"
                : "bg-[#FEE2E2] border border-red-200/50 text-red-900"
            }`}
          >
            {/* Background Blobs (matching the user's uploaded design) */}
            {toast.type === "success" ? (
              <>
                <div className="absolute -left-6 -top-6 w-20 h-20 bg-emerald-300/30 rounded-full blur-md pointer-events-none" />
                <div className="absolute left-6 -bottom-10 w-16 h-16 bg-emerald-400/20 rounded-full blur-md pointer-events-none" />
                <div className="absolute right-10 -bottom-8 w-12 h-12 bg-emerald-300/20 rounded-full blur-md pointer-events-none" />
              </>
            ) : (
              <>
                <div className="absolute -left-6 -top-6 w-20 h-20 bg-red-300/30 rounded-full blur-md pointer-events-none" />
                <div className="absolute left-6 -bottom-10 w-16 h-16 bg-red-400/20 rounded-full blur-md pointer-events-none" />
                <div className="absolute right-10 -bottom-8 w-12 h-12 bg-red-300/20 rounded-full blur-md pointer-events-none" />
              </>
            )}

            {/* Icon Column */}
            <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md shrink-0">
              {toast.type === "success" ? (
                <HiCheck className="w-6 h-6 text-emerald-500" />
              ) : (
                <HiExclamation className="w-6 h-6 text-red-500" />
              )}
            </div>

            {/* Content Column */}
            <div className="relative z-10 flex-1 min-w-0 pr-4">
              <h4 className="font-bold text-base leading-snug tracking-tight">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="mt-1 text-sm opacity-80 leading-relaxed font-medium">
                  {toast.description}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className={`relative z-10 shrink-0 p-1 rounded-full transition-colors hover:bg-black/5 ${
                toast.type === "success" ? "text-emerald-700/60 hover:text-emerald-950" : "text-red-700/60 hover:text-red-950"
              }`}
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
