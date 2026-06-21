
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
