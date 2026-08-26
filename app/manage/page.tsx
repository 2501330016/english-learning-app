"use client"

import {
  useCallback,
  useEffect,
  useState,
} from "react"

import Link from "next/link"

import { AddWordForm } from "@/components/manage/add-word-form"
import { WordList } from "@/components/manage/word-list"
import {
  CustomVocabularyManager,
  CustomWord,
} from "@/lib/custom-vocabulary"

export default function ManagePage() {
  const [words, setWords] =
    useState<CustomWord[]>([])

  const [showAddForm, setShowAddForm] =
    useState(true)

  const loadWords = useCallback(
    () => {
      const manager =
        CustomVocabularyManager.getInstance()

      setWords(
        manager.getCustomWords()
      )
    },
    []
  )

  useEffect(() => {
    const manager =
      CustomVocabularyManager.getInstance()

    manager.ready().then(() => {
      loadWords()
    })
  }, [loadWords])

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:underline"
            >
              ← Back
            </Link>

            <h1 className="mt-3 text-3xl font-bold">
              My Vocabulary
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {words.length} words
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowAddForm(
                !showAddForm
              )
            }
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            {showAddForm
              ? "Close"
              : "+ Add Word"}
          </button>
        </header>

        {/* Add word */}
        {showAddForm && (
          <section className="mb-10 rounded-lg border border-border p-6">
            <h2 className="mb-5 text-xl font-semibold">
              Add a word
            </h2>

            <AddWordForm
              onWordAdded={() => {
                loadWords()
              }}
            />
          </section>
        )}

        {/* Word list */}
        <section>
          <h2 className="mb-5 text-xl font-semibold">
            My Words
          </h2>

          <WordList
            words={words}
            onRefresh={loadWords}
          />
        </section>
      </div>
    </main>
  )
}