import { useState } from 'react'
import './App.css'

import { Oval } from "react-loader-spinner"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const MIN_WORDS = 100
const MAX_WORDS = 700

function countWords(text) {
  return text.trim().split(/\s+/).filter((word) => word !== '').length
}

function getWordCountError(label, text) {
  const count = countWords(text)
  if (count < MIN_WORDS) {
    return `${label} must contain at least ${MIN_WORDS} words (found ${count}).`
  }
  if (count > MAX_WORDS) {
    return `${label} must contain at most ${MAX_WORDS} words (found ${count}).`
  }
  return ''
}

async function analyseCv(jobDescription, cv) {
  const response = await fetch(`${API_BASE_URL}/api/analyse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_description: jobDescription, cv }),
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const data = await response.json()
      if (data?.detail) {
        if (typeof data.detail === 'string') {
          message = data.detail
        } else if (Array.isArray(data.detail)) {
          message = data.detail
            .map((item) => {
              if (typeof item === 'string') return item
              return item?.msg ?? JSON.stringify(item)
            })
            .join(' ')
        } else {
          message = JSON.stringify(data.detail)
        }
      }
    } catch {
      // Body was not JSON; keep the default message.
    }
    throw new Error(message)
  }

  return response.json()
}

function App() {
  const [jobDescription, setJobDescription] = useState('')
  const [cv, setCv] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [jobDescriptionError, setJobDescriptionError] = useState('')
  const [cvError, setCvError] = useState('')
  const [lastCvText, setLastCvText] = useState('')
  const [lastJobDescText, setLastJobDescText] = useState('')



  const jobDescriptionCount = countWords(jobDescription)
  const cvCount = countWords(cv)

  const canSubmit = jobDescription.trim() !== '' && cv.trim() !== '' && !loading

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const nextJobDescriptionError = getWordCountError(
      'Job description',
      jobDescription,
    )
    const nextCvError = getWordCountError('CV text', cv)
    setJobDescriptionError(nextJobDescriptionError)
    setCvError(nextCvError)

    if (nextJobDescriptionError !== '' || nextCvError !== '') {
      return
    }

    setLoading(true)
    try {
      if (lastCvText.localeCompare(cv) == 0 || lastJobDescText.localeCompare(jobDescription) == 0) {
        throw new Error("The CV or job description is the same as before.")
      }

      const jobText = jobDescription
      const cvText = cv

      const data = await analyseCv(jobText, cvText)

      setLastCvText(cvText)
      setLastJobDescText(jobText)

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>CV Helper</h1>
        <p>
          Analyse your CV against a job description and get a match score with
          recommendations.
        </p>
      </header>

      <form className="analyse-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="job-description">Job description</label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(event) => {
              setJobDescription(event.target.value)
              setJobDescriptionError('')
            }}
            placeholder="Paste the job description here"
            rows={8}
            required
          />
          <p className="word-count">
            {jobDescriptionCount} / {MAX_WORDS} words
          </p>
          {jobDescriptionError && (
            <p className="field-error">
              {jobDescriptionError}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="cv-text">CV text</label>
          <textarea
            id="cv-text"
            value={cv}
            onChange={(event) => {
              setCv(event.target.value)
              setCvError('')
            }}
            placeholder="Paste your CV text here"
            rows={8}
            required
          />
          <p className="word-count">
            {cvCount} / {MAX_WORDS} words
          </p>
          {cvError && (
            <p className="field-error">
              {cvError}
            </p>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={!canSubmit}>
          {loading ? 'Analysing...' : 'Analyse CV'}
        </button>
      </form>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {loading && (
        <section className="result">
          <h2>Analysing your CV</h2>
          <Oval
            height={40}
            width={40}
            color="#6366f1"
            secondaryColor='#888899'
            visible={true}
            ariaLabel="loading"
          />
        </section>
      )}

      {result && (
        <section className="result">
          <h2>Analysis result</h2>
          <div className="score">
            {result.score}
            <span> / 100</span>
          </div>
          <p className="summary">{result.summary}</p>
          <h3>Recommendations</h3>
          {result.recommendations.length > 0 ? (
            <ul>
              {result.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          ) : (
            <p className="empty">No recommendations.</p>
          )}
        </section>
      )}
    </main>
  )
}

export default App