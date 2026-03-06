"use client"

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from "react"
import { FileText, Paperclip, Send, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/types"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MessageThreadProps {
  messages: Message[]
  onSend: (content: string, attachments?: File[]) => void
  currentUserId: string
  orderContext: { orderId: string; orderRef: string }
  isReadOnly?: boolean
  maxHeight?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

/** Returns a label like "Today", "Yesterday", or "March 3" */
function dayLabel(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.round((today.getTime() - msgDay.getTime()) / 86_400_000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  return date.toLocaleDateString([], { month: "long", day: "numeric" })
}

/** Returns "YYYY-MM-DD" key used to group by day */
function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-2 py-1">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message
  isOwn: boolean
}) {
  return (
    <div className={cn("flex gap-2.5", isOwn && "flex-row-reverse")}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        {message.senderAvatar && (
          <AvatarImage src={message.senderAvatar} alt={message.senderName} />
        )}
        <AvatarFallback
          className={cn(
            "text-xs font-semibold",
            message.senderRole === "provider"
              ? "bg-teal-500 text-white"
              : "bg-sage-500 text-white"
          )}
        >
          {getInitials(message.senderName)}
        </AvatarFallback>
      </Avatar>

      {/* Content column */}
      <div className={cn("flex max-w-[72%] flex-col gap-1", isOwn && "items-end")}>
        {/* Sender name + role badge + timestamp */}
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs",
            isOwn && "flex-row-reverse"
          )}
        >
          <span className="font-medium text-warm-800">{message.senderName}</span>
          <Badge
            variant="secondary"
            className="px-1.5 py-0 text-[10px] leading-4 capitalize"
          >
            {message.senderRole}
          </Badge>
          <span className="text-warm-300 tabular-nums">{formatTime(message.createdAt)}</span>
        </div>

        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed text-warm-800",
            isOwn
              ? "rounded-tr-sm bg-sage-100"
              : "rounded-tl-sm bg-warm-100"
          )}
        >
          {message.content}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-col gap-1.5 w-full">
            {message.attachments.map((att, i) => (
              <a
                key={i}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-warm-800 transition-colors hover:bg-secondary",
                  isOwn && "self-end"
                )}
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate font-medium">{att.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  {formatFileSize(att.size)}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PendingAttachmentPill({
  file,
  onRemove,
}: {
  file: File
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-warm-800">
      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="max-w-[120px] truncate">{file.name}</span>
      <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full text-muted-foreground hover:text-warm-800"
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MessageThread({
  messages,
  onSend,
  currentUserId,
  orderContext,
  isReadOnly = false,
  maxHeight = "400px",
}: MessageThreadProps) {
  const [draft, setDraft] = useState("")
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // Auto-grow textarea
  const handleDraftChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = "auto"
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
    }
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = draft.trim()
    if (!trimmed && pendingFiles.length === 0) return
    onSend(trimmed, pendingFiles.length > 0 ? pendingFiles : undefined)
    setDraft("")
    setPendingFiles([])
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [draft, pendingFiles, onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Cmd/Ctrl+Enter sends; plain Enter adds newline
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setPendingFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    // Reset input so same file can be re-selected
    e.target.value = ""
  }, [])

  const removeFile = useCallback((index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // Group messages by day and inject date separators
  const grouped: Array<{ type: "separator"; label: string } | { type: "message"; message: Message }> = []
  let lastKey = ""
  for (const msg of messages) {
    const key = dayKey(msg.createdAt)
    if (key !== lastKey) {
      grouped.push({ type: "separator", label: dayLabel(msg.createdAt) })
      lastKey = key
    }
    grouped.push({ type: "message", message: msg })
  }

  const canSend = draft.trim().length > 0 || pendingFiles.length > 0

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
      {/* Order context header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-secondary/40">
        <span className="text-xs font-medium text-muted-foreground">
          Messages · Order{" "}
          <span className="font-semibold text-warm-800">{orderContext.orderRef}</span>
        </span>
        {isReadOnly && (
          <Badge variant="outline" className="text-[10px] py-0">
            Read-only
          </Badge>
        )}
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-4 overflow-y-auto px-4 py-4"
        style={{ maxHeight }}
      >
        {grouped.length === 0 || (grouped.length === 1 && grouped[0].type === "separator") ? (
          <div className="flex flex-1 items-center justify-center py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation.
            </p>
          </div>
        ) : (
          grouped.map((item, i) =>
            item.type === "separator" ? (
              <DateSeparator key={`sep-${i}`} label={item.label} />
            ) : (
              <MessageBubble
                key={item.message.id}
                message={item.message}
                isOwn={item.message.senderId === currentUserId}
              />
            )
          )
        )}
      </div>

      {/* Compose area — hidden in read-only mode */}
      {!isReadOnly && (
        <div className="border-t border-border">
          {/* Pending attachment pills */}
          {pendingFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
              {pendingFiles.map((f, i) => (
                <PendingAttachmentPill
                  key={i}
                  file={f}
                  onRemove={() => removeFile(i)}
                />
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 px-3 py-2.5">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              aria-label="Attach files"
            />

            {/* Attach button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-warm-800"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach a file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={handleDraftChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message… (⌘↵ to send)"
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-warm-800 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              style={{ minHeight: "38px", maxHeight: "120px" }}
            />

            {/* Send button */}
            <Button
              type="button"
              size="icon"
              disabled={!canSend}
              onClick={handleSend}
              className="shrink-0 bg-sage-500 text-white hover:bg-sage-400 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
