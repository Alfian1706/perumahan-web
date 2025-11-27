"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";

export default function EditKegiatanPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 🔹 Ambil data kegiatan saat pertama kali dibuka
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const { data, error } = await supabase
        .from("kegiatan_warga")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Data kegiatan tidak ditemukan");
        router.push("/admin/kegiatan");
        return;
      }

      setJudul(data.judul ?? "");
      setDeskripsi(data.deskripsi ?? "");
      setLokasi(data.lokasi ?? "");
      setTanggal(data.tanggal_kegiatan ?? ""); // format date yyyy-mm-dd
      setCoverUrl(data.cover_url ?? null);

      setLoading(false);
    }

    if (id) {
      fetchData();
    }
  }, [id, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    let newCoverUrl = coverUrl;

    // 🔹 Kalau upload file baru → upload ke Storage dan ganti URL
    if (file) {
      setUploading(true);

      const ext = file.name.split(".").pop();
      const fileName = `kegiatan-cover-${id}-${Date.now()}.${ext}`;
      const filePath = `kegiatan/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("perumahan-assets")
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        alert("Gagal upload cover kegiatan");
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("perumahan-assets")
        .getPublicUrl(filePath);

      newCoverUrl = data.publicUrl;
      setUploading(false);
    }

    setSaving(true);

    const { error } = await supabase
      .from("kegiatan_warga")
      .update({
        judul,
        deskripsi,
        lokasi,
        tanggal_kegiatan: tanggal,
        cover_url: newCoverUrl,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      console.error(error);
      alert("Gagal mengupdate kegiatan");
      return;
    }

    router.push("/admin/kegiatan");
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Memuat data kegiatan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-700">Edit Kegiatan</p>
        <h1 className="text-3xl font-bold text-slate-900">{judul || "Kegiatan"}</h1>
        <p className="text-sm text-slate-500">Perbarui informasi kegiatan warga.</p>
      </div>

      <form onSubmit={handleSave} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <Field label="Judul" value={judul} onChange={setJudul} required />
        <Field label="Deskripsi" isTextArea value={deskripsi} onChange={setDeskripsi} />
        <Field label="Lokasi" value={lokasi} onChange={setLokasi} />

        <div>
          <label className="text-sm font-medium text-slate-600">Tanggal Kegiatan</label>
          <input
            type="date"
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-600">Cover Kegiatan</label>
          {coverUrl && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <p className="px-3 pt-3 text-xs text-slate-500">Cover saat ini</p>
              <img src={coverUrl} alt="cover kegiatan" className="h-40 w-full rounded-2xl object-cover px-3 pb-3" />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-2xl border border-dashed border-slate-300 px-3 py-2 text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />

          {uploading && <p className="text-xs text-blue-600">Mengupload cover baru...</p>}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-2xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
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
