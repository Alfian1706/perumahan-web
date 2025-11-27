"use client";

import { useEffect, useMemo, useState } from "react";

type Slide = {
  id: number;
  image_url: string;
};

type Props = {
  slides: Slide[];
  nama: string;
  deskripsi: string;
};

export function HeroCarousel({ slides, nama, deskripsi }: Props) {
  const safeSlides = useMemo(
    () =>
      slides?.length
        ? slides
        : [
            {
              id: 0,
              image_url:
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80",
            },
          ],
    [slides]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % safeSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [safeSlides.length]);

  const current = safeSlides[index];

  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${current.image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-transparent" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-5 py-40 text-white md:py-48">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.8em] text-blue-200">
            Selamat datang
          </p>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight drop-shadow-lg md:text-6xl">
            {nama}
          </h1>
          <p className="mt-6 text-lg text-blue-100 md:text-xl">
            {deskripsi}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#profil"
              className="rounded-full bg-white px-6 py-3 text-base font-semibold text-blue-900 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Profil Perumahan
            </a>
            <a
              href="#kegiatan"
              className="rounded-full border border-white/70 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Kegiatan Warga
            </a>
          </div>

          <div className="mt-12 flex items-center gap-3">
            {safeSlides.map((slide, i) => (
              <button
                key={slide.id ?? i}
                onClick={() => setIndex(i)}
                className={`h-1.5 w-14 rounded-full transition ${
                  index === i ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

