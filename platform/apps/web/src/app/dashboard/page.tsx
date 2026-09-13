export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-800 bg-slate-900/70 p-10">
        <h1 className="text-3xl font-semibold">Yönetim Paneli</h1>
        <p className="mt-3 text-slate-400">Kurumsal içerikler, kullanıcılar ve etkinlik akışları burada yönetilir.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <p className="text-sm text-cyan-300">Toplam İçerik</p>
            <p className="mt-2 text-3xl font-semibold">128</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <p className="text-sm text-cyan-300">Aktif Kullanıcı</p>
            <p className="mt-2 text-3xl font-semibold">42</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <p className="text-sm text-cyan-300">Sistem Durumu</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-400">Sağlam</p>
          </div>
        </div>
      </div>
    </main>
  );
}
