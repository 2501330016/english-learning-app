"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Play, Plus, List, Settings } from "lucide-react"
import { type UserProgress } from "@/lib/user-progress"
import { ProgressManager } from "@/lib/user-progress"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import Link from "next/link"
// WordCountDisplay removed from top; not used on compact home


export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const progressManager = ProgressManager.getInstance()
    setProgress(progressManager.getProgress())
  }, [])

  if (!mounted || !progress) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }


  return (
    <div className="min-h-screen bg-background">
      <InstallPrompt />

      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">TOEIC Master</h1>
              <p className="text-muted-foreground mt-1">Master English vocabulary for TOEIC success</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </Link>
              <Badge variant="secondary" className="text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                {progress.streakDays} day streak
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Prominent Start Quiz at top */}
        <div className="mb-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Start Quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Practice with fill-in-the-blank questions using TOEIC vocabulary</p>
              <Link href="/quiz">
                <Button className="w-full">Begin Practice Session</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions (compact) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5 text-primary" />
                Review Words
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Review your weak words and track your progress</p>
              <Link href="/review">
                <Button variant="outline" className="w-full bg-transparent">
                  Open Review Center
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add Custom Words
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Add your own vocabulary words and create custom quizzes</p>
              <Link href="/manage">
                <Button variant="outline" className="w-full bg-transparent">
                  Manage Vocabulary
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
