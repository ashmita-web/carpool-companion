import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { callGroqAPI } from '../lib/groq'
import { supabase } from '../lib/supabase'
import Button from '../components/UI/Button'
import ReactMarkdown from 'react-markdown'
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatAssistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your CarpoolCompanion AI assistant. I can help you find rides, offer rides, or answer questions about carpooling. What would you like to do today?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Get user's recent rides for context
      const { data: userRides } = await supabase
        .from('rides')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Get available rides for context
      const { data: availableRides } = await supabase
        .from('rides')
        .select('*')
        .eq('type', 'offer')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10)

      const systemPrompt = `You are a helpful AI assistant for CarpoolCompanion, a ride-sharing platform. 
      Your role is to help users with:
      1. Finding rides based on their needs
      2. Offering rides
      3. General carpooling advice
      4. Understanding the platform features

      Context about the user:
      - User ID: ${user?.id}
      - User's recent rides: ${JSON.stringify(userRides || [])}
      - Available rides: ${JSON.stringify(availableRides || [])}

      Be helpful, friendly, and provide specific actionable advice. If users ask about specific rides, 
      reference the available rides data. If they want to offer or request a ride, guide them to the 
      appropriate forms.`

      const response = await callGroqAPI([
        { role: 'system', content: systemPrompt },
        ...messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage.content }
      ])

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again later or use the regular features of the app.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          <p className="mt-2 text-gray-600">Get help with finding rides, offering rides, or general carpooling advice</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              {message.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
              <span className="text-xs opacity-75">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      ))}

            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4" />
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about carpooling..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                icon={Send}
                size="md"
              >
                Send
              </Button>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setInputValue("I need a ride from downtown to the airport tomorrow morning")}
                className="w-full text-left text-sm text-blue-600 hover:text-blue-800"
              >
                Find a ride
              </button>
              <button
                onClick={() => setInputValue("I want to offer a ride from my location to the university")}
                className="w-full text-left text-sm text-blue-600 hover:text-blue-800"
              >
                Offer a ride
              </button>
              <button
                onClick={() => setInputValue("What are some safety tips for carpooling?")}
                className="w-full text-left text-sm text-blue-600 hover:text-blue-800"
              >
                Safety tips
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Common Questions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setInputValue("How does the matching system work?")}
                className="w-full text-left text-sm text-blue-600 hover:text-blue-800"
              >
                How matching works
              </button>
              <button
                onClick={() => setInputValue("What if I need to cancel a ride?")}
                className="w-full text-left text-sm text-blue-600 hover:text-blue-800"
              >
                Cancellation policy
              </button>
              <button
                onClick={() => setInputValue("How do I set a fair price for my ride?")}
                className="w-full text-left text-sm text-blue-600 hover:text-blue-800"
              >
                Pricing guidance
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Tips</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Be specific about locations and times</p>
              <p>• Ask about available rides in your area</p>
              <p>• Get advice on carpooling etiquette</p>
              <p>• Learn about platform features</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}