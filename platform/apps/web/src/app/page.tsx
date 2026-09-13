'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles, Globe2 } from 'lucide-react';

const features = [
  {
    title: 'Kurumsal Dijital Arşiv',
    description: 'Osmanlı belgeleri, kararnameler ve olay akışları tek merkezde.',
    icon: ShieldCheck,
  },
  {
    title: 'Canlı Etkinlik Platformu',
    description: 'Konferans, seminer ve mevzuat akışlarını senkronize yönetin.',
    icon: Sparkles,
  },
  {
    title: 'Uluslararası Erişim',
    description: 'JWT tabanlı güvenli erişim ile global kullanıcı deneyimi sunun.',
    icon: Globe2,
  },
];

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.7]);

  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_45%)]">
      <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-24 lg:px-8">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="max-w-4xl"
        >
          <p className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm font-medium text-cyan-300">
            GAZİ Meclis-i Mebusan Dijital Osmanlı Devlet Portalı
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Gençlerin devlet geleneğini ve tarih şuurunu dijitalde yaşadığı platform.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Gençler, meclis simülasyonları, tarihî belgeler ve ortak akıl süreçleriyle geleceğe hazırlayan etkileyici bir deneyime davetlidir.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-400">
              Platformu Keşfet <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/basvuru" className="rounded-full border border-cyan-400/40 px-6 py-3 font-medium text-cyan-200 transition hover:border-cyan-300 hover:text-white">
              Başvuru Merkezi
            </Link>
            <Link href="/docs" className="rounded-full border border-slate-700 px-6 py-3 font-medium text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">
              Teknik Dokümantasyon
            </Link>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mt-16 rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-cyan-950/20"
        >
          <h2 className="text-2xl font-semibold text-white">Hakkımızda</h2>
          <p className="mt-4 text-slate-300">
            GAZİ Meclis-i Mebusan, gençlerin tarih bilincini, siyaset kültürünü ve devlet yönetimi yetkinliğini bir arada geliştireceği özgün bir platformdur.
          </p>
          <p className="mt-4 text-slate-300">
            Burada katılımcılar geçmişi okumaktan öte bir deneyim yaşar; devlet adabını, sorumluluk ruhunu ve ortak akıl geleneğini dijital ortamda keşfeder.
          </p>
          <p className="mt-4 text-slate-300">
            Platform, gençleri yalnızca bilgiyle donatmakla kalmaz; onların fikir olgunluğunu, özgüvenini ve milli-manevî değerlerini güçlendirmeyi hedefler.
          </p>
          <p className="mt-4 text-slate-300">
            Bu sayede bugünün gençleri yarının fikir önderleri, hukukçuları ve devlet adamları olarak yetişir.
          </p>
        </motion.section>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-950/20"
              >
                <div className="mb-4 inline-flex rounded-xl bg-cyan-500/10 p-3 text-cyan-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
