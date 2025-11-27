"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type AlertProps = {
  message: string;
  type?: "info" | "success" | "error" | "warning";
  onClose: () => void;
};

export function Alert({ message, type = "info", onClose }: AlertProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!mounted) return null;

  const colors = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  const icons = {
    info: "ℹ️",
    success: "✓",
    error: "✕",
    warning: "⚠",
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div
        className={`w-full max-w-md rounded-3xl border-2 ${colors[type]} p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-2xl">{icons[type]}</div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1 hover:bg-black/5 transition-colors"
            aria-label="Tutup"
          >
            <span className="text-lg">×</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

type ConfirmProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function Confirm({ message, onConfirm, onCancel }: ConfirmProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

