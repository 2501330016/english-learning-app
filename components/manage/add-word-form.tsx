"use client"

import { useState } from "react"
import { CustomVocabularyManager } from "@/lib/custom-vocabulary"
import { Button } from "@/components/ui/button"

interface AddWordFormProps {
  onWordAdded: () => void
}

export function AddWordForm({
  onWordAdded,
}: AddWordFormProps) {
  const [word, setWord] = useState("")
  const [definition, setDefinition] = useState("")
  const [exampleSentence, setExampleSentence] =
    useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const trimmedWord = word.trim()
    const trimmedDefinition =
      definition.trim()

    if (
      !trimmedWord ||
      !trimmedDefinition
    ) {
      return
    }

    const manager =
      CustomVocabularyManager.getInstance()

    manager.addWord({
      word: trimmedWord,
      definition: trimmedDefinition,
      exampleSentence:
        exampleSentence.trim(),
      notes:
        notes.trim() || undefined,

      blankPosition: 0,
      difficulty: "intermediate",
      category: "daily",
      partOfSpeech: "unknown",
    })

    setWord("")
    setDefinition("")
    setExampleSentence("")
    setNotes("")

    onWordAdded()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-5"
    >
      <div>
        <label className="block text-sm font-medium mb-1">
          Word
        </label>

        <input
          type="text"
          value={word}
          onChange={(event) =>
            setWord(event.target.value)
          }
          placeholder="e.g. handle"
          className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Meaning
        </label>

        <input
          type="text"
          value={definition}
          onChange={(event) =>
            setDefinition(
              event.target.value
            )
          }
          placeholder="e.g. 対応する、処理する"
          className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Example sentence
        </label>

        <textarea
          value={exampleSentence}
          onChange={(event) =>
            setExampleSentence(
              event.target.value
            )
          }
          placeholder="後から追加することもできます"
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Memo
        </label>

        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          placeholder="自分用のメモ"
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
      >
        Add word
      </Button>
    </form>
  )
}