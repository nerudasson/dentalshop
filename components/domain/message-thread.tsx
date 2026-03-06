"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ThreadMessage {
  id: string
  senderRole: "client" | "provider"
  senderName: string
  content: string
  sentAt: Date
}

export interface MessageThreadProps {
  messages: ThreadMessage[]
  /** Role of the current user — determines which side to align messages */
  currentRole: "client" | "provider"
  /** Display name to use for outgoing messages */
  currentUserName?: string
  className?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

// ─── Single message bubble ────────────────────────────────────────────────────

function MessageBubble({
  message,
  isOwn,
}: {
  message: ThreadMessage
  isOwn: boolean
}) {
  return (
    <div className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
      {/* Avatar */}
      <Avatar className="mt-0.5 h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs font-semibold",
            message.senderRole === "client"
              ? "bg-sage-100 text-sage-800"
              : "bg-warm-100 text-warm-800"
          )}
        >
          {getInitials(message.senderName)}
        </AvatarFallback>
      </Avatar>

      {/* Bubble + meta */}
      <div className={cn("flex max-w-[75%] flex-col gap-1", isOwn && "items-end")}>
        {/* Sender + timestamp */}
        <div className={cn("flex items-baseline gap-2", isOwn && "flex-row-reverse")}>
          <span className="text-xs font-medium text-warm-700">{message.senderName}</span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {formatTime(message.sentAt)}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isOwn
              ? "rounded-tr-sm bg-sage-500 text-white"
              : "rounded-tl-sm bg-warm-100 text-warm-800"
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MessageThread({
  messages: initialMessages,
  currentRole,
  currentUserName = "You",
  className,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<ThreadMessage[]>(initialMessages)
  const [draft, setDraft] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSend() {
    const trimmed = draft.trim()
    if (!trimmed) return

    setMessages((prev: ThreadMessage[]) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        senderRole: currentRole,
        senderName: currentUserName,
        content: trimmed,
        sentAt: new Date(),
      },
    ])
    setDraft("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Message list */}
      <div className="flex flex-col gap-5">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation below.
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderRole === currentRole}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose area */}
      <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 focus-within:ring-1 focus-within:ring-ring">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="flex-1 resize-none bg-transparent px-2 py-1 text-sm text-warm-800 placeholder:text-muted-foreground focus:outline-none"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!draft.trim()}
          aria-label="Send message"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
