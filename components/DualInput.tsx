'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DualInputProps {
  onSendText: (text: string) => void
  onSendAudio: (audioBlob: Blob) => void
  disabled?: boolean
  placeholder?: string
}

export default function DualInput({ onSendText, onSendAudio, disabled = false, placeholder = 'Escribe tu respuesta...' }: DualInputProps) {
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text')
  const [textValue, setTextValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px'
    }
  }, [textValue])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isRecording])

  const handleSendText = () => {
    if (textValue.trim() && !disabled) {
      onSendText(textValue.trim())
      setTextValue('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        onSendAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        setRecordingTime(0)
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('No se pudo acceder al micrófono. Por favor, otorga los permisos necesarios.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4">
      {/* Mode Selector */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setInputMode('text')}
          disabled={disabled || isRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            inputMode === 'text'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
          } ${(disabled || isRecording) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span>✍️</span>
          <span className="text-sm font-medium">Escribir</span>
        </button>

        <button
          onClick={() => setInputMode('voice')}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            inputMode === 'voice'
              ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span>🎤</span>
          <span className="text-sm font-medium">Hablar</span>
        </button>

        <div className="flex-1"></div>

        {/* Tips */}
        <div className="text-xs text-white/50">
          {inputMode === 'text' ? 'Shift+Enter para salto de línea' : 'Máximo 2 minutos'}
        </div>
      </div>

      {/* Input Area */}
      <AnimatePresence mode="wait">
        {inputMode === 'text' ? (
          <motion.div
            key="text-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-end gap-3"
          >
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={placeholder}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '50px', maxHeight: '150px' }}
            />

            <button
              onClick={handleSendText}
              disabled={disabled || !textValue.trim()}
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                disabled || !textValue.trim()
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transform hover:scale-105'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="voice-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-8"
          >
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={disabled}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all ${
                  disabled
                    ? 'bg-white/5 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transform hover:scale-110 animate-pulse'
                }`}
              >
                🎤
              </button>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {/* Recording Animation */}
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-4xl"
                  >
                    🎙️
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 rounded-full bg-red-500"
                  />
                </div>

                {/* Timer */}
                <div className="text-2xl font-bold text-white">
                  {formatTime(recordingTime)}
                </div>

                {/* Stop Button */}
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
                >
                  ⏹️ Detener Grabación
                </button>
              </div>
            )}

            {!isRecording && (
              <p className="text-white/60 text-sm mt-4 text-center">
                {disabled ? 'Espera a que la IA procese la pregunta' : 'Presiona el micrófono para comenzar a grabar'}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Count (only for text mode) */}
      {inputMode === 'text' && textValue.length > 0 && (
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className={`${
            textValue.length > 500 ? 'text-yellow-400' : 'text-white/40'
          }`}>
            {textValue.length} caracteres
          </span>
          {textValue.length > 500 && (
            <span className="text-yellow-400">
              💡 Las respuestas muy largas pueden perder impacto
            </span>
          )}
        </div>
      )}
    </div>
  )
}
