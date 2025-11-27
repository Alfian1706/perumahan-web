"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Alert, Confirm } from "@/components/Alert";

type Slide = {
  id: number;
  image_url: string | null;
  is_active: boolean | null;
  sort_order: number | null;
};

export default function HeroAdminPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "error" | "warning" } | null>(null);
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

  async function loadSlides() {
    setLoading(true);
    const { data } = await supabase
      .from("landing_images")
      .select("*")
      .eq("type", "hero")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    setSlides(data ?? []);
    setLoading(false);
  }

  async function loadProfileImage() {
    const { data } = await supabase
      .from("landing_images")
      .select("image_url")
      .eq("type", "profil")
      .maybeSingle();
    setProfileImage(data?.image_url ?? null);
  }

  useEffect(() => {
    loadSlides();
    loadProfileImage();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!files || files.length === 0) {
      setAlert({ message: "Pilih gambar terlebih dahulu", type: "warning" });
      return;
    }
    setSaving(true);

    let orderPointer =
      (slides[slides.length - 1]?.sort_order ?? slides.length) + 1;

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `hero-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const filePath = `hero/${fileName}`;

      const uploadRes = await supabase.storage
        .from("perumahan-assets")
        .upload(filePath, file);

      if (uploadRes.error) {
        setAlert({ message: "Gagal mengunggah salah satu gambar", type: "error" });
        continue;
      }

      const { data: publicData } = supabase.storage
        .from("perumahan-assets")
        .getPublicUrl(filePath);

      const { error } = await supabase.from("landing_images").insert({
        type: "hero",
        image_url: publicData.publicUrl,
        sort_order: orderPointer++,
        is_active: true,
      });

      if (error) {
        setAlert({ message: "Gagal menyimpan salah satu slide", type: "error" });
      }
    }

    setFiles(null);
    await loadSlides();
    setSaving(false);
  }

  async function handleDelete(id: number) {
    setConfirm({
      message: "Hapus slide ini?",
      onConfirm: async () => {
        await supabase.from("landing_images").delete().eq("id", id);
        await loadSlides();
        setConfirm(null);
      },
    });
  }

  async function toggleActive(slide: Slide) {
    await supabase
      .from("landing_images")
      .update({ is_active: !slide.is_active })
      .eq("id", slide.id);
    await loadSlides();
  }

  async function handleProfileUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!profileFile) {
      setAlert({ message: "Pilih gambar terlebih dahulu", type: "warning" });
      return;
    }

    setProfileSaving(true);

    const ext = profileFile.name.split(".").pop();
    const fileName = `profil-${Date.now()}.${ext}`;
    const filePath = `profil/${fileName}`;

    const uploadRes = await supabase.storage
      .from("perumahan-assets")
      .upload(filePath, profileFile);

    if (uploadRes.error) {
      setAlert({ message: "Gagal mengunggah gambar", type: "error" });
      setProfileSaving(false);
      return;
    }

    const { data: publicData } = supabase.storage
      .from("perumahan-assets")
      .getPublicUrl(filePath);

    await supabase.from("landing_images").delete().eq("type", "profil");

    await supabase.from("landing_images").insert({
      type: "profil",
      image_url: publicData.publicUrl,
      sort_order: 0,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    setProfileFile(null);
    await loadProfileImage();
    setProfileSaving(false);
    setAlert({ message: "Foto profil berhasil diupdate", type: "success" });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan Gambar</h1>
        <p className="text-sm text-slate-500">
          Atur gambar latar hero dan foto yang tampil di bagian profil landing page.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleAdd}
            className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
          >
            <p className="text-sm font-semibold text-slate-600">
              Gambar Slider Hero
            </p>
            <label className="block">
              <span className="sr-only">Pilih gambar hero</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-blue-200"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? "Mengunggah..." : "Tambah Gambar"}
            </button>
          </form>

          <form
            onSubmit={handleProfileUpload}
            className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
          >
            <p className="text-sm font-semibold text-slate-600">
              Foto Profil Landing
            </p>
            {profileImage ? (
              <img
                src={profileImage}
                alt="Foto profil landing"
                className="h-40 w-full rounded-2xl object-cover"
              />
            ) : (
              <p className="text-xs text-slate-500">
                Belum ada foto. Unggah untuk menampilkan gambar di bagian profil landing.
              </p>
            )}
            <label className="block">
              <span className="sr-only">Pilih foto profil</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileFile(e.target.files?.[0] ?? null)}
                className="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-blue-200"
              />
            </label>
            <button
              type="submit"
              disabled={profileSaving}
              className="w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-800 disabled:opacity-60"
            >
              {profileSaving ? "Mengunggah..." : "Simpan Foto"}
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Daftar Slide Aktif
        </h2>

        {loading ? (
          <p className="text-sm text-slate-500">Memuat...</p>
        ) : slides.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-500">
            Belum ada slide hero.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {slides.map((slide) => (
              <article
                key={slide.id}
                className="rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                {slide.image_url && (
                  <img
                    src={slide.image_url}
                    alt="Slide hero"
                    className="h-48 w-full rounded-t-3xl object-cover"
                  />
                )}
                <div className="space-y-2 p-4">
                <p className="text-sm text-slate-600">
                  {slide.is_active ? "Aktif" : "Nonaktif"}
                </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(slide)}
                      className={`rounded-2xl px-3 py-2 text-xs font-semibold ${
                        slide.is_active
                          ? "border border-green-200 bg-green-50 text-green-700"
                          : "border border-slate-200 text-slate-600"
                      }`}
                    >
                      {slide.is_active ? "Aktif" : "Nonaktif"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(slide.id)}
                      className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

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

