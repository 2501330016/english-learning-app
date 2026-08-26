// components/manage/word-list.tsx
"use client"

import { useEffect, useState } from "react"
import {
  CustomVocabularyManager,
  CustomWord,
} from "@/lib/custom-vocabulary"

interface WordListProps {
  words?: CustomWord[]
  onRefresh?: () => void
}

export function WordList({
  words,
  onRefresh,
}: WordListProps) {
  const [customWords, setCustomWords] =
    useState<CustomWord[]>(words || [])

  const [selectedWord, setSelectedWord] =
    useState<CustomWord | null>(null)

  const [isEditing, setIsEditing] =
    useState(false)

  const [editWord, setEditWord] =
    useState("")

  const [editDefinition, setEditDefinition] =
    useState("")

  const [editExample, setEditExample] =
    useState("")

  const [editNotes, setEditNotes] =
    useState("")

  useEffect(() => {
    setCustomWords(words || [])
  }, [words])

  const speak = (text: string) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !text.trim()
    ) {
      return
    }

    window.speechSynthesis.cancel()

    const utterance =
      new SpeechSynthesisUtterance(text)

    utterance.lang = "en-US"
    utterance.rate = 0.9

    window.speechSynthesis.speak(
      utterance
    )
  }

  const openWord = (word: CustomWord) => {
    setSelectedWord(word)
    setIsEditing(false)
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

    setIsEditing(true)
  }

  const saveEdit = () => {
    if (!selectedWord) return

    const trimmedWord =
      editWord.trim()

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
        definition:
          trimmedDefinition,
        exampleSentence:
          editExample.trim(),
        notes:
          editNotes.trim() ||
          undefined,
      }
    )

    const updatedWords =
      manager.getCustomWords()

    setCustomWords(updatedWords)

    const updatedWord =
      updatedWords.find(
        (word) =>
          word.id === selectedWord.id
      )

    if (updatedWord) {
      setSelectedWord(updatedWord)
    }

    setIsEditing(false)
    onRefresh?.()
  }

  const handleDelete = () => {
    if (!selectedWord) return

    const confirmed =
      window.confirm(
        `「${selectedWord.word}」を削除しますか？`
      )

    if (!confirmed) return

    const manager =
      CustomVocabularyManager.getInstance()

    manager.deleteWord(
      selectedWord.id
    )

    setCustomWords(
      manager.getCustomWords()
    )

    setSelectedWord(null)
    setIsEditing(false)

    onRefresh?.()
  }

  if (customWords.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>まだ単語がありません。</p>
        <p className="mt-2 text-sm">
          「Add Words」から単語を追加してください。
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      {/* Word list */}
      <div className="space-y-2">
        {customWords.map((word) => {
          const isSelected =
            selectedWord?.id === word.id

          return (
            <button
              key={word.id}
              type="button"
              onClick={() =>
                openWord(word)
              }
              className={`w-full rounded-lg border p-3 text-left transition ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted"
              }`}
            >
              <div className="font-semibold">
                {word.word}
              </div>

              <div className="mt-1 text-sm text-muted-foreground">
                {word.definition}
              </div>
            </button>
          )
        })}
      </div>

      {/* Detail */}
      <div className="rounded-lg border border-border p-5">
        {!selectedWord ? (
          <div className="flex min-h-[300px] items-center justify-center text-center text-muted-foreground">
            <p>
              左から単語を選択してください。
            </p>
          </div>
        ) : isEditing ? (
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Word
              </label>

              <input
                value={editWord}
                onChange={(event) =>
                  setEditWord(
                    event.target.value
                  )
                }
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Meaning
              </label>

              <input
                value={editDefinition}
                onChange={(event) =>
                  setEditDefinition(
                    event.target.value
                  )
                }
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Example sentence
              </label>

              <textarea
                value={editExample}
                onChange={(event) =>
                  setEditExample(
                    event.target.value
                  )
                }
                rows={4}
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Memo
              </label>

              <textarea
                value={editNotes}
                onChange={(event) =>
                  setEditNotes(
                    event.target.value
                  )
                }
                rows={4}
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
              >
                Save
              </button>

              <button
                type="button"
                onClick={() =>
                  setIsEditing(false)
                }
                className="rounded-md border border-border px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">
                    {selectedWord.word}
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      speak(
                        selectedWord.word
                      )
                    }
                    className="rounded-full border px-3 py-1 text-lg hover:bg-muted"
                    title="Pronounce word"
                  >
                    🔊
                  </button>
                </div>

                <p className="mt-2 text-lg text-muted-foreground">
                  {selectedWord.definition}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Example sentence
                </h3>

                {selectedWord.exampleSentence ? (
                  <div className="flex items-start gap-3 rounded-md bg-muted/50 p-4">
                    <p className="flex-1 leading-relaxed">
                      {
                        selectedWord.exampleSentence
                      }
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        speak(
                          selectedWord.exampleSentence
                        )
                      }
                      className="rounded-full border px-3 py-1 text-lg hover:bg-background"
                      title="Read example sentence"
                    >
                      🔊
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    例文はまだ登録されていません。
                  </p>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Memo
                </h3>

                {selectedWord.notes ? (
                  <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-4">
                    {selectedWord.notes}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    メモはありません。
                  </p>
                )}
              </section>
            </div>

            <div className="mt-8 flex gap-2 border-t pt-5">
              <button
                type="button"
                onClick={startEditing}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}