'use client'
import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

  const chatOverlay = open && typeof document !== 'undefined' && createPortal(
    <>
      {/* Fondo oscuro (backdrop) - entra con fade */}
      <button
        type="button"
        aria-label="Cerrar chat"
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-[9998] bg-black/40 sm:bg-black/30 backdrop-blur-[2px] animate-fade-in"
      />
      {/* Panel - entra con slide desde abajo (móvil) / desde la derecha (desktop) */}
      <div
        className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:top-auto sm:left-auto z-[9999] flex flex-col bg-white shadow-2xl overflow-hidden border-0 sm:border sm:border-gray-200 sm:rounded-2xl w-full sm:max-w-md sm:max-h-[calc(100vh-7rem)] h-full sm:h-auto shrink-0 animate-slide-up sm:animate-slide-right"
      >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-3 sm:px-4 text-white shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <ChatBubbleLeftRightIcon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
              <span className="font-semibold text-sm sm:text-base truncate">
                <span className="sm:hidden">Dan — Asistente</span>
                <span className="hidden sm:inline">Dan — Especialista veterinario y agropecuario</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 hover:bg-white/20 transition-colors shrink-0"
              aria-label="Cerrar"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Mensajes - en móvil ocupa todo el espacio hasta el input; en desktop máx 320px */}
          <div
            ref={listRef}
            className="flex-1 min-h-0 overflow-y-auto sm:flex-initial sm:min-h-0 sm:max-h-[320px] p-3 sm:p-4 space-y-3 bg-gray-50"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm ${
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
              <div className="flex justify-start animate-fade-in">
                <div className="rounded-2xl rounded-bl-md bg-white border border-gray-200 px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:300ms]" />
                  </span>
                  <span>Pensando...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input - siempre pegado abajo */}
          <div className="border-t border-gray-200 p-2 sm:p-3 bg-white shrink-0 mt-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Pregunta a Dan..."
                className="flex-1 min-w-0 rounded-xl border border-gray-300 px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Enviar"
              >
                <PaperAirplaneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
    </>,
    document.body
  )

  return (
    <>
      {/* Botón flotante - responsive */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-all hover:bg-green-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        title="Dan - Especialista veterinario y agropecuario"
        aria-label="Abrir Dan"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>
      {chatOverlay}
    </>
  )
}
