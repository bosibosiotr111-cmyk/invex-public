# INVEX Platform

A full-stack crypto investing platform with backend-driven authentication, realistic trading, and a professional UI/UX.

## Project Structure

```
invex-platform/
│
├── backend/      # Node.js/Express/MongoDB backend
│   └── ...
│
├── frontend/     # HTML/CSS/JS static frontend
│   └── ...
│
├── assets/       # Shared static assets (images, icons, etc.)
│
├── scripts/      # Frontend JS modules
│
├── README.md     # This file
└── ...
```

## How to Run Locally

### 1. Backend
- Go to the `backend` folder:
  ```
  cd backend
  ```
- Install dependencies:
  ```
  npm install
  ```
- Start the backend server:
  ```
  node server.js
  # or
  npm start
  ```
- The backend runs on `http://localhost:5000` by default.

### 2. Frontend
- Go to the main project folder (where `frontend` is):
  ```
  cd ..
  ```
- Serve the frontend using [live-server](https://www.npmjs.com/package/live-server):
  ```
  npx live-server frontend --port=5500 --no-browser
  ```
- Open `http://localhost:5500/index.html` or `admin.html` in your browser.

### 3. Connecting Frontend and Backend
- The frontend fetches data from the backend at `http://localhost:5000`.
- Make sure CORS is enabled on the backend for `localhost:5500`.

## Deploying to GitHub

1. Initialize git (if not already):
   ```
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Create a new repo on GitHub and follow the instructions to push:
   ```
   git remote add origin https://github.com/YOUR_USERNAME/invex-platform.git
   git branch -M main
   git push -u origin main
   ```

## Notes
- Store sensitive info (like DB credentials) in `backend/.env` (never commit this file).
- For production, use a real web server and secure your backend.

---

For any issues, open an issue on your GitHub repo.
