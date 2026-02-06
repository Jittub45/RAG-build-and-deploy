# 🏎️ PitLane AI - F1 RAG Chatbot

A RAG-powered Formula 1 conversational AI chatbot built with **LangChain.js**, **Next.js**, **DataStax Astra DB**, and the **Vercel AI SDK**.

## 🚀 Live Demo

**[https://pitlane-ai-professional-memorable.onrender.com/](https://pitlane-ai-professional-memorable.onrender.com/)**

![F1 Chat Interface](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![LangChain](https://img.shields.io/badge/LangChain-JS-green?style=flat-square)
![Astra DB](https://img.shields.io/badge/DataStax-Astra-orange?style=flat-square)

## ✨ Features

- **RAG-Powered Responses**: Uses Retrieval-Augmented Generation for accurate, contextual answers
- **Real-time Data**: Scrapes live F1 data from multiple sources
- **Vector Search**: Fast semantic search using DataStax Astra DB
- **Streaming Responses**: Real-time streaming with Vercel AI SDK
- **Modern UI**: Beautiful, responsive chat interface
- **10+ Data Sources**: Comprehensive F1 knowledge base

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router) |
| UI | Tailwind CSS |
| Chat Interface | Vercel AI SDK |
| LLM Orchestration | LangChain.js |
| Vector Database | DataStax Astra DB |
| Embeddings | OpenAI text-embedding-3-small |
| LLM | GPT-4 Turbo |
| Web Scraping | Cheerio |

## 📁 Project Structure

```
f1-rag-chatbot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts      # Chat API with RAG
│   │   │   └── scrape/route.ts    # Data scraping endpoint
│   │   ├── components/
│   │   │   ├── Chat.tsx           # Main chat component
│   │   │   ├── ChatMessage.tsx    # Message display
│   │   │   ├── ChatInput.tsx      # Input component
│   │   │   └── SuggestedQuestions.tsx
│   │   ├── page.tsx               # Home page
│   │   └── globals.css
│   ├── lib/
│   │   ├── langchain/
│   │   │   ├── chains.ts          # RAG chain setup
│   │   │   ├── prompts.ts         # System prompts
│   │   │   └── retriever.ts       # Vector retriever
│   │   ├── vectordb/
│   │   │   ├── astra.ts           # Astra DB client
│   │   │   └── embeddings.ts      # Embedding generation
│   │   ├── scrapers/
│   │   │   ├── ergast.ts          # Ergast API scraper
│   │   │   ├── wikipedia.ts       # Wikipedia scraper
│   │   │   └── news.ts            # News scraper
│   │   └── utils/
│   │       ├── chunking.ts        # Text chunking
│   │       └── sanitize.ts        # Data cleaning
│   └── types/
│       └── index.ts               # TypeScript types
├── scripts/
│   ├── seed-database.ts           # Initial data load
│   └── update-data.ts             # Scheduled updates
├── .env.example                   # Environment template
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- DataStax Astra account (free tier available)

### 1. Install Dependencies

```bash
cd f1-rag-chatbot
npm install
```

### 2. Set Up DataStax Astra DB

1. Go to [astra.datastax.com](https://astra.datastax.com/)
2. Create a free account
3. Create a new **Serverless (Vector)** database
4. Wait for the database to become "Active"
5. Go to **Connect** > **Generate Token** > **Application Token**
6. Copy the token and API endpoint

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
OPENAI_API_KEY=sk-...
ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
ASTRA_DB_API_ENDPOINT=https://<db-id>-<region>.apps.astra.datastax.com
```

### 4. Seed the Database

```bash
npm run seed
```

This will:
- Scrape F1 data from Ergast API, Wikipedia, and other sources
- Generate vector embeddings for all documents
- Store everything in your Astra DB collection

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start chatting!

## 📊 Data Sources

| Source | Data Type | Update Frequency |
|--------|-----------|------------------|
| Ergast API | Race results, standings, schedules | Real-time |
| Wikipedia | Driver bios, team history | Weekly |
| Formula1.com | News, technical articles | Daily |
| Compiled Facts | Historical records, statistics | As needed |

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run seed` | Seed database with F1 data |
| `npm run update-data` | Update with fresh data |
| `npm run lint` | Run ESLint |

## 🔌 API Endpoints

### POST /api/chat
Chat endpoint with RAG retrieval and streaming responses.

### POST /api/scrape
Trigger data scraping and embedding generation.

### GET /api/scrape
Check database status.

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## 📝 License

MIT

---

Built with ❤️ for F1 fans everywhere 🏎️
