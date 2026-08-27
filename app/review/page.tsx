"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  CustomVocabularyManager,
  type CustomWord,
} from "@/lib/custom-vocabulary"

export default function ReviewPage() {
  const [words, setWords] = useState<CustomWord[]>([])
  const [selectedWord, setSelectedWord] =
    useState<CustomWord | null>(null)

  const [search, setSearch] = useState("")
  const [mounted, setMounted] = useState(false)
  const [editing, setEditing] = useState(false)

  const [editWord, setEditWord] = useState("")
  const [editDefinition, setEditDefinition] =
    useState("")
  const [editExample, setEditExample] =
    useState("")
  const [editNotes, setEditNotes] =
    useState("")

  const loadWords = () => {
    const manager =
      CustomVocabularyManager.getInstance()

    setWords(manager.getCustomWords())
  }

  useEffect(() => {
    const initialize = async () => {
      const manager =
        CustomVocabularyManager.getInstance()

      await manager.ready()

      loadWords()
      setMounted(true)
    }

    initialize()
  }, [])

  const speak = (text: string) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !text.trim()
    ) {
      return
    }

    window.speechSynthesis.cancel()

    const voices =
      window.speechSynthesis.getVoices()

    const englishVoices = voices.filter(
      (voice) =>
        voice.lang
          .toLowerCase()
          .startsWith("en")
    )

    const preferredVoice =
      englishVoices.find((voice) =>
        /Google US English/i.test(
          voice.name
        )
      ) ||
      englishVoices.find((voice) =>
        /Microsoft.*English.*Online/i.test(
          voice.name
        )
      ) ||
      englishVoices.find(
        (voice) =>
          voice.lang
            .toLowerCase() === "en-us"
      ) ||
      englishVoices[0]

    const utterance =
      new SpeechSynthesisUtterance(text)

    utterance.lang = "en-US"
    utterance.rate = 0.85
    utterance.pitch = 1

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    window.speechSynthesis.speak(
      utterance
    )
  }

  const openWord = (word: CustomWord) => {
    setSelectedWord(word)
    setEditing(false)
  }

  const startEditing = () => {
    if (!selectedWord) return

    setEditWord(selectedWord.word)
    setEditDefinition(
      selectedWord.definition
    )
    setEditExample(
      selectedWord.exampleSentence || ""
    )
    setEditNotes(
      selectedWord.notes || ""
    )

    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
  }

  const saveEditing = () => {
    if (!selectedWord) return

    const trimmedWord = editWord.trim()
    const trimmedDefinition =
      editDefinition.trim()

    if (
      !trimmedWord ||
      !trimmedDefinition
    ) {
      return
    }

    const manager =
      CustomVocabularyManager.getInstance()

    manager.updateWord(
      selectedWord.id,
      {
        word: trimmedWord,
        definition: trimmedDefinition,
        exampleSentence:
          editExample.trim(),
        notes:
          editNotes.trim() || undefined,
      }
    )

    const updatedWord =
      manager.getWordById(
        selectedWord.id
      )

    if (updatedWord) {
      setSelectedWord(updatedWord)
    }

    loadWords()
    setEditing(false)
  }

  const filteredWords = words.filter(
    (word) => {
      const query =
        search.toLowerCase().trim()

      if (!query) return true

      return (
        word.word
          .toLowerCase()
          .includes(query) ||
        word.definition
          .toLowerCase()
          .includes(query) ||
        (word.exampleSentence || "")
          .toLowerCase()
          .includes(query) ||
        (word.notes || "")
          .toLowerCase()
          .includes(query)
      )
    }
  )

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← ホーム
          </Link>

          <h1 className="text-2xl font-bold">
            単語帳
          </h1>

          <Link
            href="/manage"
            className="text-sm text-muted-foreground hover:underline"
          >
            ＋単語登録
          </Link>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="単語を検索..."
          className="mb-6 w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
        />

        <p className="mb-4 text-sm text-muted-foreground">
          {filteredWords.length} words
        </p>

        {/* Empty */}
        {filteredWords.length === 0 && (
          <div className="rounded-xl border border-border p-8 text-center">
            {words.length === 0 ? (
              <>
                <p className="font-medium">
                  まだ単語がありません
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  覚えたい英単語を登録してください。
                </p>

                <Link
                  href="/manage"
                  className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-primary-foreground"
                >
                  単語を登録する
                </Link>
              </>
            ) : (
              <p className="text-muted-foreground">
                該当する単語がありません。
              </p>
            )}
          </div>
        )}

        {/* Word List */}
        <div className="divide-y divide-border rounded-xl border border-border">
          {filteredWords.map(
            (word) => (
              <button
                key={word.id}
                type="button"
                onClick={() =>
                  openWord(word)
                }
                className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {word.word}
                  </p>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {word.definition}
                  </p>
                </div>

                <span className="ml-4 text-muted-foreground">
                  →
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Detail / Edit Modal */}
      {selectedWord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => {
            setSelectedWord(null)
            setEditing(false)
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-background p-6 shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {!editing ? (
              <>
                {/* Detail */}
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold">
                    {selectedWord.word}
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      speak(
                        selectedWord.word
                      )
                    }
                    className="rounded-full border px-3 py-2 hover:bg-muted"
                    title="単語を再生"
                  >
                    🔊
                  </button>
                </div>

                {/* Definition */}
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    意味
                  </p>

                  <p className="mt-1 text-lg">
                    {selectedWord.definition}
                  </p>
                </div>

                {/* Example */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      例文
                    </p>

                    {selectedWord.exampleSentence && (
                      <button
                        type="button"
                        onClick={() =>
                          speak(
                            selectedWord.exampleSentence
                          )
                        }
                        className="rounded-full border px-3 py-2 hover:bg-muted"
                        title="例文を再生"
                      >
                        🔊
                      </button>
                    )}
                  </div>

                  <p className="mt-2 rounded-lg bg-muted p-4 leading-relaxed">
                    {selectedWord.exampleSentence ||
                      "例文はまだ登録されていません。"}
                  </p>
                </div>

                {/* Notes */}
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    メモ
                  </p>

                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted p-4 leading-relaxed">
                    {selectedWord.notes ||
                      "メモはありません。"}
                  </p>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={startEditing}
                    className="flex-1 rounded-lg bg-primary px-4 py-3 text-primary-foreground"
                  >
                    編集
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedWord(null)
                    }
                    className="flex-1 rounded-lg border border-border px-4 py-3"
                  >
                    閉じる
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Edit */}
                <h2 className="text-2xl font-bold">
                  単語を編集
                </h2>

                {/* Word */}
                <div className="mt-6">
                  <label className="mb-1 block text-sm font-medium">
                    単語
                  </label>

                  <input
                    type="text"
                    value={editWord}
                    onChange={(event) =>
                      setEditWord(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Definition */}
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium">
                    意味
                  </label>

                  <input
                    type="text"
                    value={editDefinition}
                    onChange={(event) =>
                      setEditDefinition(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Example */}
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium">
                    例文
                  </label>

                  <textarea
                    value={editExample}
                    onChange={(event) =>
                      setEditExample(
                        event.target.value
                      )
                    }
                    rows={4}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Notes */}
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium">
                    メモ
                  </label>

                  <textarea
                    value={editNotes}
                    onChange={(event) =>
                      setEditNotes(
                        event.target.value
                      )
                    }
                    rows={4}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Edit Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={saveEditing}
                    disabled={
                      !editWord.trim() ||
                      !editDefinition.trim()
                    }
                    className="flex-1 rounded-lg bg-primary px-4 py-3 text-primary-foreground disabled:opacity-50"
                  >
                    保存
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex-1 rounded-lg border border-border px-4 py-3"
                  >
                    キャンセル
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}