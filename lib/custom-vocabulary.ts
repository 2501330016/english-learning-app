import { get, set, createStore } from "idb-keyval"
import type { VocabularyWord } from "./vocabulary-data"

export interface CustomWord
  extends Omit<VocabularyWord, "id"> {
  id: string
  isCustom: true
  createdAt: Date
  createdBy: string
  notes?: string
  audioBlob?: Blob | null
  audioUrl?: string
}

const STORE_NAME = "custom-vocab"
const STORE_KEY = "customVocabulary"

export class CustomVocabularyManager {
  private static instance: CustomVocabularyManager
  private customWords: CustomWord[] = []
  private store =
    typeof window !== "undefined"
      ? createStore("english-learning-app", STORE_NAME)
      : undefined

  private readyPromise: Promise<void> | null = null
  private readyResolve: (() => void) | null = null

  private constructor() {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(STORE_KEY)

        if (saved) {
          const parsed: unknown = JSON.parse(saved)

          if (Array.isArray(parsed)) {
            this.customWords = parsed.map((word: unknown) => {
              const obj = word as Partial<CustomWord>

              return {
                ...(obj as CustomWord),
                createdAt: obj.createdAt
                  ? new Date(obj.createdAt as unknown as string)
                  : new Date(),
                exampleSentence:
                  typeof obj.exampleSentence === "string"
                    ? obj.exampleSentence
                    : "",
              }
            })
          }
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve
    })

    this.loadCustomWords()
  }

  static getInstance(): CustomVocabularyManager {
    if (!CustomVocabularyManager.instance) {
      CustomVocabularyManager.instance =
        new CustomVocabularyManager()
    }

    return CustomVocabularyManager.instance
  }

  private loadCustomWords(): void {
    if (typeof window === "undefined") {
      this.readyResolve?.()
      this.readyResolve = null
      return
    }

    const finishReady = () => {
      if (this.readyResolve) {
        this.readyResolve()
        this.readyResolve = null
      }
    }

    if (!this.store) {
      finishReady()
      return
    }

    get(STORE_KEY, this.store)
      .then((saved: unknown) => {
        if (Array.isArray(saved)) {
          this.customWords = saved.map((word: unknown) => {
            const obj = word as Partial<CustomWord>

            return {
              ...(obj as CustomWord),
              createdAt: obj.createdAt
                ? new Date(obj.createdAt as unknown as string)
                : new Date(),
              exampleSentence:
                typeof obj.exampleSentence === "string"
                  ? obj.exampleSentence
                  : "",
            }
          })
        }
      })
      .catch(() => {
        // Keep localStorage data if IndexedDB fails
      })
      .finally(() => {
        finishReady()
      })
  }

  async ready(): Promise<void> {
    if (!this.readyPromise) {
      return Promise.resolve()
    }

    return this.readyPromise
  }

  private saveCustomWords(): void {
    if (typeof window === "undefined") return

    if (this.store) {
      set(STORE_KEY, this.customWords, this.store).catch(() => {
        try {
          localStorage.setItem(
            STORE_KEY,
            JSON.stringify(this.customWords)
          )
        } catch {
          // Ignore storage errors
        }
      })
    } else {
      try {
        localStorage.setItem(
          STORE_KEY,
          JSON.stringify(this.customWords)
        )
      } catch {
        // Ignore storage errors
      }
    }
  }

  addWord(
    wordData: Omit<
      CustomWord,
      "id" | "isCustom" | "createdAt" | "createdBy"
    >
  ): CustomWord {
    const newWord: CustomWord = {
      ...wordData,

      id: `custom_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`,

      isCustom: true,
      createdAt: new Date(),
      createdBy: "user",

      exampleSentence: wordData.exampleSentence || "",
    }

    this.customWords.push(newWord)
    this.saveCustomWords()

    return newWord
  }

  updateWord(
    id: string,
    updates: Partial<
      Omit<
        CustomWord,
        "id" | "isCustom" | "createdAt" | "createdBy"
      >
    >
  ): boolean {
    const index = this.customWords.findIndex(
      (word) => word.id === id
    )

    if (index === -1) return false

    this.customWords[index] = {
      ...this.customWords[index],
      ...updates,
      exampleSentence:
        updates.exampleSentence ??
        this.customWords[index].exampleSentence ??
        "",
    }

    this.saveCustomWords()

    return true
  }

  deleteWord(id: string): boolean {
    const index = this.customWords.findIndex(
      (word) => word.id === id
    )

    if (index === -1) return false

    this.customWords.splice(index, 1)
    this.saveCustomWords()

    return true
  }

  getCustomWords(): CustomWord[] {
    return this.customWords.map((word) => {
      const copy = { ...word }

      if (
        !copy.audioUrl &&
        copy.audioBlob instanceof Blob
      ) {
        try {
          copy.audioUrl = URL.createObjectURL(
            copy.audioBlob
          )
        } catch {
          // Ignore URL creation errors
        }
      }

      return copy
    })
  }

  getWordById(id: string): CustomWord | undefined {
    return this.customWords.find(
      (word) => word.id === id
    )
  }

  searchWords(query: string): CustomWord[] {
    const lowercaseQuery = query.toLowerCase()

    return this.customWords.filter(
      (word) =>
        word.word
          .toLowerCase()
          .includes(lowercaseQuery) ||
        word.definition
          .toLowerCase()
          .includes(lowercaseQuery) ||
        (word.exampleSentence || "")
          .toLowerCase()
          .includes(lowercaseQuery) ||
        (word.notes || "")
          .toLowerCase()
          .includes(lowercaseQuery)
    )
  }

  clearAllWords(): void {
    this.customWords = []
    this.saveCustomWords()
  }

  exportWords(): string {
    const exportable = this.customWords.map((word) => {
      const copy = {
        ...word,
        audioBlob: undefined,
        audioUrl: undefined,
      }

      return copy
    })

    return JSON.stringify(
      exportable,
      null,
      2
    )
  }

  importWords(
    jsonData: string
  ): {
    success: boolean
    imported: number
    errors: string[]
  } {
    try {
      const parsed: unknown = JSON.parse(jsonData)

      if (!Array.isArray(parsed)) {
        return {
          success: false,
          imported: 0,
          errors: [
            "Invalid format: expected an array of words",
          ],
        }
      }

      let imported = 0
      const errors: string[] = []

      parsed.forEach((item, index) => {
        try {
          if (
            typeof item !== "object" ||
            item === null
          ) {
            errors.push(
              `Word ${index + 1}: Invalid entry`
            )
            return
          }

          const data =
            item as Record<string, unknown>

          const word = data.word
          const definition = data.definition
          const exampleSentence =
            data.exampleSentence

          if (
            typeof word !== "string" ||
            typeof definition !== "string"
          ) {
            errors.push(
              `Word ${index + 1}: Word and definition are required`
            )
            return
          }

          this.addWord({
            word,
            definition,
            exampleSentence:
              typeof exampleSentence === "string"
                ? exampleSentence
                : "",
            blankPosition:
              typeof data.blankPosition === "number"
                ? data.blankPosition
                : 0,
            difficulty: "intermediate",
            category: "daily",
            partOfSpeech:
              typeof data.partOfSpeech === "string"
                ? data.partOfSpeech
                : "unknown",
            audioUrl:
              typeof data.audioUrl === "string"
                ? data.audioUrl
                : undefined,
            notes:
              typeof data.notes === "string"
                ? data.notes
                : undefined,
          })

          imported++
        } catch {
          errors.push(
            `Word ${index + 1}: Unknown error`
          )
        }
      })

      return {
        success: imported > 0,
        imported,
        errors,
      }
    } catch {
      return {
        success: false,
        imported: 0,
        errors: ["Invalid JSON format"],
      }
    }
  }
}