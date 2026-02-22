# EvidenceTrace.AI — Frontend

A modern React-based digital evidence management and investigation platform for law enforcement. Investigators can create cases, upload evidence files to Google Drive, and analyze evidence through an AI-powered chat interface.

## Features

- **Case Management**: Create and manage investigation cases with file uploads
- **Evidence Upload**: Multi-file upload with progress tracking and Google Drive integration
- **AI Chat Interface**: Chat-based evidence analysis with source citation
- **Evidence Viewer**: View videos, images, and audio files with metadata (camera ID, timestamps, GPS)
- **Dark Mode**: Full light/dark theme with localStorage persistence and system preference detection
- **Responsive Design**: Sidebar navigation with multi-column layouts

## Tech Stack

- **Framework**: React 18.3.1
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.3.1
- **Routing**: React Router 7.13.0
- **Styling**: Tailwind CSS 4.1.12, Emotion, Class Variance Authority
- **UI Components**: Radix UI, Material UI 7.3.5, Lucide React
- **Forms**: React Hook Form 7.55.0
- **HTTP Client**: Axios 1.13.5
- **Charts**: Recharts 2.15.2
- **Animations**: Motion 12.23.24
- **Drag & Drop**: React DnD 16.0.1
- **Notifications**: Sonner 2.0.3
- **Testing**: Cypress 13.17.0
- **Linting**: ESLint 9.39.1

## Prerequisites

- Node.js 22.x (via nvm)
- npm (bundled with Node.js)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd digital-evidence-gap-fe
```

### 2. Install Node.js 22 with nvm

```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Reload shell
source ~/.bashrc  # or ~/.zshrc

# Install and use Node.js 22
nvm install 22
nvm use 22

# Verify installation
node --version  # should print v22.x.x
npm --version
```

### 3. Install dependencies

```bash
npm install
```

### 4. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Authentication (for development/demo)
VITE_USER_TOKEN=your-jwt-token-here
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
digital-evidence-gap-fe/
│
├── index.html                     # HTML entry point
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.app.json              # App-specific TS config
├── tsconfig.node.json             # Node-specific TS config
├── eslint.config.js               # ESLint configuration
├── postcss.config.mjs             # PostCSS configuration
├── package.json                   # Dependencies and scripts
├── .env                           # Environment variables (local)
│
├── public/                        # Static assets
│
└── src/
    ├── main.tsx                   # Application entry point
    ├── index.css                  # Global CSS
    │
    ├── app/
    │   ├── App.tsx                # Root component with routing
    │   ├── routes.tsx             # Route definitions
    │   │
    │   ├── layouts/
    │   │   └── MainLayout.tsx     # Sidebar + content layout wrapper
    │   │
    │   ├── pages/
    │   │   ├── NewCase.tsx        # Case creation with file upload
    │   │   ├── PastCases.tsx      # Cases list with search
    │   │   └── ChatWorkspace.tsx  # Case detail, chat & evidence viewer
    │   │
    │   └── components/
    │       ├── Sidebar.tsx        # Navigation sidebar with theme toggle
    │       ├── Modal.tsx          # Generic modal wrapper
    │       ├── MediaUploadCard.tsx # File upload card with progress
    │       ├── EvidenceList.tsx   # Evidence file list view
    │       ├── VideoPlayer.tsx    # Video file viewer
    │       ├── ImageViewer.tsx    # Image file viewer
    │       ├── figma/             # Design-aligned components
    │       └── ui/                # 50+ headless Radix UI components
    │
    ├── services/
    │   ├── cases.service.ts       # Cases API (create, list, fetch)
    │   └── chatWorkspace.service.ts # Chat and evidence API calls
    │
    ├── contexts/
    │   └── ThemeContext.tsx       # Light/dark theme provider
    │
    ├── hooks/
    │   └── useTheme.ts            # Theme hook
    │
    ├── constants/
    │   ├── api.constants.ts       # API endpoints and base URL
    │   ├── newCase.constants.ts   # File upload constraints
    │   ├── chatWorkspace.constants.ts # Mock/demo chat data
    │   └── mediaUploadCard.constants.ts # Upload card config
    │
    ├── assets/
    │   ├── logo.svg               # Dark mode logo
    │   └── logo-light.svg         # Light mode logo
    │
    └── styles/
        ├── tailwind.css           # Tailwind directives
        ├── fonts.css              # Custom font definitions
        └── theme.css              # CSS custom properties / theme tokens
```

## API Integration

The frontend communicates with the Digital Evidence Gap API backend. Key endpoints used:

| Action | Method | Endpoint |
|---|---|---|
| List cases | GET | `/search/cases/` |
| Create case | POST | `/search/cases/` |
| Get case details | GET | `/search/cases/:id/` |
| Upload evidence | POST | `/evidence/gdrive/upload/` |
| List evidence | GET | `/cases/:caseId/evidence/` |
| Delete evidence | DELETE | `/cases/:caseId/evidence/:id/` |
| Get messages | GET | `/cases/:caseId/messages/` |
| Send message | POST | `/cases/:caseId/messages/` |

## Development Notes

- **State management**: Component-level React hooks (no Redux/Zustand)
- **Theme persistence**: Stored in `localStorage`, with system preference fallback on first load
- **Demo mode**: Services include mock data fallbacks; replace with live API calls by updating `src/services/`
- **React Compiler**: Enabled via Babel plugin — may affect Vite dev and build performance
