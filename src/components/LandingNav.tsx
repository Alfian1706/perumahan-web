 "use client";
 
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const NAV_LINKS = [
  { href: "#profil", label: "Profil" },
  { href: "#kegiatan", label: "Kegiatan" },
  { href: "#denah", label: "Denah" },
  { href: "#kontak", label: "Kontak" },
];

export function LandingNav({
  nama,
  alamat,
  logo,
}: {
  nama: string;
  alamat: string;
  logo?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const textClass = scrolled ? "text-slate-900" : "text-white";
  const subText = scrolled ? "text-slate-500" : "text-white/80";
  const linkClass = scrolled
    ? "text-slate-700 hover:text-blue-600"
    : "text-white/80 hover:text-white";
  const headerBg = scrolled
    ? "bg-white/85 border-slate-200 shadow-sm"
    : "bg-transparent border-transparent";
  const ctaClass = scrolled
    ? "rounded-2xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-800"
    : "rounded-2xl border border-white/50 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10";

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full border-b backdrop-blur-sm transition-all ${headerBg}`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            {logo ? (
              <img
                src={logo}
                alt="Logo Perumahan"
                className={`h-11 w-11 rounded-2xl border object-cover ${
                  scrolled ? "border-slate-100" : "border-white/40"
                }`}
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 font-bold text-white shadow">
                P
              </div>
            )}
            <div className="leading-tight">
              <p className={`font-semibold ${textClass}`}>{nama}</p>
              <p className={`text-xs ${subText}`}>{alamat}</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </a>
            ))}
            <a href="#kontak" className={ctaClass}>
              Hubungi Kami
            </a>
          </nav>

          <button
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition md:hidden ${
              scrolled
                ? "border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-700"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
        </div>
      </header>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              className="absolute right-4 top-4 w-64 rounded-2xl bg-white p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Navigasi</p>
                <button
                  className="rounded-full border border-slate-200 p-1"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-sm font-semibold text-slate-600">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#kontak"
                  className="mt-2 rounded-xl bg-blue-700 px-3 py-2 text-white"
                  onClick={() => setOpen(false)}
                >
                  Hubungi Kami
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
