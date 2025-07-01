"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./App.css"

export default function YesNoApp() {
  const [question, setQuestion] = useState("")
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showResponse, setShowResponse] = useState(false)
  const [forcedAnswer, setForcedAnswer] = useState(null) // ✅ nuevo
  const [showCustomGif, setShowCustomGif] = useState(false)
  const [customGif, setCustomGif] = useState(null)

  const validateQuestion = (text) => {
    const trimmed = text.trim()
    const spanishQuestion = /^¿.*\?$/.test(trimmed)
    const endsWithQuestion = trimmed.endsWith("?")
    return spanishQuestion || endsWithQuestion
  }

  const translateAnswer = (answer) => {
    const translations = {
      yes: "Sí",
      no: "No",
      maybe: "Tal vez",
    }
    return translations[answer] || answer
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!question.trim()) {
      setError("Por favor, escribe una pregunta")
      return
    }

    if (!validateQuestion(question)) {
      setError("La pregunta debe estar entre ¿...? o terminar con ?")
      return
    }

    setError("")
    setLoading(true)
    setShowResponse(false)
    setResponse(null)

    try {
      const url = forcedAnswer
        ? `https://yesno.wtf/api?force=${forcedAnswer}`
        : "https://yesno.wtf/api"

      const result = await axios.get(url)
      setResponse(result.data)
      setTimeout(() => setShowResponse(true), 100)
    } catch (err) {
      setError("Error al obtener la respuesta. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setQuestion("")
    setResponse(null)
    setError("")
    setShowResponse(false)
    setForcedAnswer(null)
  }

  // Elige el gif personalizado según la respuesta
  const getCustomGif = (answer) => {
    if (answer === "yes") {
      const gifs = ["/SI1.gif", "/SI2.gif", "/SI3.gif"]
      const randomIndex = Math.floor(Math.random() * gifs.length)
      return gifs[randomIndex]
    }
    if (answer === "no") {
      return "/NO1.gif"
    }
    return null
  }

  // Mostrar el modal cuando llega una respuesta "yes" o "no"
 useEffect(() => {
    if (response && (response.answer === "yes" || response.answer === "no")) {
      setCustomGif(getCustomGif(response.answer))
      setShowCustomGif(true)
    } else {
      setShowCustomGif(false)
      setCustomGif(null)
    }
  }, [response])

  return (
    <div className="app-container">
      {/* Modal para el gif personalizado */}
      {showCustomGif && customGif && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              position: "relative",
              width: "350px", // Tamaño fijo para el contenedor
              height: "400px", // Tamaño fijo para el contenedor
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => setShowCustomGif(false)}
              style={{
                position: "absolute",
                top: 8,
                right: 12,
                background: "transparent",
                border: "none",
                fontSize: "2rem",
                color: "#750b9f",
                cursor: "pointer",
                fontWeight: "bold",
                zIndex: 2,
              }}
              aria-label="Cerrar"
            >
              ×
            </button>
            <img
              src={customGif}
              alt="Gif personalizado"
              style={{
                width: "300px",
                height: "300px",
                objectFit: "cover",
                borderRadius: "12px",
                marginTop: "24px",
              }}
            />
          </div>
        </div>
      )}
      <div className="main-card">
        <header className="header">
          <h1 className="title">¿Sí o No?</h1>
          <p className="subtitle">Haz una pregunta y obtén una respuesta</p>
        </header>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="¿Tu pregunta aquí?"
              className="question-input"
              disabled={loading}
            />
            <button type="submit" className="submit-button" disabled={loading || !question.trim()}>
              {loading ? "Consultando..." : "Preguntar"}
            </button>
          </div>
        </form>

        {/* ✅ botones para forzar respuesta */}
        <div className="force-buttons">
          <button onClick={() => setForcedAnswer("yes")} disabled={loading}>
            Forzar SÍ
          </button>
          <button onClick={() => setForcedAnswer("no")} disabled={loading}>
            Forzar NO
          </button>
          <button onClick={() => setForcedAnswer("maybe")} disabled={loading}>
            Forzar TAL VEZ
            </button>

        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Consultando...</p>
          </div>
        )}

        {response && (
          <div className={`response-container ${showResponse ? "show" : ""}`}>
            <div className="answer-text">{translateAnswer(response.answer)}</div>
            <div className="gif-container">
              <img
                src={response.image || "/placeholder.svg"}
                alt={`Respuesta: ${translateAnswer(response.answer)}`}
                className="response-gif"
              />
            </div>
            <button onClick={handleReset} className="reset-button">
              Hacer otra pregunta
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
