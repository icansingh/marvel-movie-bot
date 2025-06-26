import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import './App.css'

// Character data
const characters = [
  {
    id: 'jarvis',
    name: 'JARVIS',
    description: 'Tony Stark\'s AI assistant with a sophisticated British accent and witty personality',
    color: '#60a5fa',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    icon: '/icons/jarvis.jpg',
    welcomeMessage: "Greetings! I am JARVIS, Mr. Stark's personal AI assistant. How may I be of service today? I have access to extensive data about the Marvel Cinematic Universe and would be delighted to assist you with any inquiries."
  },
  {
    id: 'hulk',
    name: 'HULK',
    description: 'Bruce Banner\'s alter ego with a powerful, sometimes angry personality',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
    icon: '/icons/hulk.png',
    welcomeMessage: "HULK SMASH! I mean... Hulk help you with Marvel questions! Hulk know lots about movies and characters. What you want to know?"
  },
  {
    id: 'black-panther',
    name: 'BLACK PANTHER',
    description: 'T\'Challa, the wise and noble king of Wakanda',
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '/icons/black_panther.jpg',
    welcomeMessage: "Wakanda forever! I am T'Challa, the Black Panther and King of Wakanda. I am honored to share my knowledge of the Marvel universe with you. What would you like to learn?"
  },
  {
    id: 'captain-america',
    name: 'CAPTAIN AMERICA',
    description: 'Steve Rogers, the patriotic super-soldier with unwavering moral compass',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    icon: '/icons/captain_america.png',
    welcomeMessage: "I can do this all day! I'm Captain America, and I'm here to help you learn about the Marvel Cinematic Universe. Whether it's about the Avengers, my journey from Brooklyn to the present day, or any other aspect of this incredible world, I'm ready to assist. What would you like to know?"
  }
]

function App() {
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [messages, setMessages] = useState([])
  const [conversationHistory, setConversationHistory] = useState([])
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

  // Initialize chat when character is selected
  useEffect(() => {
    if (selectedCharacter) {
      const character = characters.find(c => c.id === selectedCharacter)
      const welcomeMessage = {
        id: 1,
        type: 'bot',
        content: character.welcomeMessage,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
      setConversationHistory([])
    }
  }, [selectedCharacter])

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
          actor_name: selectedCharacter,
          conversation_history: conversationHistory
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
        
        // Update conversation history
        setConversationHistory(data.conversation_history)
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

  const handleCharacterSelect = (characterId) => {
    setSelectedCharacter(characterId)
  }

  const handleBackToSelection = () => {
    setSelectedCharacter(null)
    setMessages([])
    setConversationHistory([])
    setInputMessage('')
    setExpandedSources({})
  }

  // Character Selection Screen
  if (!selectedCharacter) {
    return (
      <div className="app">
        <div className="character-selection-container">
          <div className="character-selection-header">
            <Bot className="header-icon" />
            <h1>Choose Your Marvel Character</h1>
            <p>Select a character to chat with about Marvel movies</p>
          </div>
          
          <div className="character-grid">
            {characters.map((character) => (
              <div
                key={character.id}
                className="character-card"
                onClick={() => handleCharacterSelect(character.id)}
                style={{ '--character-gradient': character.gradient }}
              >
                <div className="character-avatar" style={{ background: character.gradient }}>
                  <img src={character.icon} alt={character.name} />
                </div>
                <div className="character-info">
                  <h3>{character.name}</h3>
                  <p>{character.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Chat Interface
  const currentCharacter = characters.find(c => c.id === selectedCharacter)
  
  return (
    <div className="app">
      <div className="chat-container" style={{ '--character-gradient': currentCharacter.gradient }}>
        <div className="chat-header" style={{ background: currentCharacter.gradient }}>
          <button className="back-button" onClick={handleBackToSelection}>
            <ArrowLeft size={20} />
          </button>
          <img src={currentCharacter.icon} alt={currentCharacter.name} className="header-icon" />
          <div className="header-content">
            <h1>Chat with {currentCharacter.name}</h1>
            {conversationHistory.length > 0 && (
              <div className="memory-indicator" title="AI remembers our conversation">
                <span>💭 Memory Active</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'bot' ? (
                  <img src={currentCharacter.icon} alt={currentCharacter.name} />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                {message.sources && message.sources.length > 0 && (
                  <div className="message-sources-container">
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
                <img src={currentCharacter.icon} alt={currentCharacter.name} />
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
            placeholder={`Ask ${currentCharacter.name} about Marvel movies...`}
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