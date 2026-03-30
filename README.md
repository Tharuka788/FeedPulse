FeedPulse - AI-Powered Feedback Management System 🚀

FeedPulse is a full-stack feedback management platform designed to capture user insights and leverage Google Gemini AI to automatically analyze sentiment, assign priority scores, and categorize feedback in real-time.

🌟 Key Features

Public Feedback Form: Modern, responsive Dark Mode UI built with Next.js 15 and Tailwind CSS.

AI-Driven Insights: - Sentiment Analysis: Automatically detects user mood (Positive, Neutral, Negative).

Priority Scoring: AI assigns a score from 1-10 to identify urgent issues.

Smart Tagging: Automatically generates relevant tags (e.g., #bug, #ui, #security).

Admin Dashboard: Secure portal for admins to manage, filter, and track feedback status.

Robust Security: Implements Input Sanitization using DOMPurify to prevent Cross-Site Scripting (XSS) attacks.

One-Click Deployment: Fully containerized using Docker and Docker Compose.

🛠️ Tech Stack

Frontend: Next.js 15, React 19, Tailwind CSS, Lucide React

Backend: Node.js, Express.js, TypeScript

Database: MongoDB Atlas (Cloud) / Local MongoDB

AI Engine: Google Generative AI (Gemini 1.5 Flash)

Containerization: Docker & Docker Compose

📦 Getting Started

1. Prerequisites

Docker Desktop installed and running.

A Google Gemini API Key (Get it from Google AI Studio).

2. Environment Setup

Create a .env file in the root directory (and backend/ directory) with the following variables:

PORT=4000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secret_key_for_auth
ADMIN_EMAIL=admin@feedpulse.com
ADMIN_PASSWORD=admin123


3. Run with Docker (Recommended)

Launch the entire ecosystem with a single command:

docker compose up --build


Access the application:

Frontend (Form): http://localhost:3000

Admin Dashboard: http://localhost:3000/admin

Backend API: http://localhost:4000

🛡️ Security & Validations

XSS Protection: All user-submitted content (Title, Description) is sanitized on the server side using isomorphic-dompurify to strip out any malicious HTML/Script tags.

Form Validation: - Description must be at least 20 characters.

Title and Category are strictly required.

Admin Security: Protected admin routes using JWT authentication.

📊 Dashboard Preview

AI Analysis in action: Sentiment, Priority, and Smart Tags.

Minimalist user submission form with real-time validation.

👨‍💻 Author

Tharuka Umayanga

Project developed as part of Assignment 1 - Full Stack Development.

📝 Note on Gemini API Fix

Initially, there was a connectivity issue within the Docker network environment for the Gemini API. This has been resolved by correctly mapping the environment variables and ensuring the Docker container has proper outbound access to Google's API endpoints.
