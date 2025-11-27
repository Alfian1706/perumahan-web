"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { Alert, Confirm } from "@/components/Alert";

export default function FotoKegiatanPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const kegiatan_id = Number(params.id);

  const [files, setFiles] = useState<FileList | null>(null);
  const [existingFotos, setExistingFotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "error" | "warning" } | null>(null);
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

  async function loadFotos() {
    const { data, error } = await supabase
      .from("kegiatan_foto")
      .select("*")
      .eq("kegiatan_id", kegiatan_id)
      .order("id", { ascending: false });

    if (!error && data) {
      setExistingFotos(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!kegiatan_id) return;
    loadFotos();
  }, [kegiatan_id]);

  async function uploadFotos() {
    if (!files || files.length === 0) {
      setAlert({ message: "Pilih minimal 1 foto", type: "warning" });
      return;
    }

    setUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `kegiatan-${kegiatan_id}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${ext}`;
      const filePath = `kegiatan_foto/${fileName}`;

      // upload ke storage
      const { error: uploadError } = await supabase.storage
        .from("perumahan-assets")
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from("perumahan-assets")
        .getPublicUrl(filePath);

      // simpan ke tabel kegiatan_foto
      await supabase.from("kegiatan_foto").insert({
        kegiatan_id,
        foto_url: data.publicUrl,
      });
    }

    setUploading(false);
    setFiles(null);
    await loadFotos();
    setAlert({ message: "Foto berhasil diupload!", type: "success" });
  }

  async function deleteFoto(id: number) {
    setConfirm({
      message: "Hapus foto ini?",
      onConfirm: async () => {
        await supabase.from("kegiatan_foto").delete().eq("id", id);
        await loadFotos();
        setConfirm(null);
      },
    });
  }

  if (!kegiatan_id) {
    return <p>ID kegiatan tidak valid.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">Kelola Foto</p>
          <h1 className="text-3xl font-bold text-slate-900">Dokumentasi kegiatan</h1>
        </div>

        <button
          onClick={() => router.push("/admin/kegiatan")}
          className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
        >
          Kembali ke daftar
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-600">Upload Foto (boleh banyak)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="mt-2 w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-blue-200"
          />
        </div>

        <button
          type="button"
          onClick={uploadFotos}
          disabled={uploading}
          className="rounded-2xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
        >
          {uploading ? "Mengupload..." : "Upload Foto"}
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Foto yang sudah ada</h2>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Memuat foto...</p>
        ) : existingFotos.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Belum ada foto untuk kegiatan ini.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {existingFotos.map((f) => (
              <div key={f.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <img
                  src={f.foto_url}
                  alt="foto kegiatan"
                  className="h-32 w-full rounded-2xl object-cover"
                />
                <button
                  className="rounded-2xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:border-red-300"
                  onClick={() => deleteFoto(f.id)}
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {confirm && (
        <Confirm
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
