import { TextToSpeechClient } from "@google-cloud/text-to-speech"
import { NextResponse } from "next/server"

const client = new TextToSpeechClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const text = body.text

    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      )
    }

    const [response] =
      await client.synthesizeSpeech({
        input: {
          text: text.trim(),
        },
        voice: {
          languageCode: "en-US",
          name: "en-US-Neural2-F",
        },
        audioConfig: {
          audioEncoding: "MP3",
        },
      })

    if (!response.audioContent) {
      return NextResponse.json(
        { error: "No audio content returned" },
        { status: 500 }
      )
    }

    const audioBuffer =
      Buffer.from(
        response.audioContent as Uint8Array
      )

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error(
      "Text-to-Speech error:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to generate speech",
      },
      { status: 500 }
    )
  }
}