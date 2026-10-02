# CV Helper

CV Helper is a web app that checks a CV against a job description. It uses AI to
compare the two texts and shows you how well they match.

## What it does

You paste a job description and your CV text into the page. Then you click
"Analyse CV". The app sends both texts to an AI model and shows the result:

- a match score from 0 to 100,
- a short summary,
- a list of recommendations for your CV.

Both texts must have between 100 and 700 words. The server checks this and
returns an error if the input is too short or too long. The AI also checks that
the input looks like a real CV and a real job posting.

## How it works

- The client is a React app built with Vite.
- The server is a FastAPI app written in Python.
- The server sends the texts to an AI model through OpenRouter.
- The server limits the number of requests to 5 per minute.
- The request asks for privacy: no data collection and no data retention.

## Project structure

```
client/   React (Vite) front end
server/   FastAPI back end
```

## Run the server

Go to the `server` folder and create a file named `.env` with your OpenRouter
API key:

```
AI_KEY=your_openrouter_api_key
```

You can also add `FRONTEND_URL` to this file. The server only accepts requests
from this address (CORS). If you do not set it, the server uses
`http://localhost:5173`:

```
FRONTEND_URL=http://localhost:5173
```

Set it to your front end address when you deploy the app, so the server accepts
requests from the real site.

Then install the packages and start the server:

```
pip install -r requirements.txt
uvicorn main:app --reload
```

The server runs on http://127.0.0.1:8000.

## Run the client

Go to the `client` folder, install the packages and start the dev server:

```
npm install
npm run dev
```

The client runs on http://localhost:5173 and sends requests to the server. To
use a different server URL, set `VITE_API_BASE_URL` in a `.env` file in the
`client` folder. If you do not set it, the client uses its own address.
