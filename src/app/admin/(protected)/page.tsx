import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default async function AdminDashboard() {
  const { count: kegiatanCount } = await supabase
    .from("kegiatan_warga")
    .select("*", { count: "exact", head: true });

  const { count: denahCount } = await supabase
    .from("denah_perumahan")
    .select("*", { count: "exact", head: true });

  const { data: profil } = await supabase
    .from("profil_perumahan")
    .select("*")
    .single();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Ringkasan Data</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <SummaryCard label="Total Kegiatan" value={kegiatanCount ?? 0} accent="from-blue-600 to-blue-500" />
          <SummaryCard label="Total Denah" value={denahCount ?? 0} accent="from-indigo-600 to-blue-500" />
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Nama Perumahan</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {profil?.nama_perumahan ?? "Belum diisi"}
            </p>
            <p className="text-sm text-slate-500">{profil?.alamat ?? "Alamat belum diisi"}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-700">Tentang Perumahan</p>
              <h3 className="text-2xl font-bold text-slate-900">Deskripsi singkat</h3>
            </div>
            <Link href="/admin/profil" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
              Ubah profil →
            </Link>
          </div>
          <p className="mt-4 text-slate-600 leading-relaxed">
            {profil?.deskripsi ?? "Belum ada deskripsi."}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Tautan cepat</p>
          <div className="mt-4 space-y-3">
            <QuickLink href="/admin/kegiatan" label="Kelola kegiatan warga" />
            <QuickLink href="/admin/kegiatan/tambah" label="Tambah kegiatan baru" />
            <QuickLink href="/admin/denah" label="Perbarui denah cluster" />
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className={`inline-flex rounded-xl bg-gradient-to-r ${accent} px-3 py-1 text-xs font-semibold text-white`}>
        {label}
      </div>
      <p className="mt-4 text-4xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
    >
      {label}
      <span>→</span>
    </Link>
  );
}
