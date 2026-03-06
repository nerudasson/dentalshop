"use client"

import { useState } from "react"
import MessageThread from "@/components/domain/message-thread"
import type { Message } from "@/lib/types"

const CLIENT_ID = "user_client_001"
const PROVIDER_ID = "user_provider_001"

// Two days ago at various times
const d = (daysAgo: number, h: number, m: number) => {
  const dt = new Date()
  dt.setDate(dt.getDate() - daysAgo)
  dt.setHours(h, m, 0, 0)
  return dt
}

const INITIAL_MESSAGES: Message[] = [
  // ── Two days ago ──────────────────────────────────────────────────────────
  {
    id: "msg_001",
    content:
      "Hi! I've just submitted the order. I've attached the CBCT scan and the intraoral photos. Please let me know if you need anything else to get started.",
    senderId: CLIENT_ID,
    senderName: "Dr. Sarah Mitchell",
    senderRole: "client",
    createdAt: d(2, 9, 14),
    attachments: [
      { name: "CBCT_Scan_Mitchell.dcm", size: 18_432_000, url: "#" },
      { name: "Intraoral_Photos.zip", size: 4_210_000, url: "#" },
    ],
  },
  {
    id: "msg_002",
    content:
      "Thanks Dr. Mitchell! I've received the files and everything looks good. I'll start on the upper-right quadrant first. I'll have a preliminary preview ready for your review in about 2 days.",
    senderId: PROVIDER_ID,
    senderName: "Marco Ferretti",
    senderRole: "provider",
    createdAt: d(2, 11, 3),
  },
  {
    id: "msg_003",
    content:
      "Quick question — for the crown on tooth #14, should I match the shade to #13, or did you have a specific shade guide reading? The scan shows some variation.",
    senderId: PROVIDER_ID,
    senderName: "Marco Ferretti",
    senderRole: "provider",
    createdAt: d(2, 11, 47),
  },
  {
    id: "msg_004",
    content:
      "Good catch. Please use A2 for #14. I've attached the shade photos we took at the initial appointment for reference.",
    senderId: CLIENT_ID,
    senderName: "Dr. Sarah Mitchell",
    senderRole: "client",
    createdAt: d(2, 14, 22),
    attachments: [
      { name: "Shade_Reference_A2.jpg", size: 1_140_000, url: "#" },
    ],
  },

  // ── Yesterday ─────────────────────────────────────────────────────────────
  {
    id: "msg_005",
    content:
      "Here's the preliminary design for teeth #13–#15. I've kept the occlusal morphology conservative as requested. Please review and let me know if you'd like any adjustments to the contact points or emergence profile.",
    senderId: PROVIDER_ID,
    senderName: "Marco Ferretti",
    senderRole: "provider",
    createdAt: d(1, 10, 5),
    attachments: [
      { name: "Preview_Design_v1.stl", size: 3_890_000, url: "#" },
      { name: "Preview_Screenshots.pdf", size: 2_100_000, url: "#" },
    ],
  },
  {
    id: "msg_006",
    content:
      "The design looks great overall. One small request: can you open the contact point between #14 and #15 very slightly? The patient has been flossing that area and I want to make sure there's no issue post-placement.",
    senderId: CLIENT_ID,
    senderName: "Dr. Sarah Mitchell",
    senderRole: "client",
    createdAt: d(1, 15, 38),
  },
  {
    id: "msg_007",
    content:
      "Done! I've adjusted the contact point — added ~20 µm of clearance. Updated STL is attached.",
    senderId: PROVIDER_ID,
    senderName: "Marco Ferretti",
    senderRole: "provider",
    createdAt: d(1, 17, 12),
    attachments: [
      { name: "Preview_Design_v2.stl", size: 3_910_000, url: "#" },
    ],
  },

  // ── Today ─────────────────────────────────────────────────────────────────
  {
    id: "msg_008",
    content:
      "Perfect — I'm approving the design. Looking forward to the final files!",
    senderId: CLIENT_ID,
    senderName: "Dr. Sarah Mitchell",
    senderRole: "client",
    createdAt: d(0, 8, 55),
  },
]

export default function DemoMessageThreadPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)

  function handleSend(content: string, attachments?: File[]) {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      content,
      senderId: CLIENT_ID,
      senderName: "Dr. Sarah Mitchell",
      senderRole: "client",
      createdAt: new Date(),
      attachments: attachments?.map((f) => ({
        name: f.name,
        size: f.size,
        url: "#",
      })),
    }
    setMessages((prev) => [...prev, newMsg])
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-800">Message Thread</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo for{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">
            /components/domain/message-thread
          </code>
          . Viewing as Dr. Sarah Mitchell (client). Cmd/Ctrl+Enter or the
          send button to post.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Interactive thread (client POV) */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Client view — interactive
          </p>
          <MessageThread
            messages={messages}
            onSend={handleSend}
            currentUserId={CLIENT_ID}
            orderContext={{ orderId: "ord_001", orderRef: "ORD-2026-0042" }}
            maxHeight="480px"
          />
        </div>

        {/* Read-only admin view */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Admin view — read-only
          </p>
          <MessageThread
            messages={INITIAL_MESSAGES}
            onSend={() => {}}
            currentUserId="admin_000"
            orderContext={{ orderId: "ord_001", orderRef: "ORD-2026-0042" }}
            isReadOnly
            maxHeight="320px"
          />
        </div>
      </div>
    </div>
  )
}
