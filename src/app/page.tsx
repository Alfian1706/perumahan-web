import { HeroCarousel } from "../components/HeroCarousel";
import { KegiatanGallery } from "@/components/KegiatanGallery";
import { LandingNav } from "@/components/LandingNav";
import { supabase } from "@/lib/supabaseClient";

export default async function Home() {
  const { data: profil } = await supabase
    .from("profil_perumahan")
    .select("*")
    .single();

  const { data: kegiatan } = await supabase
    .from("kegiatan_warga")
    .select("*")
    .eq("is_published", true)
    .order("tanggal_kegiatan", { ascending: false }) // ⬅️ pakai kolom baru
    .limit(3);

  const { data: denah } = await supabase
    .from("denah_perumahan")
    .select("*")
    .order("created_at", { ascending: false });

  const nama = profil?.nama_perumahan ?? "Website Perumahan";
  const alamat = profil?.alamat ?? "Alamat belum diisi";
  const deskripsi = profil?.deskripsi ?? "Deskripsi perumahan belum diisi.";
  const pengembang = profil?.pengembang ?? "Belum diisi";
  const kontak = profil?.kontak ?? "Belum diisi";
  const email = profil?.email ?? "Belum diisi";

  const kegiatanIds = kegiatan?.map((k) => k.id) ?? [];
  let fotoByKegiatan: Record<number, string[]> = {};
  if (kegiatanIds.length) {
    const { data: kegiatanFotos } = await supabase
      .from("kegiatan_foto")
      .select("kegiatan_id, foto_url")
      .in("kegiatan_id", kegiatanIds);

    kegiatanFotos?.forEach((item) => {
      if (!item.kegiatan_id) return;
      if (!fotoByKegiatan[item.kegiatan_id]) {
        fotoByKegiatan[item.kegiatan_id] = [];
      }
      if (item.foto_url) {
        fotoByKegiatan[item.kegiatan_id].push(item.foto_url);
      }
    });
  }

  const { data: heroSlides } = await supabase
    .from("landing_images")
    .select("id,image_url,sort_order")
    .eq("type", "hero")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const { data: profilImage } = await supabase
    .from("landing_images")
    .select("image_url")
    .eq("type", "profil")
    .maybeSingle();

  const profilDetails = [
    { label: "Pengembang", value: pengembang },
    { label: "Tipe Hunian", value: profil?.tipe ?? "Belum diisi" },
    { label: "Alamat", value: alamat },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* NAVBAR */}
      <LandingNav
        nama={nama}
        alamat={alamat}
        logo={profil?.logo_url ?? ""}
      />

      {/* HERO */}
      <HeroCarousel slides={heroSlides ?? []} nama={nama} deskripsi={deskripsi} />

      {/* PROFIL */}
      <section id="profil" className="p-0">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-none">
            {profilImage?.image_url || profil?.logo_url ? (
              <img
                src={profilImage?.image_url ?? (profil?.logo_url as string)}
                alt="Foto perumahan"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center bg-slate-100 text-slate-400">
                Tambahkan foto perumahan di admin.
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center bg-white px-12 py-14 text-slate-900">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.75em] text-blue-600">
                Tentang Kami
              </p>
              <h2 className="mt-3 text-5xl font-extrabold leading-tight text-slate-900">
                Hunian keluarga yang nyaman
              </h2>
              <p className="mt-4 text-lg text-slate-600 leading-relaxed">
                {deskripsi}
              </p>
            </div>

            <div className="mt-8 space-y-5 text-sm">
              {profilDetails.map((info) => (
                <div key={info.label}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    {info.label}
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {info.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KEGIATAN */}
      <section id="kegiatan" className="border-y border-slate-200 bg-blue-50/40">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                Agenda Komunitas
              </p>
              <h2 className="text-3xl font-bold text-slate-900">
                Kegiatan Warga Terbaru
              </h2>
              <p className="mt-2 text-slate-600">
                Update aktivitas warga di lingkungan perumahan.
              </p>
            </div>
            <a
              href="/admin/kegiatan"
              className="text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              Kelola kegiatan →
            </a>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {kegiatan?.length ? (
              kegiatan.map((item) => (
                <article
                  key={item.id}
                  className="group flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {item.cover_url ? (
                    <img
                      src={item.cover_url}
                      alt={item.judul}
                      className="h-48 w-full rounded-t-3xl object-cover"
                    />
                  ) : (
                    <div className="h-48 rounded-t-3xl bg-gradient-to-br from-blue-200 to-blue-100" />
                  )}

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      {item.tanggal_kegiatan}
                      {item.lokasi ? ` • ${item.lokasi}` : ""}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.judul}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {(item.deskripsi ?? "").slice(0, 120)}...
                    </p>
                    <KegiatanGallery
                      photos={fotoByKegiatan[item.id] ?? []}
                      title={item.judul}
                    />
                  </div>
                </article>
              ))
            ) : (
              <p className="text-blue-700">Belum ada kegiatan.</p>
            )}
          </div>
        </div>
      </section>

      {/* DENAH */}
      <section id="denah" className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              Navigasi Kawasan
            </p>
            <h2 className="text-3xl font-bold text-slate-900">
              Denah Perumahan
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Akses denah lengkap tiap cluster dan fasilitasnya.
            </p>
          </div>

          {denah?.length ? (
            <p className="text-sm text-slate-500">{denah.length} file terbaru</p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {denah?.length ? (
            denah.map((d) => (
              <div
                key={d.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      Cluster
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {d.judul}
                    </h3>
                  </div>

                  {d.file_url && (
                    <a
                      href={d.file_url}
                      target="_blank"
                      className="rounded-2xl bg-blue-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-blue-800"
                    >
                      Lihat
                    </a>
                  )}
                </div>

                {d.deskripsi && (
                  <p className="mt-3 text-sm text-slate-600">{d.deskripsi}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-blue-700">Belum ada denah.</p>
          )}
        </div>
      </section>

      {/* CTA KONTAK */}
      <section id="kontak" className="mx-auto max-w-6xl px-5 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
          <div className="grid gap-8 md:grid-cols-[2fr,1fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Kontak
              </p>
              <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900">
                Informasi pengurus perumahan
              </h2>
              <p className="mt-3 text-slate-600">
                {profil?.kontak
                  ? `Hubungi ${profil.kontak} jika membutuhkan bantuan atau informasi tambahan.`
                  : "Kontak pengurus belum diisi pada database."}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 text-sm">
              <p className="text-slate-500">Email</p>
              <p className="text-lg font-semibold text-slate-900">
                {profil?.email ?? "Belum diisi"}
              </p>
              <p className="mt-4 text-slate-500">Jam Operasional</p>
              <p className="text-slate-900">Senin - Minggu, 09.00 - 17.00 WIB</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-slate-600 md:flex-row">
          <p>
            © {new Date().getFullYear()} {nama}. Seluruh hak cipta.
          </p>
          <p>Website informasi resmi perumahan.</p>
        </div>
      </footer>
    </main>
  );
}

/* === UI Components === */

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
      <p className="text-xs uppercase tracking-wide text-blue-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-blue-900">{value}</p>
    </div>
  );
}


