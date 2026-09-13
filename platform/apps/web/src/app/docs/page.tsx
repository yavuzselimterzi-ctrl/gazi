export default function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/70 p-10">
        <h1 className="text-3xl font-semibold">Teknik Dokümantasyon</h1>
        <p className="mt-3 text-slate-400">Bu portal, Next.js, NestJS, Prisma ve PostgreSQL üzerine kurulu modüler bir SaaS mimarisine sahiptir.</p>
        <ul className="mt-8 list-disc space-y-3 pl-6 text-slate-300">
          <li>Frontend: Next.js 15, React 19, Tailwind CSS, Framer Motion</li>
          <li>Backend: NestJS, Prisma, PostgreSQL, Redis, Socket.IO</li>
          <li>Security: JWT, refresh token, OAuth, two-factor authentication</li>
          <li>Deployment: Docker, Docker Compose, Nginx</li>
        </ul>
      </div>
    </main>
  );
}
