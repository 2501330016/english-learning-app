"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CustomVocabularyManager, CustomWord } from "@/lib/custom-vocabulary"
import { QuizCard } from "@/components/quiz/quiz-card"
import { Button } from "@/components/ui/button"

export default function QuizPage() {
  const [words, setWords] = useState<CustomWord[]>([])
  const [currentWord, setCurrentWord] = useState<CustomWord | null>(null)
  const [mounted, setMounted] = useState(false)

  const loadWords = () => {
    const manager = CustomVocabularyManager.getInstance()

    const availableWords = manager
      .getCustomWords()
      .filter(
        (word) =>
          word.exampleSentence &&
          word.exampleSentence.trim().length > 0
      )

    setWords(availableWords)

    if (availableWords.length > 0) {
      const random =
        availableWords[
          Math.floor(
            Math.random() * availableWords.length
          )
        ]

      setCurrentWord(random)
    } else {
      setCurrentWord(null)
    }
  }

  useEffect(() => {
    const initialize = async () => {
      setMounted(true)

      const manager =
        CustomVocabularyManager.getInstance()

      await manager.ready()

      loadWords()
    }

    initialize()
  }, [])

  const handleNext = () => {
    if (words.length === 0) return

    const random =
      words[
        Math.floor(
          Math.random() * words.length
        )
      ]

    setCurrentWord(random)
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!currentWord) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold">
            テスト
          </h1>

          <p className="mt-4 text-muted-foreground">
            テストできる単語がありません。
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            例文を登録した単語がテストに出題されます。
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link href="/manage">
              <Button>
                単語を登録する
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline">
                ホーム
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← ホーム
          </Link>

          <h1 className="text-2xl font-bold">
            テスト
          </h1>

          <div className="w-12" />
        </div>

        <QuizCard
          key={currentWord.id}
          word={currentWord}
          onAnswer={() => {}}
          onNext={handleNext}
          isLastQuestion={false}
          questionNumber={1}
          totalQuestions={1}
        />
      </div>
    </main>
  )
}