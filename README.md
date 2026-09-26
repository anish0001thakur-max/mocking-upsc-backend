# MocKing UPSC — Backend

Node.js + Express + SQLite API for the MocKing UPSC mock-test platform.

## Setup (run these on your own computer)

1. Install [Node.js](https://nodejs.org) (v18 or later) if you don't have it.
2. Open a terminal in this folder and run:
3. Copy `.env.example` to `.env` and set a real `JWT_SECRET` (any long random string):
4. Create and seed the database:
This creates `mocking_upsc.sqlite` with 10 sample questions across Polity, History, Geography and Economy.
5. Start the server:
It will run on `http://localhost:4000`.

To make yourself an admin (needed for adding/editing questions), sign up normally through
`/api/auth/signup`, then open `mocking_upsc.sqlite` (e.g. with the "DB Browser for SQLite" free
app) and change that user's `role` column from `student` to `admin`.

## API Overview

### Auth
| Method | Route             | Body                          | Notes             |
|--------|-------------------|--------------------------------|-------------------|
| POST   | /api/auth/signup  | `{ name, email, password }`   | Creates a student account |
| POST   | /api/auth/login   | `{ email, password }`         | Returns a JWT token |

Send the token on every other request as a header:
`Authorization: Bearer <token>`

### Tests (requires login)
| Method | Route                        | Body / Notes |
|--------|------------------------------|--------------|
| POST   | /api/tests/start             | `{ subject?, count?, durationSeconds? }` — starts a new test, returns questions without answers |
| PATCH  | /api/tests/:testId/answer    | `{ questionId, selectedOption }` — save/change an answer as the user progresses |
| POST   | /api/tests/:testId/submit    | Grades the test with negative marking, returns score |
| GET    | /api/tests/:testId/review    | Full review: your answer vs correct answer, per question |
| GET    | /api/tests/history           | All past tests for the logged-in user |

### Questions (admin only)
| Method | Route              | Notes |
|--------|---------------------|-------|
| GET    | /api/questions      | List all questions (optional `?subject=Polity`) |
| POST   | /api/questions      | Add a new question |
| PUT    | /api/questions/:id  | Edit a question |
| DELETE | /api/questions/:id  | Remove a question |

## Scoring logic

Each test stores its own `marks_per_correct` (default 2) and `negative_marks` (default 0.66),
matching the UPSC Prelims pattern. Score = `(correct × marks_per_correct) − (wrong × negative_marks)`.
Skipped questions cost nothing.

## Next steps (later sessions)

- Frontend: a React (or the existing single-page demo) app that talks to this API
- Deployment: Render or Railway both support Node + a persistent disk for the SQLite file for free
- Optional: swap SQLite for PostgreSQL if you expect heavy concurrent traffic later
