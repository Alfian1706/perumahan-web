"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/profil", label: "Profil" },
  { href: "/admin/kegiatan", label: "Kegiatan" },
  { href: "/admin/denah", label: "Denah" },
  { href: "/admin/hero", label: "Pengaturan Gambar" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 flex-shrink-0 border-r border-slate-200 bg-white shadow-xl transition-transform lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-blue-700 to-blue-600 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-100">Perumahan</p>
              <h1 className="mt-1 text-2xl font-bold">Admin Panel</h1>
              <p className="text-xs text-blue-100/80">Kelola konten landing page</p>
            </div>
            <button
              className="rounded-full border border-white/30 p-1 lg:hidden"
              onClick={() => setOpen(false)}
            >
              <span className="sr-only">Tutup menu</span>
              <CloseIcon />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  pathname === link.href
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {link.label}
                {pathname === link.href && <span className="text-xs opacity-80">●</span>}
              </Link>
            ))}
          </nav>

          <form action="/admin/logout" method="post" className="p-4">
            <button className="w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600">
              Logout
            </button>
          </form>
        </aside>

        {open && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* MAIN */}
        <div className="flex flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-blue-600">Panel Admin</p>
                <h2 className="text-2xl font-bold text-slate-900">Dashboard Perumahan</h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-sm font-semibold text-slate-500 lg:flex">
                  {pathname === "/admin" ? "Beranda" : pathname.replace("/admin/", "").toUpperCase()}
                </div>
                <button
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 lg:hidden"
                  onClick={() => setOpen(true)}
                >
                  Menu
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-5 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
