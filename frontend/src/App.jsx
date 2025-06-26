import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your Marvel Movie Bot. Ask me anything about Marvel movies!",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedSources, setExpandedSources] = useState({})
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const toggleSources = (messageId) => {
    setExpandedSources(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }))
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const sendMessage = async () => {
    // Prevents empty messages and prevents sending while loading
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    // UI updates
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // API call
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          actor_name: 'jarvis'
        })
      })

      const data = await response.json()

      // Update UI with response
      if (response.ok) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response,
          sources: data.sources,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(data.detail || 'Failed to get response')
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <Bot className="header-icon" />
          <h1>Marvel Movie Bot</h1>
        </div>
        
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'bot' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                {message.sources && message.sources.length > 0 && (
                  <div className="message-sources-container"> {/* Only show sources if they exist */}
                    <button 
                      className="sources-toggle-btn"
                      onClick={() => toggleSources(message.id)}
                    >
                      {expandedSources[message.id] ? (
                        <>
                          <ChevronUp size={12} />
                          Hide Sources
                        </>
                      ) : (
                        <>
                          <ChevronDown size={12} />
                          Show Sources ({message.sources.length})
                        </>
                      )}
                    </button>
                    {expandedSources[message.id] && (
                      <div className="message-sources">
                        <small>Sources:</small>
                        {message.sources.map((source, index) => (
                          <div key={index} className="source-item">
                            <strong>{source.movie}</strong>: {source.content}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message bot">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="loading-indicator">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about Marvel movies..."
            disabled={isLoading}
            rows={1}
          />
          <button 
            onClick={sendMessage} 
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default App