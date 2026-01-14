'use client'

import { motion } from 'framer-motion'

interface ChatBubbleProps {
  message: string
  sender: 'ai' | 'user'
  timestamp?: Date
  isTyping?: boolean
}

export default function ChatBubble({ message, sender, timestamp, isTyping = false }: ChatBubbleProps) {
  const isAI = sender === 'ai'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`flex items-start gap-3 max-w-[80%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${
          isAI 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
            : 'bg-gradient-to-br from-green-500 to-teal-600'
        }`}>
          {isAI ? '🤖' : '👤'}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
          <div className={`rounded-2xl px-4 py-3 ${
            isAI 
              ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white' 
              : 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
          }`}>
            {isTyping ? (
              <div className="flex items-center gap-1.5 py-2">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
            )}
          </div>

          {/* Timestamp */}
          {timestamp && !isTyping && (
            <span className="text-xs text-white/50 mt-1 px-2">
              {timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
