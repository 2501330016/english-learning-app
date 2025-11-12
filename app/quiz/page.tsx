"use client"

import { useState, useEffect } from "react"
import { QuizCard } from "@/components/quiz/quiz-card"
import { getRandomWords, type VocabularyWord } from "@/lib/vocabulary-data"
import { ProgressManager, type QuizResult } from "@/lib/user-progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function QuizPage() {
  // Single-question flow: load one random word, then fetch a new one on Next
  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Initialize with a single random word
    const random = getRandomWords(1)[0]
    setCurrentWord(random)
  }, [])

  const handleAnswer = (isCorrect: boolean, userAnswer: string, timeTaken: number) => {
    if (!currentWord) return
    const result: QuizResult = {
      wordId: currentWord.id,
      isCorrect,
      userAnswer,
      correctAnswer: currentWord.word,
      timestamp: new Date(),
      timeTaken,
    }

    // Record the result in progress manager
    const progressManager = ProgressManager.getInstance()
    progressManager.recordQuizResult(result, currentWord)

  // Add to results (use functional update to avoid stale closures)
  setQuizResults((prev) => [...prev, result])
    // Mark that a question was answered. Next must be pressed to get a new one.
    setQuestionsAnswered((n) => n + 1)
  }

  const handleNext = () => {
    // Fetch a fresh random word and replace the current one. Keeping the
    // previous results in quizResults allows the user to review later.
    const random = getRandomWords(1)[0]
    setCurrentWord(random)
  }

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Words Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">There are no vocabulary words available for the quiz.</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // prevent lint warning for quizResults not being used elsewhere
  void quizResults

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">TOEIC Quiz</h1>
                <p className="text-muted-foreground">Fill in the missing words</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Answered: {questionsAnswered}</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Single-question flow: always render the QuizCard for the current word */}
        <QuizCard
          key={currentWord.id}
          word={currentWord}
          onAnswer={handleAnswer}
          onNext={handleNext}
          isLastQuestion={false}
          questionNumber={1}
          totalQuestions={1}
        />
      </main>
    </div>
  )
}
