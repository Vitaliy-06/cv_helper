import { useState } from 'react'
import './App.css'

import { Oval } from "react-loader-spinner"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css";

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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      job_description: jobDescription,
      cv: cv,
    }),
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to analyse CV')
  }

  return data
}

function App() {

  const [jobDescription, setJobDescription] = useState('')
  const [cv, setCv] = useState('')

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [jobDescriptionError, setJobDescriptionError] = useState('')
  const [cvError, setCvError] = useState('')

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

    setResult(null)
    setLoading(true)
    try {
      const data = await analyseCv(jobDescription, cv)
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
            height={80}
            width={80}
            strokeWidth={2}
            color="#8b5e3c"
            secondaryColor='#e7ddd2'
            visible={true}
            ariaLabel="loading"
          />
        </section>
      )}

      {result && (
        <section className="result">
          <h2>Analysis result</h2>
          <div className="score">
            <CircularProgressbar
              value={result.score}
              text={`${result.score} / 100`}
              styles={buildStyles({
                pathColor: getColorScore(result.score),
                trailColor: '#e7ddd2',
                textColor: getColorScore(result.score),
                textSize: '18px'
              })}
              strokeWidth={5}
            />
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

function getColorScore(number) {
  if (number < 40) { return "#e10d02"  } 
  if (number < 70) { return "#b37b03"  }
  return "#08a803" 
}

export default App