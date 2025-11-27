"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState, ChangeEvent } from "react";

interface ProfilPerumahan {
  id: number;
  nama_perumahan: string;
  alamat: string;
  deskripsi: string;
  logo_url: string;
  pengembang: string;
  tipe: string;
  kontak: string;
  email: string;
}

export default function AdminProfilPage() {
  const [profil, setProfil] = useState<ProfilPerumahan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfil = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("profil_perumahan")
        .select("*")
        .maybeSingle();

      if (error) {
        console.error(error);
        setErrorMsg("Gagal mengambil data profil.");
      }

      if (data) {
        setProfil({
          id: data.id,
          nama_perumahan: data.nama_perumahan ?? "",
          alamat: data.alamat ?? "",
          deskripsi: data.deskripsi ?? "",
          logo_url: data.logo_url ?? "",
          pengembang: data.pengembang ?? "",
          tipe: data.tipe ?? "",
          kontak: data.kontak ?? "",
          email: data.email ?? "",
        });
      } else {
        setProfil({
          id: 0,
          nama_perumahan: "",
          alamat: "",
          deskripsi: "",
          logo_url: "",
          pengembang: "",
          tipe: "",
          kontak: "",
          email: "",
        });
      }

      setLoading(false);
    };

    fetchProfil();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profil) return;

    setSaving(true);
    setMessage(null);
    setErrorMsg(null);

    const payload = {
      nama_perumahan: profil.nama_perumahan || null,
      alamat: profil.alamat || null,
      deskripsi: profil.deskripsi || null,
      logo_url: profil.logo_url || null,
      pengembang: profil.pengembang || null,
      tipe: profil.tipe || null,
      kontak: profil.kontak || null,
      email: profil.email || null,
      updated_at: new Date().toISOString(),
    };

    try {
      const query = supabase.from("profil_perumahan");
      const response =
        profil.id && profil.id !== 0
          ? await query.update(payload).eq("id", profil.id).select().single()
          : await query.insert(payload).select().single();

      if (response.error) {
        console.error(response.error);
        setErrorMsg(response.error.message ?? "Gagal menyimpan profil.");
        return;
      }

      setMessage("Profil berhasil disimpan.");
      const data = response.data;
      if (data) {
        setProfil((prev) =>
          prev
            ? { ...prev, id: data.id }
            : {
                id: data.id,
                nama_perumahan: data.nama_perumahan ?? "",
                alamat: data.alamat ?? "",
                deskripsi: data.deskripsi ?? "",
                logo_url: data.logo_url ?? "",
                pengembang: data.pengembang ?? "",
                tipe: data.tipe ?? "",
                kontak: data.kontak ?? "",
                email: data.email ?? "",
              }
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profil) return;

    setUploading(true);
    setUploadError(null);

    try {
      const ext = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${ext}`;
      const filePath = `logo/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("perumahan-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        setUploadError("Gagal mengupload logo.");
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("perumahan-assets")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      setProfil((prev) =>
        prev ? { ...prev, logo_url: publicUrl } : prev
      );
      setMessage("Logo berhasil diupload. Jangan lupa klik Simpan Profil.");
    } catch (err) {
      console.error(err);
      setUploadError("Terjadi kesalahan saat upload logo.");
    } finally {
      setUploading(false);
    }
  }

  if (loading || !profil) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Memuat data profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-700">Profil Perumahan</p>
        <h2 className="text-3xl font-bold text-slate-900">{profil.nama_perumahan || "Belum diisi"}</h2>
        <p className="mt-1 text-sm text-slate-500">Perbarui data yang ditampilkan pada landing page.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <Field
              label="Nama Perumahan"
              value={profil.nama_perumahan}
              onChange={(val) =>
                setProfil((prev) => (prev ? { ...prev, nama_perumahan: val } : prev))
              }
              required
            />
            <Field
              label="Alamat"
              value={profil.alamat}
              onChange={(val) =>
                setProfil((prev) => (prev ? { ...prev, alamat: val } : prev))
              }
              required
            />
            <Field
              label="Pengembang"
              value={profil.pengembang}
              onChange={(val) =>
                setProfil((prev) => (prev ? { ...prev, pengembang: val } : prev))
              }
            />
            <Field
              label="Tipe Hunian (misal: Cluster, Townhouse)"
              value={profil.tipe}
              onChange={(val) =>
                setProfil((prev) => (prev ? { ...prev, tipe: val } : prev))
              }
            />
            <div>
              <label className="text-sm font-medium text-slate-600">Deskripsi</label>
              <textarea
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={profil.deskripsi}
                rows={6}
                onChange={(e) =>
                  setProfil((prev) =>
                    prev ? { ...prev, deskripsi: e.target.value } : prev
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <Field
              label="Kontak (WhatsApp/No. HP)"
              value={profil.kontak}
              onChange={(val) =>
                setProfil((prev) => (prev ? { ...prev, kontak: val } : prev))
              }
            />
            <Field
              label="Email"
              type="email"
              value={profil.email}
              onChange={(val) =>
                setProfil((prev) => (prev ? { ...prev, email: val } : prev))
              }
            />
            <label className="text-sm font-medium text-slate-600">Logo Perumahan</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoFileChange}
              className="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-blue-200"
            />
            {uploading && <p className="text-xs text-blue-600">Mengupload logo...</p>}
            {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
            {profil.logo_url && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profil.logo_url} alt="Logo Perumahan" className="h-32 w-full object-contain p-3" />
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <input
        type={type ?? "text"}
        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
