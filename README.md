
# EcoAssist-AI

Welcome to **EcoAssist-AI**, a full-stack AI-powered application built with React, Vite, Express, and Google's Gemini AI. 

View your app in AI Studio: [https://ai.studio/apps/ce12ce5c-ff23-4f0f-8b80-cb3708b56966](https://ai.studio/apps/ce12ce5c-ff23-4f0f-8b80-cb3708b56966)

## 🚀 Tech Stack

This project uses a modern JavaScript/TypeScript ecosystem:
* **Frontend:** React 19, Vite, Tailwind CSS (v4), React Router, Zustand (State Management), Framer Motion, and shadcn/ui components.
* **Backend:** Node.js, Express, TypeScript (`tsx`).
* **AI Integration:** Google GenAI SDK (`@google/genai`).
* **Database & Auth:** PostgreSQL (`pg`), Drizzle ORM, Firebase & Firebase Admin.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (Recommended version: 18+ or 20+)
* A Google Gemini API Key

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` or `.env` file. You can use the provided `.env.example` as a template.

```env
# Required for Gemini AI API calls. 
# Note: AI Studio automatically injects this at runtime from user secrets.
GEMINI_API_KEY="your_gemini_api_key_here"

# The URL where this applet is hosted (Used for OAuth callbacks, API endpoints).
# Note: AI Studio automatically injects this at runtime with the Cloud Run service URL.
APP_URL="http://localhost:5173"
```
💻 Run Locally
Follow these steps to set up and run the application on your local machine:

Install dependencies:

Bash
npm install
Configure your environment:
Create a .env.local file in the root directory and add your GEMINI_API_KEY.

Start the development server:
This command starts both the Vite frontend and the Express backend using tsx.

Bash
npm run dev
📜 Available Scripts
In the project directory, you can run the following commands:

npm run dev - Starts the development server.

npm run build - Builds the Vite frontend and bundles the Express server for production using esbuild.

npm start - Runs the compiled production server (dist/server.cjs).

npm run preview - Locally previews the Vite production build.

npm run lint - Runs TypeScript type-checking (tsc --noEmit).

npm run clean - Removes the generated dist folder and built server files.

📦 Database & ORM
This project uses Drizzle ORM with PostgreSQL. To manage your database schema, you can utilize Drizzle Kit commands (ensure your database credentials are set up if you plan to run migrations locally).
