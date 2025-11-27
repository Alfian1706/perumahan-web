"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

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
      alert("Pilih gambar terlebih dahulu");
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
        alert("Gagal mengunggah salah satu gambar");
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
        alert("Gagal menyimpan salah satu slide");
      }
    }

    setFiles(null);
    await loadSlides();
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus slide ini?")) return;
    await supabase.from("landing_images").delete().eq("id", id);
    await loadSlides();
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
      alert("Pilih gambar terlebih dahulu");
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
      alert("Gagal mengunggah gambar");
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
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-blue-300 bg-white px-4 py-3 text-sm font-semibold text-blue-600 shadow-sm transition hover:border-blue-400">
              <span>
                {files && files.length > 0
                  ? `${files.length} file dipilih`
                  : "Pilih gambar (boleh banyak)"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="hidden"
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
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-blue-300 bg-white px-4 py-3 text-sm font-semibold text-blue-600 shadow-sm transition hover:border-blue-400">
              <span>{profileFile ? profileFile.name : "Pilih satu gambar"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileFile(e.target.files?.[0] ?? null)}
                className="hidden"
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
                    alt={slide.headline ?? "Slide"}
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
    </div>
  );
}

