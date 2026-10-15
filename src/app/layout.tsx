import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sistema de Simulados | Estudos Pessoais',
  description:
    'Crie, resolva e revise simulados com gabarito comentado e cálculo instantâneo de acertos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 selection:bg-indigo-500/20 selection:text-indigo-700 dark:bg-zinc-950 dark:text-zinc-50 dark:selection:bg-indigo-400/20 dark:selection:text-indigo-300">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          Sistema de Simulados Pessoal — Monólito Next.js & PostgreSQL
        </footer>
      </body>
    </html>
  );
}
