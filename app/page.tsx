"use client"

import Link from "next/link"
import { InstallPrompt } from "@/components/pwa/install-prompt"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <InstallPrompt />

      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-10 text-center text-3xl font-bold">
          English Vocabulary
        </h1>

        <div className="space-y-4">
          {/* 単語登録 */}
          <Link
            href="/manage"
            className="block rounded-xl border border-border p-6 transition hover:bg-muted"
          >
            <h2 className="text-xl font-semibold">
              単語登録
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              覚えたい英単語を登録する
            </p>
          </Link>

          {/* テスト */}
          <Link
            href="/quiz"
            className="block rounded-xl border border-border p-6 transition hover:bg-muted"
          >
            <h2 className="text-xl font-semibold">
              テスト
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              例文の穴埋めで英単語をテストする
            </p>
          </Link>

          {/* 単語帳 */}
          <Link
            href="/review"
            className="block rounded-xl border border-border p-6 transition hover:bg-muted"
          >
            <h2 className="text-xl font-semibold">
              単語帳
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              登録した単語・例文・メモを見る
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}