import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AIReminderSystem from './AIReminderSystem';
import AIHealthPlanner from './AIHealthPlanner';
import './DadiChatBot.css';

const GEMINI_API_KEY = 'AIzaSyATlMq9S66FLRuQTuixmB7CXHMDnK2SAs0'; // 🔒 Replace with env variable in production
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const DadiChatBot = ({ user }) => {
  const [messages, setMessages] = useState([
    { text: "नमस्ते बेटा! मैं तुम्हारी दादी हूँ 👵💕\nकैसी हो? आज क्या पूछना है?", type: 'dadi' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [listening, setListening] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showHealthPlanner, setShowHealthPlanner] = useState(false);
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll chat down
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Setup speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setListening(false);
      };

      recognitionRef.current.onend = () => setListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (!listening) {
        recognitionRef.current.start();
        setListening(true);
      } else {
        recognitionRef.current.stop();
        setListening(false);
      }
    }
  };

  // Speak response
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    window.speechSynthesis.speak(utterance);
  };

  // Send message to Gemini API
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { text: inputMessage, type: 'user' };
    setMessages((prev) => [...prev, userMessage]);

    setInputMessage('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

User Question: ${userMessage.text}  

Please respond as Dadi would, with care and medical knowledge.
`;

      const result = await model.generateContent(medicalPrompt);
      const response = await result.response;
      const text = response.text();

      const dadiMessage = { text, type: 'dadi' };
      setMessages((prev) => [...prev, dadiMessage]);

      speakText(text);
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      setMessages((prev) => [
        ...prev,
        { text: "अरे बेटा, थोड़ी दिक्कत हो गई है। बाद में कोशिश करो।", type: 'dadi' }
      ]);
    }
  };

  return (
    <div className="dadi-chatbot-container">
      <div className="chat-header">
        <h3>
          👵 Dadi ChatBot  
          <span className="user-greeting">
            {user ? `${user.name}, दादी से बात करें` : 'दादी चैटबॉट से बात करें'}
          </span>
        </h3>
      </div>

      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">
              {message.text.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <button onClick={toggleListening} className={`mic-button ${listening ? 'listening' : ''}`}>
          <ion-icon name="mic"></ion-icon>
        </button>
        <input
          type="text"
          placeholder="अपना सवाल लिखें..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage} className="send-button">
          <ion-icon name="send"></ion-icon>
        </button>
      </div>

      <div className="extra-features">
        <button onClick={() => setShowReminders(true)}>
          <ion-icon name="alarm-outline"></ion-icon> दवा याद दिलाना
        </button>
        <button onClick={() => setShowHealthPlanner(true)}>
          <ion-icon name="fitness-outline"></ion-icon> हेल्थ प्लानर
        </button>
      </div>

      {/* Extra tools */}
      <>
        {showReminders && (
          <AIReminderSystem
            user={user}
            onClose={() => setShowReminders(false)}
          />
        )}

        {showHealthPlanner && user && (
          <AIHealthPlanner
            user={user}
            onClose={() => setShowHealthPlanner(false)}
          />
        )}
      </>
    </div>
  );
};

export default DadiChatBot;
