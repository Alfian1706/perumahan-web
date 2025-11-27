"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function KegiatanPage() {
  const [kegiatan, setKegiatan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadData() {
    setLoading(true);

    const { data, error } = await supabase
      .from("kegiatan_warga")
      .select("*")
      .order("tanggal_kegiatan", { ascending: false }); // ⬅️ pakai kolom baru

    if (!error && data) {
      setKegiatan(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Hapus kegiatan ini?")) return;

    await supabase.from("kegiatan_warga").delete().eq("id", id);

    loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">Data Kegiatan Warga</p>
          <h1 className="text-3xl font-bold text-slate-900">Kelola agenda komunitas</h1>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
          <input
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Cari judul atau lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link
            href="/admin/kegiatan/tambah"
            className="rounded-2xl bg-blue-700 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            + Tambah Kegiatan
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((key) => (
            <div key={key} className="h-36 animate-pulse rounded-3xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : kegiatan.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
          Belum ada kegiatan, klik tombol tambah untuk membuat agenda pertama.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {kegiatan
            .filter((k) => {
              const q = search.toLowerCase();
              return (
                k.judul?.toLowerCase().includes(q) ||
                k.lokasi?.toLowerCase().includes(q) ||
                !q
              );
            })
            .map((k) => (
              <article key={k.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">{formatDate(k.tanggal_kegiatan)}</p>
                    <h2 className="text-lg font-semibold text-slate-900">{k.judul}</h2>
                    {k.lokasi && <p className="text-sm text-slate-500">{k.lokasi}</p>}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${k.is_published ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                    {k.is_published ? "Dipublikasikan" : "Draft"}
                  </span>
                </div>

                {k.cover_url && (
                  <img
                    src={k.cover_url}
                    alt={k.judul}
                    className="h-40 w-full rounded-2xl object-cover"
                  />
                )}

                <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">Mulai: {k.tanggal_mulai ?? "-"}</span>
                  {k.tanggal_selesai && <span className="rounded-full bg-slate-100 px-3 py-1">Selesai: {k.tanggal_selesai}</span>}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/admin/kegiatan/edit/${k.id}`}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/kegiatan/foto/${k.id}`}
                    className="flex-1 rounded-2xl border border-green-200 bg-green-50 px-4 py-2 text-center text-sm font-semibold text-green-700 hover:border-green-300"
                  >
                    Foto
                  </Link>
                  <button
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:border-red-300"
                    onClick={() => handleDelete(k.id)}
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))}
        </div>
      )}
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
    }).format(new Date(date));
  } catch {
    return date;
  }
}
