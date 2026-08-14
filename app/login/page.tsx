'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  type UserCredential,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function createSession(credential: UserCredential) {
    const idToken = await credential.user.getIdToken(true);
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
    toast.success('เข้าสู่ระบบสำเร็จ');
    router.replace(params.get('next') || '/');
    router.refresh();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!auth) return toast.error('ยังไม่ได้ตั้งค่า Firebase Web App');
    setBusy(true);
    try {
      await createSession(await signInWithEmailAndPassword(auth, email, password));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    if (!auth) return toast.error('ยังไม่ได้ตั้งค่า Firebase Web App');
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await createSession(await signInWithPopup(auth, provider));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ';
      if (!message.includes('popup-closed-by-user')) toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">
      <section className="hidden lg:flex bg-[#111827] text-white p-14 flex-col justify-between">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-blue-600 grid place-items-center text-2xl font-bold">f</span>
          <b className="text-xl">FB AutoPost Lite</b>
        </div>
        <div>
          <p className="text-blue-400 font-semibold">Personal workspace</p>
          <h1 className="text-4xl font-bold leading-tight mt-3">วางแผนและเผยแพร่โพสต์อย่างเป็นระบบ</h1>
          <p className="text-slate-400 mt-4">เข้าสู่ระบบเพื่อจัดการ Facebook Pages ของคุณอย่างปลอดภัย</p>
        </div>
        <p className="text-xs text-slate-500">Firebase Authentication · Secure server session</p>
      </section>

      <section className="grid place-items-center p-5">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="lg:hidden flex gap-3 items-center mb-10">
            <span className="w-10 h-10 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">f</span>
            <b>FB AutoPost Lite</b>
          </div>
          <h2 className="text-2xl font-bold">เข้าสู่ระบบ</h2>
          <p className="text-sm text-slate-500 mt-2 mb-7">ใช้บัญชี Google หรือบัญชีที่สร้างไว้ใน Firebase Authentication</p>

          <button
            type="button"
            disabled={busy || !isFirebaseConfigured}
            onClick={signInWithGoogle}
            className="w-full h-11 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-3 font-semibold"
          >
            <span className="text-xl font-bold text-blue-600">G</span>
            เข้าสู่ระบบด้วย Google
          </button>

          <div className="flex items-center gap-3 my-6 text-xs text-slate-400">
            <span className="h-px bg-slate-200 flex-1" />หรือ<span className="h-px bg-slate-200 flex-1" />
          </div>

          <label className="text-sm font-semibold">
            Email
            <input autoComplete="email" required type="email" className="field mt-1 mb-4" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="text-sm font-semibold">
            Password
            <input autoComplete="current-password" required minLength={6} type="password" className="field mt-1 mb-5" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button disabled={busy || !isFirebaseConfigured} className="btn btn-primary w-full">
            {busy ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
          {!isFirebaseConfigured && <p className="text-xs text-red-600 text-center mt-4">ยังไม่ได้ตั้งค่า Firebase Web App ใน .env.local</p>}
        </form>
      </section>
    </main>
  );
}
