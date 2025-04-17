
import React, { useState, useEffect, useRef } from "react";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
const synth = window.speechSynthesis;

export default function SiphraGPT() {
  const [messages, setMessages] = useState([
    { sender: "SiphraGPT", text: "Hi, main Siphra hoon 😊 Tumse milke khushi hui. Bolo, kya baat karni hai?" },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleVoiceInput = () => {
    if (!recognition) return alert("Speech recognition not supported.");
    recognition.lang = "hi-IN";
    recognition.start();
    setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    synth.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "You", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer YOUR_OPENAI_API_KEY`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Tum SiphraGPT ho, ek caring aur samajhdar AI friend jo Hindi aur English mix me baat karti hai, aur user ka mood better banane me madad karti hai." },
          ...messages.map((msg) => ({ role: msg.sender === "You" ? "user" : "assistant", content: msg.text })),
          { role: "user", content: input },
        ],
      }),
    });

    const data = await res.json();
    const reply = data.choices[0].message.content;
    setMessages((prev) => [...prev, { sender: "SiphraGPT", text: reply }]);
    speak(reply);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "600px", background: "#fff", borderRadius: "20px", boxShadow: "0 0 15px rgba(0,0,0,0.1)", padding: "20px" }}>
        <h1 style={{ textAlign: "center", color: "#7b1fa2" }}>SiphraGPT 💜</h1>
        <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "15px", padding: "10px", border: "1px solid #e1bee7", borderRadius: "10px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.sender === "You" ? "right" : "left", margin: "10px 0" }}>
              <div style={{ display: "inline-block", padding: "10px", borderRadius: "10px", background: "#f3e5f5", color: "#4a148c" }}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or speak..."
            style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #ce93d8" }}
          />
          <button onClick={sendMessage} style={{ padding: "10px 15px", background: "#8e24aa", color: "#fff", borderRadius: "10px", border: "none" }}>Send</button>
          <button onClick={handleVoiceInput} style={{ padding: "10px", background: "#ab47bc", color: "#fff", borderRadius: "10px", border: "none" }}>{isListening ? "..." : "🎙️"}</button>
        </div>
      </div>
    </div>
  );
}
