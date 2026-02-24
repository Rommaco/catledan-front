'use client'
import React, { useState, useRef, useEffect } from 'react'
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'
import { sendAssistantMessage } from '@/lib/assistant/assistantService'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
}

const WELCOME = 'Soy Dan, tu especialista veterinario y agropecuario en Catledan. Puedo ayudarte con dudas sobre ganado, cultivos, sanidad, reproducción, alimentación o cómo usar la plataforma. ¿En qué puedo ayudarte?'

export function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(([
    {
      id: 'welcome',
      role: 'assistant',
      text: WELCOME,
      timestamp: new Date(),
    },
  ] as Message[]))
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [open, messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.text }))
      const answer = await sendAssistantMessage(text, history)
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: answer,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No pude conectar con el asistente. Verifica tu conexión o intenta más tarde.'
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ ${msg}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-all hover:bg-green-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        title="Dan - Especialista veterinario y agropecuario"
        aria-label="Abrir Dan"
      >
        <ChatBubbleLeftRightIcon className="h-7 w-7" />
      </button>

      {/* Panel de chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-full max-w-md flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <span className="font-semibold">Dan — Especialista veterinario y agropecuario</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/20 transition-colors"
              aria-label="Cerrar"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto min-h-[280px] max-h-[360px] p-4 space-y-3 bg-gray-50"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm prose-gray max-w-none [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_ul]:my-1 [&_ol]:my-1 [&_p]:my-1">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-white border border-gray-200 px-4 py-2.5 text-sm text-gray-500">
                  Pensando...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Pregunta a Dan sobre ganado, cultivos, sanidad..."
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Enviar"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
