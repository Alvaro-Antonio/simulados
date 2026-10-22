'use client';

import { useState } from 'react';
import { User, Sparkles, ExternalLink, X, Code2, Heart, Award } from 'lucide-react';

export function AboutDevModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        title="Sobre o Desenvolvedor"
      >
        <User className="h-3.5 w-3.5 text-indigo-500" />
        <span>Sobre</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            {/* Botão fechar */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Cabeçalho */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
                <Code2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Álvaro Antônio
                </h3>
                <p className="text-xs text-indigo-600 font-medium dark:text-indigo-400">
                  Desenvolvedor Full-Stack & Mobile
                </p>
              </div>
            </div>

            {/* Descrição do Projeto */}
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-5">
              Criador do <strong>Sistema Pessoal de Simulados</strong>, desenvolvido para potencializar o estudo com gabaritos comentados, amostragem inteligente, banco de questões e geração com IA.
            </p>

            {/* Links Sociais */}
            <div className="space-y-2.5 mb-6">
              {/* GitHub */}
              <a
                href="https://github.com/Alvaro-Antonio"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-sm transition-all hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">GitHub</p>
                    <p className="text-xs text-zinc-500">github.com/Alvaro-Antonio</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200" />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/hakaishin.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-sm transition-all hover:border-pink-300 hover:bg-pink-50/40 dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-pink-900/60 dark:hover:bg-pink-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Instagram</p>
                    <p className="text-xs text-zinc-500">@hakaishin.dev</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-zinc-400 group-hover:text-pink-600 dark:group-hover:text-pink-400" />
              </a>
            </div>

            {/* Rodapé com crédito IA */}
            <div className="rounded-xl bg-indigo-50/70 p-3 text-xs text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 flex items-start gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
              <span>
                Desenvolvido com o auxílio do <strong>Agente Autônomo Antigravity</strong> (Google DeepMind).
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
