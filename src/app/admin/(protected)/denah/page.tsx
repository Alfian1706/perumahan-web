"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function DenahPage() {
  const [denah, setDenah] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("denah_perumahan")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setDenah(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Hapus denah ini?")) return;

    await supabase.from("denah_perumahan").delete().eq("id", id);

    loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">Denah Perumahan</p>
          <h1 className="text-3xl font-bold text-slate-900">Dokumen cluster</h1>
        </div>
        <Link
          href="/admin/denah/tambah"
          className="rounded-2xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          + Tambah Denah
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((key) => (
            <div key={key} className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : denah.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
          Belum ada file denah. Upload dokumen pertama dengan klik tombol tambah.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {denah.map((d) => (
            <article key={d.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Judul</p>
                  <h2 className="text-xl font-semibold text-slate-900">{d.judul}</h2>
                  {d.versi && <p className="text-sm text-slate-500">Versi {d.versi}</p>}
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  {new Date(d.created_at).toLocaleDateString("id-ID")}
                </span>
              </div>

              {d.deskripsi && <p className="mt-3 text-sm text-slate-600">{d.deskripsi}</p>}

              <div className="mt-5 flex flex-wrap gap-3">
                {d.file_url && (
                  <a
                    href={d.file_url}
                    target="_blank"
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700"
                  >
                    Lihat File
                  </a>
                )}
                <Link
                  href={`/admin/denah/edit/${d.id}`}
                  className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:border-indigo-300"
                >
                  Edit
                </Link>
                <button
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:border-red-300"
                  onClick={() => handleDelete(d.id)}
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
