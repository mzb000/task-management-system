import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Loader2, MessageCircle, Sparkles, RefreshCw, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { chatApi } from '../api/client'

const SUGGESTIONS = [
  'What should I focus on?',
  'Summarize my tasks',
  'Any overdue tasks?',
  'Help me prioritize',
]

const WELCOME = "Hi! I'm TaskFlow AI. I know your tasks and can help you prioritize, plan, and stay productive. What can I help you with?"

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Text-to-speech
  const speak = useCallback((text) => {
    if (!voiceEnabled || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const clean = text.replace(/[*_#`~]/g, '').replace(/\n+/g, ' ')
    const utter = new SpeechSynthesisUtterance(clean)
    utter.lang = 'en-US'
    utter.rate = 1.05
    utter.pitch = 1
    utter.onstart = () => setSpeaking(true)
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }, [voiceEnabled])

  // Stop speaking when chat closes
  useEffect(() => {
    if (!open) {
      window.speechSynthesis?.cancel()
      setSpeaking(false)
    }
  }, [open])

  // Speech-to-text
  const toggleListen = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      alert('Your browser does not support voice input. Please use Chrome.')
      return
    }
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(prev => prev ? prev + ' ' + transcript : transcript)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [listening])

  const send = async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    setInput('')
    const newMessages = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const r = await chatApi.send(newMessages)
      const reply = r.data.message
      setMessages(m => [...m, { role: 'assistant', content: reply }])
      speak(reply)
    } catch (e) {
      const detail = e.response?.data?.detail || ''
      const errMsg = detail.includes('not configured') || e.response?.status === 503
        ? 'AI is not configured yet. Add your DEEPSEEK_API_KEY to backend/.env and restart the backend.'
        : 'Something went wrong. Please try again.'
      setMessages(m => [...m, { role: 'assistant', content: errMsg }])
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    setMessages([{ role: 'assistant', content: WELCOME }])
  }

  const toggleVoice = () => {
    if (voiceEnabled) {
      window.speechSynthesis?.cancel()
      setSpeaking(false)
    }
    setVoiceEnabled(v => !v)
  }

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-xl shadow-brand-600/30 flex items-center justify-center bg-gradient-to-br from-brand-600 to-violet-600 text-white"
        aria-label="AI Chat"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={open ? 'x' : 'chat'}
            initial={{ rotate: -80, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 80, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.14 }}
          >
            {open ? <X size={20} /> : <MessageCircle size={20} />}
          </motion.div>
        </AnimatePresence>
        {!open && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-emerald-500 rounded-full border-2 border-white text-[9px] font-bold flex items-center justify-center">
            {messages.filter(m => m.role === 'assistant').length - 1}
          </span>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="fixed bottom-20 right-6 z-50 w-[340px] sm:w-[370px] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 to-violet-600 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm leading-none">TaskFlow AI</p>
                <p className="text-white/65 text-xs mt-0.5 flex items-center gap-1">
                  Powered by DeepSeek
                  {speaking && (
                    <span className="flex gap-0.5 ml-1">
                      {[0,1,2].map(i => (
                        <span key={i} className="w-0.5 h-2 bg-white/80 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 100}ms` }} />
                      ))}
                    </span>
                  )}
                </p>
              </div>
              {/* Voice toggle */}
              <button
                onClick={toggleVoice}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title={voiceEnabled ? 'Disable voice output' : 'Enable voice output'}
              >
                {voiceEnabled ? <Volume2 size={13} className="text-white" /> : <VolumeX size={13} className="text-white/50" />}
              </button>
              <button onClick={reset} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="New conversation">
                <RefreshCw size={13} className="text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 mb-0.5">
                      <Bot size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-md'
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
                    {[0, 150, 300].map(delay => (
                      <span key={delay} className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && !loading && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-xs px-2.5 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg border border-brand-100 dark:border-brand-800/50 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors font-medium">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
              {listening && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="flex gap-0.5">
                    {[0,1,2,3].map(i => (
                      <span key={i} className="w-0.5 h-3 bg-red-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 80}ms` }} />
                    ))}
                  </span>
                  <span className="text-xs text-red-500 font-medium">Listening...</span>
                </div>
              )}
              <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder={listening ? 'Listening...' : 'Ask anything or use mic...'}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-brand-400 transition-all"
                  disabled={loading}
                />
                {/* Mic button */}
                <motion.button
                  type="button"
                  onClick={toggleListen}
                  whileTap={{ scale: 0.9 }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    listening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
                  }`}
                  title={listening ? 'Stop listening' : 'Voice input'}
                >
                  {listening ? <MicOff size={14} /> : <Mic size={14} />}
                </motion.button>
                {/* Send button */}
                <motion.button
                  type="submit"
                  disabled={!input.trim() || loading}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-brand-700 transition-colors flex-shrink-0"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
