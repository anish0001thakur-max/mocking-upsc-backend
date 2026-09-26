# MocKing UPSC — Frontend

A single-page app (plain HTML/CSS/JS — no build step, no npm install needed) that talks to the
backend API you already have.

## Setup

1. Make sure the **backend** is running first (see the backend's README):
   ```
   npm start
   ```
   It should be live at `http://localhost:4000`.

2. Open `index.html` in your browser — just double-click the file, or right-click → Open With → your browser.

That's it. No build tools required.

## If login/signup doesn't work

Some browsers restrict requests from a double-clicked local file. If you see errors in the
browser console, serve this folder instead of opening it directly:

```
npx serve .
```

(This uses a temporary, no-install static server — just say yes if it asks to install `serve`.)
Then open the address it prints (usually `http://localhost:3000`).

## Changing the backend address

If your backend runs on a different port or a real server later, update this line near the top
of the `<script>` tag in `index.html`:

```js
const API_BASE = 'http://localhost:4000/api';
```

## What's included

- Sign up / log in (JWT stored in the browser so you stay logged in)
- Start a test: choose subject + question count, get a live countdown timer
- Take the test: click through questions, answers auto-save as you go
- Auto-submit when time runs out, or submit manually on the last question
- Results page with full answer review (your answer vs. correct answer + explanation)
- History page listing all your past attempts

## Next steps

- Admin screen for adding/editing questions (currently only via the API directly)
- Deploy frontend + backend together so it's not just `localhost`
- Polish: subject-wise performance charts, retake-wrong-answers mode
