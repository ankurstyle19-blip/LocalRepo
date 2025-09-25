import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import AIReminderSystem from './AIReminderSystem';
import AIHealthPlanner from './AIHealthPlanner';
import VoiceGuidance from './VoiceGuidance';

const GEMINI_API_KEY = 'AIzaSyATlMq9S66FLRuQTuixmB7CXHMDnK2SAs0';
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function DadiChatBot({ showOnHomepage = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content:
        'नमस्ते बेटा! मैं दादी चैटबॉट हूं। मैं आपकी स्वास्थ्य संबंधी समस्याओं में मदद कर सकती हूं। आप मुझसे किसी भी मेडिकल सवाल के बारे में पूछ सकते हैं। जैसे - बुखार, सर्दी-खांसी, पेट दर्द, या कोई और स्वास्थ्य समस्या।',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showHealthPlanner, setShowHealthPlanner] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const { t } = useLanguage();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Check if query is medical ---
  const isMedicalQuery = (text) => {
    const medicalKeywords = [
      'health',
      'doctor',
      'medicine',
      'pain',
      'fever',
      'cold',
      'cough',
      'headache',
      'stomach',
      'heart',
      'blood',
      'pressure',
      'diabetes',
      'treatment',
      'symptom',
      'disease',
      'illness',
      'hospital',
      'clinic',
      'prescription',
      'tablet',
      'injection',
      'स्वास्थ्य',
      'डॉक्टर',
      'दवा',
      'दर्द',
      'बुखार',
      'सर्दी',
      'खांसी',
      'सिरदर्द',
      'पेट',
      'दिल',
      'खून',
      'दबाव',
      'मधुमेह',
      'इलाज',
      'लक्षण',
      'बीमारी',
      'अस्पताल',
      'क्लिनिक',
      'नुस्खा',
      'गोली',
      'इंजेक्शन',
      'चिकित्सा',
      'उपचार',
    ];
    const lowerText = text.toLowerCase();
    return medicalKeywords.some((keyword) =>
      lowerText.includes(keyword.toLowerCase())
    );
  };

  // --- Call Gemini API ---
  const callGeminiAPI = async (userMessage) => {
    try {
      const medicalPrompt = `
You are "Dadi" (Grandmother), a caring and knowledgeable medical assistant chatbot. 
You should respond in a warm, grandmother-like manner in Hindi and English mix.

IMPORTANT INSTRUCTIONS:
1. Only answer medical and health-related questions  
2. If the question is not medical/health related, politely redirect to medical topics  
3. Always add a disclaimer that you're not a replacement for professional medical advice  
4. Be caring and use terms like "बेटा/बेटी" (child) occasionally  
5. Keep responses concise but helpful  
6. Mix Hindi and English naturally as Indian grandmothers do  
7. If user asks about serious symptoms, always recommend consulting a doctor  
8. Provide home remedies for minor issues but emphasize doctor consultation for serious problems  

User Question: ${userMessage}  

Please respond as Dadi would, with care and medical knowledge.
      `;

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: medicalPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return (
        data.candidates[0]?.content?.parts[0]?.text ||
        'मुझे समझने में कुछ परेशानी हो रही है। कृपया दोबारा पूछें।'
      );
    } catch (error) {
      console.error('Gemini API Error:', error);
      return 'बेटा, मुझे अभी कुछ तकनीकी समस्या हो रही है। कृपया थोड़ी देर बाद पूछें या किसी डॉक्टर से सलाह लें।';
    }
  };

  // --- Handle Send ---
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // Add user message
    const newUserMessage = {
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Check if it's a medical query
    if (!isMedicalQuery(userMessage)) {
      const nonMedicalResponse = {
        type: 'bot',
        content:
          'बेटा, मैं केवल स्वास्थ्य और मेडिकल सवालों का जवाब दे सकती हूं। कृपया अपनी सेहत से जुड़े सवाल पूछें। जैसे - बुखार, सर्दी-खांसी, दर्द, या कोई और स्वास्थ्य समस्या के बारे में।',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, nonMedicalResponse]);
      setIsLoading(false);
      return;
    }

    try {
      const botResponse = await callGeminiAPI(userMessage);
      const newBotMessage = {
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newBotMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        content:
          'बेटा, मुझे कुछ परेशानी हो रही है। कृपया बाद में पूछें या डॉक्टर से मिलें।',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Speech ---
  const speakText = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('आपका ब्राउज़र स्पीच फीचर को सपोर्ट नहीं करता।');
    }
  };

  const handleVoiceInput = (transcript) => {
    setInputText(transcript);
  };

  const handleVoiceInputComplete = () => {
    if (inputText.trim()) {
      handleSendMessage();
    }
  };

  return (
    <div
      className={`chatbot-container ${showOnHomepage ? 'homepage-chatbot' : ''}`}
    >
      {/* Toggle button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={user ? `${user.name}, दादी से बात करें` : 'दादी चैटबॉट से बात करें'}
      >
        {isOpen ? (
          <ion-icon name="close-outline"></ion-icon>
        ) : (
          <div className="chatbot-icon">
            <ion-icon name="chatbubbles-outline"></ion-icon>
            <div className="pulse-ring"></div>
          </div>
        )}
      </button>

      {/* Chat modal */}
      {isOpen && (
        <div
          className={`chatbot-modal ${showOnHomepage ? 'homepage-modal' : ''}`}
        >
          <div className="chatbot-header">
            <h3>
              <ion-icon name="heart-outline"></ion-icon> दादी चैटबॉट{' '}
              {user && <span className="user-greeting">- {user.name}</span>}
            </h3>
            <div className="chatbot-header-actions">
              <button
                className="header-action-btn"
                onClick={() => setShowReminders(!showReminders)}
                title="AI Reminders"
              >
                <ion-icon name="alarm-outline"></ion-icon>
              </button>
              {user && (
                <button
                  className="header-action-btn premium"
                  onClick={() => setShowHealthPlanner(!showHealthPlanner)}
                  title="AI Health Planner (Premium)"
                >
                  <ion-icon name="fitness-outline"></ion-icon>
                </button>
              )}
            </div>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
            >
              <ion-icon name="close-outline"></ion-icon>
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <div className="message-content">{message.content}</div>
                {message.type === 'bot' && (
                  <div className="message-actions">
                    <button
                      className="speak-btn"
                      onClick={() => speakText(message.content)}
                      disabled={isSpeaking}
                      title="सुनें"
                    >
                      <ion-icon
                        name={
                          isSpeaking ? 'stop-outline' : 'volume-high-outline'
                        }
                      ></ion-icon>
                      {isSpeaking ? 'रोकें' : 'सुनें'}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="typing-indicator">
                <span>दादी टाइप कर रही हैं</span>
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <div className="input-group">
              <VoiceGuidance
                onTranscript={handleVoiceInput}
                onComplete={handleVoiceInputComplete}
                isListening={isListening}
                setIsListening={setIsListening}
              />
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  user
                    ? `${user.name}, अपना स्वास्थ्य संबंधी सवाल यहां लिखें...`
                    : 'अपना स्वास्थ्य संबंधी सवाल यहां लिखें...'
                }
                rows="1"
                disabled={isLoading}
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                title="भेजें"
              >
                <ion-icon name="send-outline"></ion-icon>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extra features */}
      {showReminders && (
        <AIReminderSystem user={user} onClose={() => setShowReminders(false)} />
      )}
      {showHealthPlanner && user && (
        <AIHealthPlanner user={user} onClose={() => setShowHealthPlanner(false)} />
      )}
    </div>
  );
}

export default DadiChatBot;