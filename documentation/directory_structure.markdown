# Project Directory Structure

Below is the updated directory structure for the Document Summarization Platform, with the backend remodeled to consolidate all API routes, utilities, and tests into a single `api.py` file.

```
document-summarization-platform/
├── backend/
│   ├── api.py                     # Consolidated FastAPI app, utilities, and tests
│   ├── requirements.txt           # Python dependencies
│   └── .env                       # Environment variables (e.g., Groq API key)
├── frontend/
│   ├── public/
│   │   ├── index.html             # Main HTML file
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                # Images, fonts, etc.
│   │   ├── components/
│   │   │   ├── UploadForm.jsx     # File upload component
│   │   │   ├── SummaryDisplay.jsx # Displays summary
│   │   │   ├── KeyPoints.jsx      # Displays key points with definitions
│   │   │   ├── Questions.jsx      # Displays questions and answers
│   │   │   ├── TTSPanel.jsx       # Text-to-speech controls
│   │   │   └── DocumentPreview.jsx # Renders document preview (PDF/Markdown)
│   │   ├── hooks/
│   │   │   ├── useDocument.js     # Custom hook for document state
│   │   │   └── useTTS.js          # Custom hook for text-to-speech
│   │   ├── pages/
│   │   │   └── Home.jsx           # Main page component
│   │   ├── styles/
│   │   │   └── tailwind.css       # Tailwind CSS configuration
│   │   ├── App.jsx                # Main React app component
│   │   ├── index.jsx              # React entry point
│   │   └── api/
│   │       └── api.js             # API client for backend communication
│   ├── package.json               # Node dependencies and scripts
│   ├── tailwind.config.js         # Tailwind CSS configuration
│   └── vite.config.js             # Vite configuration for React
├── docs/
│   ├── idea.md                    # Project idea and overview
│   └── directory_structure.md     # This file
├── README.md                      # Project overview and setup instructions
└── .gitignore                     # Git ignore file
```

## Description
- **backend/**: Contains the consolidated Python backend.
  - **api.py**: Single script containing:
    - FastAPI app setup and route definitions (previously in `api/main.py`, `api/routes/*`).
    - Utility functions for document processing, Groq API integration, and text conversion (previously in `utils/`).
    - Unit tests for API endpoints and utilities (previously in `tests/`).
    - Organized with clear sections (e.g., `# API Setup`, `# Utilities`, `# Tests`) for maintainability.
  - **requirements.txt**: Lists dependencies (e.g., `fastapi`, `pymupdf4llm`, `python-docx`, `groq`, `pypandoc`).
  - **.env**: Stores environment variables like the Groq API key.
- **frontend/**: Unchanged, contains the React frontend with Tailwind CSS.
  - **public/**: Static assets like HTML and favicon.
  - **src/**: React source code, including components, hooks, pages, and API client.
  - **components/**: Reusable UI components for upload, display, and TTS.
  - **hooks/**: Custom hooks for managing document state and TTS.
  - **styles/**: Tailwind CSS configuration.
  - **api/**: Client-side API calls to the backend.
- **docs/**: Documentation files, including this structure and the project idea.
- **Root Files**: `README.md` for setup instructions, `.gitignore` for version control.

This structure simplifies the backend by consolidating all logic into `api.py`, while maintaining modularity in the frontend and clear separation of concerns.