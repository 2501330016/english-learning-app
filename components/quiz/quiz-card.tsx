"use client"

import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { VocabularyWord } from "@/lib/vocabulary-data"

interface QuizCardProps {
  word: VocabularyWord
  onAnswer: (
    isCorrect: boolean,
    userAnswer: string,
    timeTaken: number
  ) => void
  onNext?: () => void
  isLastQuestion?: boolean
  questionNumber: number
  totalQuestions: number
}

export function QuizCard({
  word,
  onAnswer,
  onNext,
}: QuizCardProps) {
  const [userAnswer, setUserAnswer] =
    useState("")

  const [showResult, setShowResult] =
    useState(false)

  const [isCorrect, setIsCorrect] =
    useState(false)

  const [startTime] =
    useState(Date.now())

  const speak = (
    text: string,
    rate = 0.85
  ) => {
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

    const englishVoices =
      voices.filter((voice) =>
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
    utterance.rate = rate
    utterance.pitch = 1

    if (preferredVoice) {
      utterance.voice =
        preferredVoice
    }

    window.speechSynthesis.speak(
      utterance
    )
  }

  const createBlankSentence = () => {
    const sentence =
      word.exampleSentence || ""

    const target =
      word.word.trim()

    if (!sentence || !target) {
      return sentence
    }

    // First try to replace the exact word.
    const escapedTarget =
      target.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      )

    const regex = new RegExp(
      `\\b${escapedTarget}\\b`,
      "i"
    )

    if (regex.test(sentence)) {
      return sentence.replace(
        regex,
        "______"
      )
    }

    // Fallback to the saved blank position.
    const words =
      sentence.split(" ")

    if (
      word.blankPosition >= 0 &&
      word.blankPosition <
        words.length
    ) {
      words[word.blankPosition] =
        "______"

      return words.join(" ")
    }

    return sentence
  }

  const blankSentence =
    createBlankSentence()

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    const timeTaken = Math.floor(
      (Date.now() - startTime) / 1000
    )

    const correct =
      userAnswer
        .trim()
        .toLowerCase() ===
      word.word.trim().toLowerCase()

    setIsCorrect(correct)
    setShowResult(true)

    onAnswer(
      correct,
      userAnswer,
      timeTaken
    )
  }

  const handleKeyPress = (
    event: React.KeyboardEvent
  ) => {
    if (
      event.key === "Enter" &&
      userAnswer.trim() &&
      !showResult
    ) {
      handleSubmit()
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      {/* Definition */}
      <div className="mb-8 text-center">
        <p className="text-sm text-muted-foreground">
          Meaning
        </p>

        <p className="mt-2 text-2xl font-semibold">
          {word.definition}
        </p>
      </div>

      {/* Example */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">
            Complete the sentence
          </p>

          <button
            type="button"
            onClick={() =>
              speak(
                word.exampleSentence
              )
            }
            className="rounded-full border px-3 py-1 text-lg hover:bg-muted"
            title="Listen"
          >
            🔊
          </button>
        </div>

        <div className="rounded-lg border border-border bg-background p-5">
          <p className="text-lg leading-relaxed">
            {blankSentence
              .split("______")
              .map(
                (part, index, array) => (
                  <span key={index}>
                    {part}

                    {index <
                      array.length - 1 && (
                      <span className="inline-block">
                        {showResult ? (
                          <span
                            className={cn(
                              "mx-1 rounded px-2 py-1 font-semibold",
                              isCorrect
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            )}
                          >
                            {word.word}
                          </span>
                        ) : (
                          <Input
                            value={
                              userAnswer
                            }
                            onChange={(
                              event
                            ) =>
                              setUserAnswer(
                                event.target
                                  .value
                              )
                            }
                            onKeyDown={
                              handleKeyPress
                            }
                            className="mx-1 inline-block w-36 text-center"
                            autoFocus
                          />
                        )}
                      </span>
                    )}
                  </span>
                )
              )}
          </p>
        </div>
      </div>

      {/* Result */}
      {showResult && (
        <div
          className={cn(
            "mt-6 rounded-lg border p-4",
            isCorrect
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          )}
        >
          <p
            className={cn(
              "font-semibold",
              isCorrect
                ? "text-green-800"
                : "text-red-800"
            )}
          >
            {isCorrect
              ? "Correct!"
              : "Incorrect"}
          </p>

          {!isCorrect && (
            <p className="mt-2 text-sm">
              Your answer:{" "}
              <strong>
                {userAnswer}
              </strong>
            </p>
          )}

          <div className="mt-3 flex items-center gap-3">
            <span className="font-semibold">
              {word.word}
            </span>

            <button
              type="button"
              onClick={() =>
                speak(word.word)
              }
              className="rounded-full border px-3 py-1 hover:bg-background"
              title="Listen to pronunciation"
            >
              🔊
            </button>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-6">
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            className="w-full"
            size="lg"
          >
            答え合わせ
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (onNext) {
                onNext()
              }
            }}
            className="w-full"
            size="lg"
          >
            もう一問
          </Button>
        )}
      </div>
    </div>
  )
}