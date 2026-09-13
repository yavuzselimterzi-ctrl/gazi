'use client';

import { FormEvent, type ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ClipboardCheck, FileText, Landmark, Plus, ShieldCheck, Trash2, Users } from 'lucide-react';

// Tek bayrak: başvurular açıldığında yalnızca bu değer true yapılır.
const APPLICATIONS_OPEN = false;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const COMMISSIONS = ['Adliye Encümeni', 'Harbiye Encümeni', 'Dahiliye Encümeni', 'Hariciye Encümeni', 'Maarif Encümeni', 'Nafia Encümeni'] as const;
const CLASS_LEVELS = ['Hazırlık', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'] as const;
type Commission = (typeof COMMISSIONS)[number];
type ClassLevel = (typeof CLASS_LEVELS)[number];
type FormMode = 'choose' | 'individual' | 'delegation';

type Person = {
  name: string;
  email: string;
  phone: string;
  classLevel: ClassLevel | '';
  experiences: string;
  preferences: [Commission | '', Commission | '', Commission | ''];
};

type Individual = Person & {
  tcIdentityNumber: string;
  school: string;
  birthDate: string;
  motivation: string;
  additions: string;
};

type HeadDelegate = {
  name: string;
  tcIdentityNumber: string;
  phone: string;
  classLevel: ClassLevel | '';
  email: string;
  birthDate: string;
  motivation: string;
  preferences: [Commission | '', Commission | '', Commission | ''];
};
type ConsentValues = { accuracyConsent: boolean; kvkkConsent: boolean };

const blankPreferences = (): [Commission | '', Commission | '', Commission | ''] => ['', '', ''];
const blankPerson = (): Person => ({ name: '', email: '', phone: '', classLevel: '', experiences: '', preferences: blankPreferences() });
const blankIndividual = (): Individual => ({ ...blankPerson(), tcIdentityNumber: '', school: '', birthDate: '', motivation: '', additions: '' });
const blankHead = (): HeadDelegate => ({ name: '', tcIdentityNumber: '', phone: '', classLevel: '', email: '', birthDate: '', motivation: '', preferences: blankPreferences() });
const wordCount = (value: string) => value.trim() ? value.trim().split(/\s+/).length : 0;
const hasUniquePreferences = (preferences: readonly string[]) => preferences.every((value, index) => value && preferences.indexOf(value) === index);
const digitsOnly = (value: string) => value.replace(/\D/g, '').slice(0, 11);

function Progress({ step, mode }: { step: number; mode: 'individual' | 'delegation' }) {
  const labels = mode === 'delegation' ? ['Baş delege', 'Üyeler', 'Özet'] : ['Başvuru', 'Özet'];
  return <div className="mb-10 grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-center">
    {labels.map((label, index) => {
      const current = index + 1;
      return <div key={label} className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#6f5548]">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${step >= current ? 'border-[#9b7632] bg-[#7d1f27] text-[#fff8e8]' : 'border-[#d7c7ae] bg-[#f7efdf]'}`}>{step > current ? <Check className="h-4 w-4" /> : current}</span>
        <span className="hidden sm:inline">{label}</span>
        {index < labels.length - 1 && <span className="mx-1 hidden h-px w-10 bg-[#d7c7ae] sm:block" />}
      </div>;
    })}
  </div>;
}

function Field({ label, required = true, children, hint }: { label: string; required?: boolean; children: ReactNode; hint?: string }) {
  return <label className="block text-sm font-semibold text-[#3e1d1d]">
    <span>{label} {required && <span className="text-[#a52b35]">*</span>}</span>
    {children}
    {hint && <span className="mt-1 block text-xs font-normal text-[#806b5c]">{hint}</span>}
  </label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="mt-2 h-12 w-full rounded-sm border border-[#d7c7ae] bg-[#fffaf0] px-4 text-[#351b1b] outline-none transition placeholder:text-[#aa9887] focus:border-[#9b7632] focus:ring-2 focus:ring-[#9b7632]/15" />;
}

function SelectInput({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  return <div className="relative mt-2"><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full appearance-none rounded-sm border border-[#d7c7ae] bg-[#fffaf0] px-4 pr-10 text-[#351b1b] outline-none focus:border-[#9b7632] focus:ring-2 focus:ring-[#9b7632]/15"><option value="">Seçiniz</option>{CLASS_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#806b5c]" /></div>;
}

function CommissionSelect({ value, onChange, index }: { value: string; onChange: (value: Commission | '') => void; index: number }) {
  return <div className="relative"><select aria-label={`${index}. Komisyon Tercihi`} value={value} onChange={(event) => onChange(event.target.value as Commission | '')} className="h-12 w-full appearance-none rounded-sm border border-[#d7c7ae] bg-[#fffaf0] px-4 pr-10 text-sm text-[#351b1b] outline-none focus:border-[#9b7632] focus:ring-2 focus:ring-[#9b7632]/15"><option value="">{index}. tercih</option>{COMMISSIONS.map((commission) => <option key={commission} value={commission}>{commission}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#806b5c]" /></div>;
}

function Preferences({ values, onChange }: { values: [Commission | '', Commission | '', Commission | '']; onChange: (index: number, value: Commission | '') => void }) {
  return <div className="grid gap-3 sm:grid-cols-3">{values.map((value, index) => <CommissionSelect key={index} index={index + 1} value={value} onChange={(next) => onChange(index, next)} />)}</div>;
}

function ClosedState() {
  return <main className="gazi-shell min-h-screen px-4 py-8 sm:px-8"><div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-between">
    <header className="flex items-center justify-between border-b border-[#d7c7ae]/70 pb-5"><Link href="/" className="flex items-center gap-3 text-[#7d1f27]"><span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#9b7632] bg-[#7d1f27] text-sm font-bold tracking-wider text-[#f8e9c9]">GM</span><span className="font-serif text-sm font-bold tracking-[0.16em] sm:text-base">GAZİ MECLİS-İ MEBUSAN</span></Link><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6f5548] hover:text-[#7d1f27]"><ArrowLeft className="h-4 w-4" /> Ana sayfa</Link></header>
    <section className="py-20 text-center"><div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#b99754] bg-[#7d1f27] text-[#f8e9c9] shadow-[0_14px_40px_rgba(75,20,20,.16)]"><Landmark className="h-9 w-9" /></div><p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-[#9b7632]">Başvuru Merkezi</p><h1 className="mx-auto max-w-3xl font-serif text-4xl font-bold leading-tight tracking-wide text-[#3e1d1d] sm:text-6xl">GAZİ MECLİS-İ MEBUSAN<br /><span className="text-[#7d1f27]">BAŞVURULARI ÇOK YAKINDA AÇILIYOR</span></h1><div className="mx-auto mt-8 h-px w-28 bg-[#9b7632]" /><p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#6f5548]">Bireysel ve delegasyon başvuruları açıldığında başvurunuzu doğrudan web sitemiz üzerinden gerçekleştirebilirsiniz.</p></section>
    <footer className="border-t border-[#d7c7ae]/70 py-5 text-center text-xs tracking-[0.14em] text-[#806b5c]">TARİH ŞUURU · MÜZAKERE AHLAKI · ORTAK AKIL</footer>
  </div></main>;
}

export default function ApplicationsPage() {
  if (!APPLICATIONS_OPEN) return <ClosedState />;
  return <OpenApplicationSystem />;
}

function OpenApplicationSystem() {
  const [mode, setMode] = useState<FormMode>('choose');
  const [step, setStep] = useState(1);
  const [individual, setIndividual] = useState(blankIndividual);
  const [head, setHead] = useState(blankHead);
  const [members, setMembers] = useState<Person[]>([]);
  const [consents, setConsents] = useState<ConsentValues>({ accuracyConsent: false, kvkkConsent: false });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState<{ applicationNumber: string; type: string; delegationSize: number; createdAt: string; status: string } | null>(null);

  const totalDelegation = members.length + 1;
  const canAddMember = totalDelegation < 15;
  const updateIndividual = <K extends keyof Individual>(key: K, value: Individual[K]) => setIndividual((current) => ({ ...current, [key]: value }));
  const updateHead = <K extends keyof HeadDelegate>(key: K, value: HeadDelegate[K]) => setHead((current) => ({ ...current, [key]: value }));
  const updateMember = (memberIndex: number, key: keyof Person, value: string | [Commission | '', Commission | '', Commission | '']) => setMembers((current) => current.map((member, index) => index === memberIndex ? { ...member, [key]: value } : member));
  const updatePreferences = (target: 'individual' | 'head' | number, index: number, value: Commission | '') => {
    if (target === 'individual') setIndividual((current) => { const preferences = [...current.preferences] as Individual['preferences']; preferences[index] = value; return { ...current, preferences }; });
    else if (target === 'head') setHead((current) => { const preferences = [...current.preferences] as HeadDelegate['preferences']; preferences[index] = value; return { ...current, preferences }; });
    else setMembers((current) => current.map((member, memberIndex) => { if (memberIndex !== target) return member; const preferences = [...member.preferences] as Person['preferences']; preferences[index] = value; return { ...member, preferences }; }));
  };
  const validation = useMemo(() => {
    if (mode === 'individual') return !individual.name || !/^\d{11}$/.test(individual.tcIdentityNumber) || !/^\+90 5\d{2} \d{3} \d{2} \d{2}$/.test(individual.phone) || !/^\S+@\S+\.\S+$/.test(individual.email) || !individual.classLevel || !individual.birthDate || wordCount(individual.motivation) < 150 || !hasUniquePreferences(individual.preferences) || !consents.accuracyConsent || !consents.kvkkConsent;
    const headInvalid = !head.name || !/^\d{11}$/.test(head.tcIdentityNumber) || !/^\+90 5\d{2} \d{3} \d{2} \d{2}$/.test(head.phone) || !/^\S+@\S+\.\S+$/.test(head.email) || !head.classLevel || !head.birthDate || wordCount(head.motivation) < 150 || !hasUniquePreferences(head.preferences) || !consents.accuracyConsent || !consents.kvkkConsent;
    if (step === 1) return headInvalid;
    return headInvalid || totalDelegation < 5 || members.some((member) => !member.name || !/^\S+@\S+\.\S+$/.test(member.email) || !/^\+90 5\d{2} \d{3} \d{2} \d{2}$/.test(member.phone) || !member.classLevel || !hasUniquePreferences(member.preferences));
  }, [consents, head, individual, members, mode, step, totalDelegation]);

  const next = () => { setError(''); if (mode === 'delegation' && step === 2 && totalDelegation < 5) return setError('Delegasyon başvurusu için en az 5 kişi gerekmektedir.'); if (validation) return setError('Lütfen zorunlu alanları ve tercihleri eksiksiz doldurunuz.'); setStep((current) => current + 1); };
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); if (validation) return setError('Başvuru gönderilemedi. Lütfen tüm alanları kontrol ediniz.'); const payload = mode === 'individual' ? { type: 'INDIVIDUAL', name: individual.name, tcIdentityNumber: individual.tcIdentityNumber, phone: individual.phone, email: individual.email, classLevel: individual.classLevel, birthDate: individual.birthDate, school: individual.school, experiences: individual.experiences, motivation: individual.motivation, preferences: individual.preferences, additions: individual.additions, ...consents } : { type: 'DELEGATION', name: head.name, tcIdentityNumber: head.tcIdentityNumber, phone: head.phone, email: head.email, classLevel: head.classLevel, birthDate: head.birthDate, motivation: head.motivation, preferences: head.preferences, members, ...consents }; try { const response = await fetch(`${API_URL}/applications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!response.ok) throw new Error('Başvuru gönderilemedi.'); setSubmitted(await response.json()); } catch { setError('Başvuru gönderilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.'); } };

  if (submitted) return <SuccessState application={submitted} />;
  if (mode === 'choose') return <main className="gazi-shell min-h-screen px-4 py-8 sm:px-8"><div className="mx-auto max-w-6xl"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6f5548]"><ArrowLeft className="h-4 w-4" /> Ana sayfa</Link><header className="py-16 text-center"><p className="text-xs font-bold uppercase tracking-[0.35em] text-[#9b7632]">Başvuru Merkezi</p><h1 className="mt-4 font-serif text-4xl font-bold text-[#3e1d1d] sm:text-6xl">Meclise Katılın</h1><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#6f5548]">GAZİ Meclis-i Mebusan deneyiminizi hangi başvuru modeliyle şekillendirmek istersiniz?</p></header><div className="grid gap-6 md:grid-cols-2"><ChoiceCard icon={FileText} title="Bireysel Başvuru" description="Meclise bireysel olarak katılmak isteyenler için." onClick={() => setMode('individual')} /><ChoiceCard icon={Users} title="Delegasyon Başvurusu" description="5 ila 15 kişilik ekipler halinde katılmak isteyenler için." onClick={() => setMode('delegation')} /></div></div></main>;

  return <main className="gazi-shell min-h-screen px-4 py-8 sm:px-8"><div className="mx-auto max-w-5xl"><button type="button" onClick={() => { setMode('choose'); setStep(1); }} className="inline-flex items-center gap-2 text-sm font-semibold text-[#6f5548] hover:text-[#7d1f27]"><ArrowLeft className="h-4 w-4" /> Başvuru türleri</button><header className="py-10 text-center"><p className="text-xs font-bold uppercase tracking-[0.3em] text-[#9b7632]">{mode === 'delegation' ? 'Delegasyon Başvurusu' : 'Bireysel Başvuru'}</p><h1 className="mt-3 font-serif text-4xl font-bold text-[#3e1d1d]">Başvuru Formu</h1></header><Progress step={step} mode={mode} /><form onSubmit={submit} className="rounded-sm border border-[#d7c7ae] bg-[#fffaf0]/80 p-5 shadow-[0_20px_60px_rgba(75,20,20,.08)] sm:p-9">{mode === 'individual' ? <IndividualForm data={individual} update={updateIndividual} updatePreferences={updatePreferences} consents={consents} setConsents={setConsents} step={step} /> : <DelegationForm head={head} updateHead={updateHead} members={members} updateMember={updateMember} updatePreferences={updatePreferences} consents={consents} setConsents={setConsents} addMember={() => canAddMember && setMembers((current) => [...current, blankPerson()])} removeMember={(index) => setMembers((current) => current.filter((_, memberIndex) => memberIndex !== index))} total={totalDelegation} canAdd={canAddMember} step={step} />}{error && <p role="alert" className="mt-6 border-l-4 border-[#a52b35] bg-[#f9e5df] px-4 py-3 text-sm font-semibold text-[#7d1f27]">{error}</p>}<div className="mt-10 flex flex-col-reverse gap-3 border-t border-[#d7c7ae] pt-6 sm:flex-row sm:justify-between">{step > 1 ? <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#b99754] px-5 py-3 text-sm font-bold text-[#7d1f27]"><ArrowLeft className="h-4 w-4" /> Geri</button> : <span />}{step < (mode === 'delegation' ? 3 : 2) ? <button type="button" onClick={next} className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#7d1f27] px-6 py-3 text-sm font-bold text-[#fff8e8] shadow-lg shadow-[#7d1f27]/15">Devam et <ArrowRight className="h-4 w-4" /></button> : <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#7d1f27] px-6 py-3 text-sm font-bold text-[#fff8e8] shadow-lg shadow-[#7d1f27]/15"><ShieldCheck className="h-4 w-4" /> Başvuruyu Gönder</button>}</div></form></div></main>;
}

function ChoiceCard({ icon: Icon, title, description, onClick }: { icon: typeof FileText; title: string; description: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="group border border-[#d7c7ae] bg-[#fffaf0]/80 p-8 text-left shadow-[0_20px_60px_rgba(75,20,20,.06)] transition hover:-translate-y-1 hover:border-[#9b7632] hover:shadow-[0_24px_70px_rgba(75,20,20,.12)]"><span className="mb-12 flex h-14 w-14 items-center justify-center bg-[#7d1f27] text-[#f8e9c9]"><Icon className="h-7 w-7" /></span><h2 className="font-serif text-2xl font-bold text-[#3e1d1d]">{title}</h2><p className="mt-3 leading-7 text-[#6f5548]">{description}</p><span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#7d1f27]">Başvuruyu başlat <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></button>; }

function IndividualForm({ data, update, updatePreferences, consents, setConsents, step }: { data: Individual; update: <K extends keyof Individual>(key: K, value: Individual[K]) => void; updatePreferences: (target: 'individual', index: number, value: Commission | '') => void; consents: ConsentValues; setConsents: (value: ConsentValues) => void; step: number }) { if (step === 2) return <Summary title="Başvuru Özeti"><SummaryRow label="Ad Soyad" value={data.name} /><SummaryRow label="E-posta" value={data.email} /><SummaryRow label="Okul" value={data.school} /><SummaryRow label="Komisyon tercihleri" value={data.preferences.join(' · ')} /><SummaryRow label="Motivasyon" value={`${wordCount(data.motivation)} kelime`} /></Summary>; return <section className="space-y-9"><div><h2 className="form-heading">Kişisel Bilgiler</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="İsminiz Soyisminiz"><TextInput value={data.name} onChange={(event) => update('name', event.target.value)} /></Field><Field label="T.C. Kimlik No"><TextInput inputMode="numeric" maxLength={11} value={data.tcIdentityNumber} onChange={(event) => update('tcIdentityNumber', digitsOnly(event.target.value))} /></Field><Field label="Telefon Numaranız" hint="Örnek: +90 5XX XXX XX XX"><TextInput type="tel" placeholder="+90 5XX XXX XX XX" value={data.phone} onChange={(event) => update('phone', event.target.value)} /></Field><Field label="Mail Adresiniz"><TextInput type="email" value={data.email} onChange={(event) => update('email', event.target.value)} /></Field><Field label="Okul Adı"><TextInput value={data.school} onChange={(event) => update('school', event.target.value)} /></Field><Field label="Sınıf Düzeyi"><SelectInput label="Sınıf Düzeyi" value={data.classLevel} onChange={(value) => update('classLevel', value as Individual['classLevel'])} /></Field><Field label="Doğum Tarihiniz" hint="GG/AA/YYYY"><TextInput placeholder="GG/AA/YYYY" value={data.birthDate} onChange={(event) => update('birthDate', event.target.value)} /></Field></div></div><div><h2 className="form-heading">Deneyim ve Motivasyon</h2><div className="mt-5 space-y-5"><Field label="Deneyimleriniz" required={false}><textarea className="form-textarea" value={data.experiences} onChange={(event) => update('experiences', event.target.value)} /></Field><Field label="Motivasyon Mektubunuz" hint={`${wordCount(data.motivation)} / 150 kelime`}><textarea className="form-textarea min-h-48" value={data.motivation} onChange={(event) => update('motivation', event.target.value)} /></Field></div></div><PreferencesSection values={data.preferences} onChange={(index, value) => updatePreferences('individual', index, value)} /><Field label="Eklemek İstediğiniz" required={false}><textarea className="form-textarea" value={data.additions} onChange={(event) => update('additions', event.target.value)} /></Field><Consent values={consents} onChange={setConsents} /></section>; }

function DelegationForm({ head, updateHead, members, updateMember, updatePreferences, consents, setConsents, addMember, removeMember, total, canAdd, step }: { head: HeadDelegate; updateHead: <K extends keyof HeadDelegate>(key: K, value: HeadDelegate[K]) => void; members: Person[]; updateMember: (index: number, key: keyof Person, value: string) => void; updatePreferences: (target: 'head' | number, index: number, value: Commission | '') => void; consents: ConsentValues; setConsents: (value: ConsentValues) => void; addMember: () => void; removeMember: (index: number) => void; total: number; canAdd: boolean; step: number }) { if (step === 3) return <Summary title="Delegasyon Başvuru Özeti"><SummaryRow label="Baş delege" value={head.name} /><SummaryRow label="Toplam delegasyon" value={`${total} / 15 kişi`} /><SummaryRow label="Komisyon tercihleri" value={head.preferences.join(' · ')} /><SummaryRow label="Delegeler" value={members.map((member) => member.name || 'İsimsiz delege').join(', ')} /></Summary>; if (step === 2) return <section><div className="mb-8 flex items-center justify-between"><div><h2 className="form-heading">Delegasyon Üyeleri</h2><p className="mt-2 text-sm text-[#6f5548]">Baş delege toplam kişi sayısına dahildir.</p></div><span className="rounded-full border border-[#b99754] bg-[#f8e9c9] px-4 py-2 text-sm font-bold text-[#7d1f27]">Delegasyon Sayısı: {total} / 15</span></div><div className="space-y-5">{members.map((member, index) => <div key={index} className="border border-[#d7c7ae] bg-[#f8f0e2] p-5 sm:p-7"><div className="mb-5 flex items-center justify-between"><h3 className="font-serif text-xl font-bold text-[#3e1d1d]">DELEGE {index + 1}</h3><button type="button" onClick={() => removeMember(index)} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#7d1f27]"><Trash2 className="h-4 w-4" /> Delegeyi Kaldır</button></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Delegenin Adı Soyadı"><TextInput value={member.name} onChange={(event) => updateMember(index, 'name', event.target.value)} /></Field><Field label="E-postası"><TextInput type="email" value={member.email} onChange={(event) => updateMember(index, 'email', event.target.value)} /></Field><Field label="Telefon Numarası"><TextInput type="tel" placeholder="+90 5XX XXX XX XX" value={member.phone} onChange={(event) => updateMember(index, 'phone', event.target.value)} /></Field><Field label="Sınıf Düzeyi"><SelectInput label="Delege Sınıf Düzeyi" value={member.classLevel} onChange={(value) => updateMember(index, 'classLevel', value)} /></Field></div><Field label="Deneyimleri" required={false}><textarea className="form-textarea mt-2" value={member.experiences} onChange={(event) => updateMember(index, 'experiences', event.target.value)} /></Field><div className="mt-5"><p className="text-sm font-semibold text-[#3e1d1d]">İlk 3 Komisyon Tercihi <span className="text-[#a52b35]">*</span></p><div className="mt-2"><Preferences values={member.preferences} onChange={(preferenceIndex, value) => updatePreferences(index, preferenceIndex, value)} /></div></div></div>)}<button type="button" disabled={!canAdd} onClick={addMember} className="inline-flex items-center gap-2 border border-dashed border-[#9b7632] px-5 py-3 text-sm font-bold text-[#7d1f27] disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-4 w-4" /> Delege Ekle</button></div></section>; return <section className="space-y-9"><div><h2 className="form-heading">Baş Delege Bilgileri</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Baş Delegenin İsmi Soyismi"><TextInput value={head.name} onChange={(event) => updateHead('name', event.target.value)} /></Field><Field label="T.C. Kimlik No"><TextInput inputMode="numeric" maxLength={11} value={head.tcIdentityNumber} onChange={(event) => updateHead('tcIdentityNumber', digitsOnly(event.target.value))} /></Field><Field label="Baş Delegenin Telefon Numarası" hint="Örnek: +90 5XX XXX XX XX"><TextInput type="tel" placeholder="+90 5XX XXX XX XX" value={head.phone} onChange={(event) => updateHead('phone', event.target.value)} /></Field><Field label="Baş Delegenin Sınıf Düzeyi"><SelectInput label="Baş Delege Sınıf Düzeyi" value={head.classLevel} onChange={(value) => updateHead('classLevel', value as HeadDelegate['classLevel'])} /></Field><Field label="Baş Delegenin Mail Adresi"><TextInput type="email" value={head.email} onChange={(event) => updateHead('email', event.target.value)} /></Field><Field label="Baş Delegenin Doğum Tarihi" hint="GG/AA/YYYY"><TextInput placeholder="GG/AA/YYYY" value={head.birthDate} onChange={(event) => updateHead('birthDate', event.target.value)} /></Field></div></div><div><Field label="Delegasyonunuzun etkinliğe katılma motivasyonu nedir?" hint={`${wordCount(head.motivation)} / 150 kelime`}><textarea className="form-textarea min-h-48" value={head.motivation} onChange={(event) => updateHead('motivation', event.target.value)} /></Field></div><PreferencesSection values={head.preferences} onChange={(index, value) => updatePreferences('head', index, value)} /><Consent values={consents} onChange={setConsents} /></section>; }

function PreferencesSection({ values, onChange }: { values: [Commission | '', Commission | '', Commission | '']; onChange: (index: number, value: Commission | '') => void }) { return <div><h2 className="form-heading">Komisyon Tercihleri</h2><p className="mt-2 text-sm text-[#6f5548]">Üç farklı tercih belirtiniz.</p><div className="mt-4"><Preferences values={values} onChange={onChange} /></div></div>; }
function Consent({ values, onChange }: { values: ConsentValues; onChange: (value: ConsentValues) => void }) { return <div className="space-y-3 border-t border-[#d7c7ae] pt-6 text-sm text-[#6f5548]"><label className="flex gap-3"><input required type="checkbox" checked={values.accuracyConsent} onChange={(event) => onChange({ ...values, accuracyConsent: event.target.checked })} className="mt-1 accent-[#7d1f27]" /> <span>Başvuru formunda verdiğim bilgilerin doğru olduğunu kabul ediyorum.</span></label><label className="flex gap-3"><input required type="checkbox" checked={values.kvkkConsent} onChange={(event) => onChange({ ...values, kvkkConsent: event.target.checked })} className="mt-1 accent-[#7d1f27]" /> <span>Kişisel verilerimin başvuru sürecinin yürütülmesi amacıyla işlenmesine ilişkin bilgilendirmeyi okudum.</span></label></div>; }
function Summary({ title, children }: { title: string; children: ReactNode }) { return <section><div className="mb-7 flex items-center gap-3"><ClipboardCheck className="h-6 w-6 text-[#9b7632]" /><h2 className="form-heading">{title}</h2></div><div className="divide-y divide-[#d7c7ae] border-y border-[#d7c7ae]">{children}</div><p className="mt-5 text-sm text-[#6f5548]">Bilgilerinizi kontrol ettikten sonra başvuruyu gönderebilirsiniz.</p></section>; }
function SummaryRow({ label, value }: { label: string; value: string }) { return <div className="grid gap-1 py-4 sm:grid-cols-[180px_1fr] sm:gap-5"><span className="text-xs font-bold uppercase tracking-wider text-[#806b5c]">{label}</span><span className="break-words text-sm font-semibold text-[#3e1d1d]">{value || 'Belirtilmedi'}</span></div>; }
function SuccessState({ application }: { application: { applicationNumber: string; type: string; delegationSize: number; createdAt: string; status: string } }) { return <main className="gazi-shell flex min-h-screen items-center justify-center px-4 py-12"><section className="w-full max-w-2xl border border-[#d7c7ae] bg-[#fffaf0] p-7 text-center shadow-[0_20px_60px_rgba(75,20,20,.1)] sm:p-12"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#7d1f27] text-[#f8e9c9]"><Check className="h-8 w-8" /></div><p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-[#9b7632]">Başvuru Durumu</p><h1 className="mt-3 font-serif text-4xl font-bold text-[#3e1d1d]">Başvurunuz Başarıyla Alındı</h1><div className="mx-auto mt-8 max-w-md divide-y divide-[#d7c7ae] border-y border-[#d7c7ae] text-left"><SummaryRow label="Başvuru numarası" value={application.applicationNumber} /><SummaryRow label="Başvuru türü" value={application.type === 'DELEGATION' ? 'Delegasyon başvurusu' : 'Bireysel başvuru'} /><SummaryRow label="Başvuru tarihi" value={new Date(application.createdAt).toLocaleDateString('tr-TR')} /><SummaryRow label="Delegasyon sayısı" value={`${application.delegationSize} kişi`} /><SummaryRow label="Durum" value="Değerlendirme Bekliyor" /></div><Link href="/" className="mt-8 inline-flex items-center gap-2 bg-[#7d1f27] px-6 py-3 text-sm font-bold text-[#fff8e8]">Ana sayfaya dön <ArrowRight className="h-4 w-4" /></Link></section></main>; }
