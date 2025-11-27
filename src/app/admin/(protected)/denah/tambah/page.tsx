"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/Alert";

export default function TambahDenah() {
  const router = useRouter();

  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [versi, setVersi] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "error" | "warning" } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    let file_url = null;

    if (file) {
      setUploading(true);

      const ext = file.name.split(".").pop();
      const fileName = `denah-${Date.now()}.${ext}`;
      const filePath = `denah/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("perumahan-assets")
        .upload(filePath, file);

      if (uploadError) {
        setAlert({ message: "Gagal upload file", type: "error" });
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("perumahan-assets")
        .getPublicUrl(filePath);

      file_url = data.publicUrl;
      setUploading(false);
    }

    const { error } = await supabase.from("denah_perumahan").insert({
      judul,
      deskripsi,
      versi,
      file_url,
    });

    if (error) {
      setAlert({ message: "Gagal menyimpan", type: "error" });
      return;
    }

    setAlert({ message: "Denah berhasil disimpan", type: "success" });
    setTimeout(() => {
      router.push("/admin/denah");
    }, 1000);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-700">Tambah Denah</p>
        <h1 className="text-3xl font-bold text-slate-900">File kawasan baru</h1>
        <p className="text-sm text-slate-500">Unggah dokumen denah terbaru untuk warga.</p>
      </div>

      <form onSubmit={handleSave} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <Field label="Judul" value={judul} onChange={setJudul} required />
        <Field label="Deskripsi" isTextArea value={deskripsi} onChange={setDeskripsi} />
        <Field label="Versi" value={versi} onChange={setVersi} />

        <div>
          <label className="text-sm font-medium text-slate-600">Upload File Denah (gambar/PDF)</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-2 w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-blue-200"
          />
        </div>

        <div className="flex gap-3">
          <button
            className="rounded-2xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
            disabled={uploading}
          >
            {uploading ? "Mengupload..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/denah")}
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

