import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from 'sonner';
export const metadata:Metadata={title:'FB AutoPost Lite',description:'จัดการและตั้งเวลาโพสต์ Facebook ของคุณ'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><body><AppShell>{children}</AppShell><Toaster richColors position="top-right"/></body></html>}
