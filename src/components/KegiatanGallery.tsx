 "use client";
 
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function KegiatanGallery({
  photos,
  title,
}: {
  photos: string[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  if (!photos?.length) {
    return null;
  }

  const showGallery = () => {
    setCurrent(0);
    setOpen(true);
  };

  const currentPhoto = photos[current] ?? photos[0];

  const goPrev = () =>
    setCurrent((prev) => (prev - 1 + photos.length) % photos.length);

  const goNext = () => setCurrent((prev) => (prev + 1) % photos.length);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const modal = open
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 px-4 py-6"
          onClick={() => setOpen(false)}
        >
          <div
          className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/10 sm:max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sm:px-8 sm:py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-500">
                  Dokumentasi
                </p>
                <h4 className="text-2xl font-bold text-slate-900">
                  {title}
                </h4>
                <p className="text-sm text-slate-500">
                  Foto {current + 1} dari {photos.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6 lg:px-10 lg:pb-8 lg:pt-6">
              <div className="space-y-6 lg:grid lg:grid-cols-[3fr,1fr] lg:gap-6 lg:space-y-0">
                <div className="relative h-[220px] overflow-hidden rounded-[1.5rem] bg-slate-900 sm:h-[320px] lg:h-[420px]">
                <img
                  src={currentPhoto}
                  alt={`${title} dokumentasi ${current + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-3 text-lg font-semibold text-slate-700 shadow-lg backdrop-blur hover:bg-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-3 text-lg font-semibold text-slate-700 shadow-lg backdrop-blur hover:bg-white"
                >
                  ›
                </button>

                  <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-800 shadow backdrop-blur sm:left-6 sm:top-6 sm:px-4 sm:text-sm">
                  Dokumentasi {current + 1}
                </div>
              </div>

                <div className="space-y-4">
                  <div className="flex snap-x gap-3 overflow-x-auto rounded-[1.25rem] border border-slate-100 bg-slate-50/60 p-4">
                    {photos.map((foto, idx) => {
                      const isActive = idx === current;
                      return (
                        <button
                          key={foto + idx}
                          type="button"
                          onClick={() => setCurrent(idx)}
                          className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-2xl border sm:h-18 sm:w-22 ${
                            isActive
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={foto}
                            alt={`${title} thumbnail ${idx + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          {isActive && (
                            <span className="absolute inset-0 bg-blue-600/10" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                    Total dokumentasi{" "}
                    <span className="font-semibold text-slate-900">
                      {photos.length} foto
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                  >
                    Tutup galeri
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        type="button"
        onClick={showGallery}
        className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300"
      >
        Lihat dokumentasi
      </button>
      {modal}
    </>
  );
}

