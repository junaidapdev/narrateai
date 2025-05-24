"use client"
import { Check } from "lucide-react"
import type { PostTone } from "@/actions/post-generation"

interface ToneSelectorProps {
  selectedTone: PostTone
  onChange: (tone: PostTone) => void
  disabled?: boolean
}

export default function ToneSelector({ selectedTone, onChange, disabled = false }: ToneSelectorProps) {
  const tones: { id: PostTone; name: string; description: string }[] = [
    {
      id: "professional",
      name: "Professional",
      description: "Polished, authoritative content for industry experts",
    },
    {
      id: "conversational",
      name: "Conversational",
      description: "Friendly, approachable content that feels natural",
    },
    {
      id: "inspirational",
      name: "Inspirational",
      description: "Motivational, story-driven content that inspires action",
    },
  ]

  return (
    <div className="space-y-3">
      <div className="text-sm text-[#888888]">Select post tone</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tones.map((tone) => (
          <div
            key={tone.id}
            className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
              selectedTone === tone.id
                ? "border-white bg-[#1C1C1E]"
                : "border-[#333333] bg-[#111111] hover:border-[#555555]"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => !disabled && onChange(tone.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-white">{tone.name}</h3>
              {selectedTone === tone.id && (
                <div className="bg-white rounded-full p-0.5">
                  <Check className="h-3 w-3 text-black" />
                </div>
              )}
            </div>
            <p className="text-sm text-[#888888]">{tone.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
