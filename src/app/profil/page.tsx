import { supabase } from "@/lib/supabaseClient";

export default async function ProfilPage() {
  const { data, error } = await supabase
    .from("profil_perumahan")
    .select("*")
    .single();

  if (error) {
    console.error("ERROR:", error);
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Profil Perumahan</h1>

      {data ? (
        <div className="space-y-3">
          <p><strong>Nama Perumahan:</strong> {data.nama_perumahan}</p>
          <p><strong>Alamat:</strong> {data.alamat}</p>
          <p><strong>Deskripsi:</strong> {data.deskripsi}</p>

          {data.logo_url && (
            <img 
              src={data.logo_url} 
              alt="Logo Perumahan" 
              className="w-40 mt-4 rounded-lg shadow"
            />
          )}
        </div>
      ) : (
        <p>Tidak ada data profil.</p>
      )}
    </main>
  );
}
