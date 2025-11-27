"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/Alert";

export default function TambahKegiatan() {
  const router = useRouter();

  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "error" | "warning" } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    let cover_url = null;

    if (file) {
      setUploading(true);

      const ext = file.name.split(".").pop();
      const fileName = `kegiatan-cover-${Date.now()}.${ext}`;
      const filePath = `kegiatan/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("perumahan-assets")
        .upload(filePath, file);

      if (uploadError) {
        setAlert({ message: "Gagal upload cover kegiatan", type: "error" });
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("perumahan-assets")
        .getPublicUrl(filePath);

      cover_url = data.publicUrl;

      setUploading(false);
    }

    setSaving(true);

    const { error } = await supabase
    .from("kegiatan_warga")
    .insert([
        {
        judul,
        deskripsi,
        lokasi,
        tanggal_kegiatan: tanggal,
        cover_url: cover_url,
        is_published: true,
        }
    ]);

    setSaving(false);

    if (error) {
      setAlert({ message: "Gagal menyimpan kegiatan", type: "error" });
      return;
    }

    setAlert({ message: "Kegiatan berhasil disimpan", type: "success" });
    setTimeout(() => {
      router.push("/admin/kegiatan");
    }, 1000);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-700">Tambah Kegiatan</p>
        <h1 className="text-3xl font-bold text-slate-900">Agenda baru</h1>
        <p className="text-sm text-slate-500">Isi detail kegiatan untuk ditampilkan kepada warga.</p>
      </div>

      <form onSubmit={handleSave} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <Field label="Judul" value={judul} onChange={setJudul} required />
        <Field label="Deskripsi" isTextArea value={deskripsi} onChange={setDeskripsi} />
        <Field label="Lokasi" value={lokasi} onChange={setLokasi} />
        <div>
          <label className="text-sm font-medium text-slate-600">Tanggal</label>
          <input
            type="date"
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Cover Kegiatan</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-blue-200"
          />
          {uploading && <p className="text-xs text-blue-600">Mengupload cover...</p>}
        </div>

        <div className="flex gap-3">
          <button
            className="rounded-2xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Kegiatan"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/kegiatan")}
            className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
          >
            Batal
          </button>
        </div>
      </form>

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  isTextArea,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  isTextArea?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-600">{label}</label>
      {isTextArea ? (
        <textarea
          className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          value={value}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      ) : (
        <input
          className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      )}
    </div>
  );
}
