# Crack The Doc

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-LLM-FF6B35?style=flat-square)](https://groq.com/)

A web-based document analysis platform that uses an LLM to summarize documents, extract key points, generate questions with answers, and provide an AI study assistant with optional text-to-speech for accessibility.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Supported Formats](#supported-formats)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [License](#license)

---

## Overview

**Crack The Doc** lets you upload documents and get AI-powered study aids in seconds. The app uses the [Groq](https://groq.com/) API (LLaMA 3.3 70B) to produce summaries, key point definitions, and Q&A from your content. You can chat with a document-aware assistant and use built-in text-to-speech for summaries and key points.

---

## Features

| Feature | Description |
|--------|-------------|
| **Document summarization** | Concise, coherent summaries that capture main sections and key details. |
| **Key point extraction** | Headlines and definitions for important concepts, with document-specific context. |
| **Question generation** | Short and broad questions with answers derived from the document. |
| **Document-aware chat** | Ask questions about your document; answers are grounded in the uploaded content. |
| **Text-to-speech (TTS)** | Play summaries and key points using the browser’s Web Speech API. |
| **Document preview** | View PDFs and rendered content in a modal. |
| **Dark / light theme** | Theme toggle with persistent preference. |

---

## Supported Formats

- **PDF** — Text extraction via `pdfjs-dist`
- **DOCX** — Text extraction via Mammoth
- **TXT** — Plain text
- **Markdown** — Rendered in preview and used as-is for analysis

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A [Groq](https://console.groq.com/) API key

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/crack-the-doc.git
cd crack-the-doc
```

### 2. Install dependencies

From the project root, go into the app directory and install:

```bash
cd crack_the_doc
npm install
```

### 3. Configure environment

Create a `.env` file in the `crack_the_doc` directory:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Get an API key from the [Groq Console](https://console.groq.com/).

### 4. Run the development server

```bash
npm run dev
```

Open the URL shown in the terminal (e.g. `http://localhost:5173`) in your browser.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GROQ_API_KEY` | Yes | Groq API key for LLM summarization, key points, questions, and chat. |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with hot reload. |
| `npm run build` | Type-check and build for production. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint on `.ts` and `.tsx` files. |

---

## Project Structure

```
crack-the-doc/
├── crack_the_doc/          # Frontend application
│   ├── public/             # Static assets (e.g. PDF worker)
│   ├── src/
│   │   ├── components/     # UI components (upload, chat, analysis, TTS, etc.)
│   │   ├── contexts/       # React context (theme)
│   │   ├── lib/            # Groq client, utilities
│   │   ├── pages/          # Page components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── documentation/          # Project docs and design notes
└── README.md
```

---