# Design Document: Legal Document Analyzer

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Next.js Frontend (Port 3000)                │    │
│  │  - React Components (TypeScript)                    │    │
│  │  - Tailwind CSS Styling                             │    │
│  │  - Axios HTTP Client                                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │       FastAPI Backend (Port 8000)                   │    │
│  │  - REST API Endpoints                               │    │
│  │  - Request Validation (Pydantic)                    │    │
│  │  - CORS Middleware                                  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
┌───────────────▼──────────┐  ┌────────▼──────────────────────┐
│    Processing Layer      │  │      External Services         │
│  ┌──────────────────┐   │  │  ┌────────────────────────┐   │
│  │  PDF Processing  │   │  │  │    Groq API (LLM)      │   │
│  │  - PyPDF2        │   │  │  │  - Llama 3.3 70B       │   │
│  │  - Text Extract  │   │  │  │  - Inference Engine    │   │
│  └──────────────────┘   │  │  └────────────────────────┘   │
│  ┌──────────────────┐   │  └────────────────────────────────┘
│  │  RAG Pipeline    │   │
│  │  - Chunking      │   │
│  │  - Embedding     │   │
│  │  - Retrieval     │   │
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │  Analysis        │   │
│  │  - Summarizer    │   │
│  │  - Clause Extract│   │
│  │  - Risk Analyzer │   │
│  └──────────────────┘   │
└──────────────────────────┘
                │
                │
┌───────────────▼──────────┐
│      Data Layer          │
│  ┌──────────────────┐   │
│  │   ChromaDB       │   │
│  │  - Vector Store  │   │
│  │  - HNSW Index    │   │
│  │  - Persistence   │   │
│  └──────────────────┘   │
└──────────────────────────┘
```

### 1.2 Architecture Patterns

#### Pattern 1: Client-Server Architecture
- **Frontend**: Next.js SPA serving static assets and handling UI
- **Backend**: FastAPI REST API handling business logic
- **Communication**: JSON over HTTP

#### Pattern 2: RAG (Retrieval-Augmented Generation)
- **Indexing Phase**: Document → Chunks → Embeddings → Vector DB
- **Query Phase**: Question → Embedding → Similarity Search → Context → LLM → Answer

#### Pattern 3: Modular Monolith
- Backend organized into functional modules (embeddings, analysis)
- Clear separation of concerns
- Easy to extract into microservices later

## 2. Component Design

### 2.1 Frontend Components

#### 2.1.1 Page Component (page.tsx)
**Responsibility**: Main application orchestrator

**State Management**:
```typescript
- uploadData: { filename, total_chunks, full_text } | null
- Browser history management for navigation
```

**Key Features**:
- Conditional rendering (landing vs. dashboard)
- Document statistics calculation
- Navigation handling (back button)
- Floating background animations

**Child Components**:
- UploadArea (landing page)
- ChatInterface (dashboard)
- AnalysisResults (dashboard)

#### 2.1.2 UploadArea Component
**Responsibility**: Handle PDF upload and initial processing

**Props**: 
```typescript
onUploadComplete: (data: UploadResponse) => void
```

**Features**:
- Drag-and-drop file upload
- File validation (PDF only)
- Upload progress indicator
- Error handling and display
- Visual feedback (animations, icons)

**API Integration**:
- POST /upload endpoint
- Multipart form data submission

#### 2.1.3 ChatInterface Component
**Responsibility**: Interactive Q&A with document

**State**:
```typescript
- messages: Message[] // { role, content }
- input: string
- isLoading: boolean
```

**Features**:
- Message history display
- User/AI message differentiation
- Quick question buttons
- Auto-scroll to latest message
- Loading animation (typing dots)
- Input validation

**API Integration**:
- POST /ask endpoint
- Real-time response handling

#### 2.1.4 AnalysisResults Component
**Responsibility**: Display document analysis results

**Props**:
```typescript
documentText: string
```

**State**:
```typescript
- activeTab: 'summary' | 'clauses' | 'risks'
- summary: string | null
- clauses: string | null
- risks: string | null
- loading: boolean
- copied: boolean
```

**Features**:
- Tabbed interface with lazy loading
- Copy-to-clipboard functionality
- Loading states per tab
- Color-coded tabs (blue, indigo, amber)
- Empty state handling

**API Integration**:
- POST /summary
- POST /clauses
- POST /risks

### 2.2 Backend Components

#### 2.2.1 API Layer (main.py)

**FastAPI Application**:
```python
app = FastAPI()
- CORS middleware (allow all origins for dev)
- Global instances: embedder, vector_store
```

**Endpoints**:

1. **POST /upload**
   - Input: UploadFile
   - Process: Save temp → Extract text → Chunk → Embed → Store → Cleanup
   - Output: { message, filename, total_chunks, full_text }

2. **POST /ask**
   - Input: QueryRequest { question }
   - Process: Embed query → Search vectors → Build context → Query LLM
   - Output: { answer, context }

3. **POST /summary**
   - Input: AnalysisRequest { document_text }
   - Process: Send to summarizer → Query LLM
   - Output: { summary }

4. **POST /clauses**
   - Input: AnalysisRequest { document_text }
   - Process: Send to clause extractor → Query LLM
   - Output: { clauses }

5. **POST /risks**
   - Input: AnalysisRequest { document_text }
   - Process: Send to risk analyzer → Query LLM
   - Output: { risks }

#### 2.2.2 Embeddings Module

**chunker.py**:
```python
extract_text_from_pdf(file_path: str) -> str
  - Uses PyPDF2.PdfReader
  - Extracts text from all pages
  - Returns concatenated text

chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]
  - Splits text into overlapping chunks
  - Maintains semantic boundaries
  - Returns list of text chunks
```

**embedder.py**:
```python
class Embedder:
  - model: SentenceTransformer('all-MiniLM-L6-v2')
  
  embed_documents(texts: List[str]) -> List[List[float]]
    - Batch embedding for efficiency
    - Returns 384-dimensional vectors
  
  embed_query(text: str) -> List[float]
    - Single text embedding
    - Same model for consistency
```

**vectorstore.py**:
```python
class VectorStore:
  - client: ChromaDB PersistentClient
  - collection: "legal_docs"
  
  add_documents(documents, embeddings, metadatas)
    - Generates UUIDs for each chunk
    - Stores in ChromaDB collection
  
  query(query_embedding, n_results=5) -> Dict
    - Performs similarity search
    - Returns top N relevant chunks
```

#### 2.2.3 Analysis Module

**groq_client.py**:
```python
query_llm(prompt: str, model: str = "llama-3.3-70b-versatile") -> str
  - Loads GROQ_API_KEY from environment
  - Creates Groq client
  - Sends chat completion request
  - Returns generated text
  - Handles API errors
```

**summarizer.py**:
```python
summarize_document(text: str) -> str
  - Constructs summarization prompt
  - Truncates text if needed (15000 chars)
  - Calls query_llm
  - Returns concise summary
```

**clause_extractor.py**:
```python
extract_clauses(text: str) -> str
  - Defines target clauses (Termination, Liability, etc.)
  - Constructs extraction prompt
  - Requests JSON format output
  - Calls query_llm
  - Returns structured clause data
```

**risk_analyzer.py**:
```python
analyze_risks(text: str) -> str
  - Defines risk categories
  - Constructs risk analysis prompt
  - Requests severity levels
  - Calls query_llm
  - Returns risk assessment
```

## 3. Data Flow

### 3.1 Document Upload Flow

```
User selects PDF
    │
    ▼
Frontend: UploadArea component
    │ (FormData with file)
    ▼
Backend: POST /upload
    │
    ├─► Save temporary file
    │
    ├─► extract_text_from_pdf()
    │   └─► PyPDF2 reads all pages
    │
    ├─► chunk_text()
    │   └─► Split into 500-char chunks with 50-char overlap
    │
    ├─► embedder.embed_documents()
    │   └─► SentenceTransformer generates 384-dim vectors
    │
    ├─► vector_store.add_documents()
    │   └─► ChromaDB stores chunks + embeddings + metadata
    │
    ├─► Delete temporary file
    │
    └─► Return { filename, total_chunks, full_text }
        │
        ▼
Frontend: Update uploadData state
    │
    └─► Navigate to dashboard view
```

### 3.2 Question Answering Flow

```
User types question
    │
    ▼
Frontend: ChatInterface component
    │ (POST /ask with question)
    ▼
Backend: POST /ask
    │
    ├─► embedder.embed_query(question)
    │   └─► Generate query embedding
    │
    ├─► vector_store.query(embedding, n_results=5)
    │   └─► ChromaDB similarity search
    │   └─► Returns top 5 relevant chunks
    │
    ├─► Build context from retrieved chunks
    │
    ├─► Construct prompt with context + question
    │
    ├─► query_llm(prompt)
    │   └─► Groq API (Llama 3.3 70B)
    │   └─► Generate answer
    │
    └─► Return { answer, context }
        │
        ▼
Frontend: Display answer in chat
```

### 3.3 Analysis Flow

```
User clicks analysis tab (Summary/Clauses/Risks)
    │
    ▼
Frontend: AnalysisResults component
    │ (POST /summary|clauses|risks with document_text)
    ▼
Backend: POST /summary|clauses|risks
    │
    ├─► Construct specialized prompt
    │   ├─► Summary: "Summarize this document..."
    │   ├─► Clauses: "Extract key clauses..."
    │   └─► Risks: "Identify high-risk clauses..."
    │
    ├─► Truncate text to 15000 chars (token limit)
    │
    ├─► query_llm(prompt)
    │   └─► Groq API generates analysis
    │
    └─► Return { summary|clauses|risks }
        │
        ▼
Frontend: Display in active tab
```

## 4. Database Design

### 4.1 ChromaDB Schema

**Collection**: `legal_docs`

**Document Structure**:
```json
{
  "id": "uuid-string",
  "document": "text chunk content",
  "embedding": [0.123, -0.456, ...], // 384 dimensions
  "metadata": {
    "source": "filename.pdf"
  }
}
```

**Index**: HNSW (Hierarchical Navigable Small World)
- Fast approximate nearest neighbor search
- O(log n) query time
- Optimized for high-dimensional vectors

**Persistence**: 
- Directory: `./chroma_db/`
- SQLite metadata store: `chroma.sqlite3`
- HNSW index files: Binary format

### 4.2 Data Lifecycle

1. **Creation**: Document upload → chunking → embedding → storage
2. **Read**: Query → embedding → similarity search → retrieval
3. **Update**: Not implemented (documents are immutable)
4. **Delete**: Not implemented (collection persists across sessions)

**Note**: Current design stores all documents in single collection. Future enhancement: separate collections per document or user.

## 5. API Design

### 5.1 REST API Specification

#### Base URL
- Development: `http://localhost:8000`

#### Content Type
- Request: `application/json` (except /upload: `multipart/form-data`)
- Response: `application/json`

#### Error Response Format
```json
{
  "detail": "Error message string"
}
```

### 5.2 Endpoint Details

#### POST /upload
```
Request:
  Content-Type: multipart/form-data
  Body: file (PDF)

Response: 200 OK
  {
    "message": "PDF processed and embedded successfully",
    "filename": "document.pdf",
    "total_chunks": 42,
    "full_text": "extracted text content..."
  }

Errors:
  500: Processing error
```

#### POST /ask
```
Request:
  {
    "question": "What are the payment terms?"
  }

Response: 200 OK
  {
    "answer": "The payment terms are...",
    "context": [
      "chunk 1 text",
      "chunk 2 text",
      ...
    ]
  }

Errors:
  500: Query processing error
```

#### POST /summary
```
Request:
  {
    "document_text": "full document text"
  }

Response: 200 OK
  {
    "summary": "This document is a service agreement..."
  }

Errors:
  400: Missing document_text
  500: Analysis error
```

#### POST /clauses
```
Request:
  {
    "document_text": "full document text"
  }

Response: 200 OK
  {
    "clauses": "{\n  \"Termination\": \"...\",\n  \"Liability\": \"...\"\n}"
  }

Errors:
  400: Missing document_text
  500: Analysis error
```

#### POST /risks
```
Request:
  {
    "document_text": "full document text"
  }

Response: 200 OK
  {
    "risks": "High Risk: Unlimited liability clause..."
  }

Errors:
  400: Missing document_text
  500: Analysis error
```

## 6. UI/UX Design

### 6.1 Design System

#### Color Palette
```css
Primary: Indigo-Purple gradient (#4F46E5 → #9333EA)
Secondary: Cyan-Blue (#06B6D4 → #3B82F6)
Success: Emerald-Green (#10B981 → #059669)
Warning: Amber-Red (#F59E0B → #EF4444)
Neutral: Gray scale (#F9FAFB → #111827)
```

#### Typography
```css
Font Family: System fonts (sans-serif)
Headings: Bold, gradient text
Body: Regular, gray-700
Small: text-sm, gray-500
```

#### Spacing
```css
Container: max-w-7xl mx-auto
Padding: px-4 sm:px-6 lg:px-8
Gap: space-y-4, gap-6
```

#### Components
- **Glass Cards**: `backdrop-blur-sm bg-white/80`
- **Gradients**: `bg-gradient-to-r from-{color} to-{color}`
- **Shadows**: `shadow-lg hover:shadow-xl`
- **Rounded**: `rounded-xl` (12px), `rounded-2xl` (16px)
- **Transitions**: `transition-all duration-200`

### 6.2 Page Layouts

#### Landing Page
```
┌─────────────────────────────────────────┐
│ Header: Logo + Title                    │
├─────────────────────────────────────────┤
│                                         │
│  Hero Section                           │
│  - Badge: "RAG-Powered"                 │
│  - Headline: "Analyze Legal Documents"  │
│  - Description                          │
│  - Feature badges (3 icons)            │
│                                         │
│  ┌───────────────────────────────┐     │
│  │   Upload Area (Drag & Drop)   │     │
│  │   - Icon                       │     │
│  │   - Instructions               │     │
│  │   - Browse button              │     │
│  └───────────────────────────────┘     │
│                                         │
│  Trust Badges (Tech Stack)             │
│                                         │
└─────────────────────────────────────────┘
```

#### Dashboard
```
┌─────────────────────────────────────────┐
│ Header: Logo + "New Document" button    │
├─────────────────────────────────────────┤
│ Document Info Card                      │
│ - Filename, stats (words, pages, chunks)│
├─────────────────────────────────────────┤
│                                         │
│ ┌──────────────┬──────────────────────┐│
│ │              │                      ││
│ │ Chat         │  Analysis Results    ││
│ │ Interface    │  ┌────┬────┬────┐   ││
│ │              │  │Sum │Cls │Risk│   ││
│ │ - Messages   │  └────┴────┴────┘   ││
│ │ - Input      │  - Content area      ││
│ │              │  - Copy button       ││
│ │              │                      ││
│ └──────────────┴──────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

### 6.3 Interaction Patterns

#### Upload Flow
1. User hovers over upload area → Border highlights
2. User drops file → Processing animation
3. Upload progress → Spinner + percentage
4. Success → Checkmark + transition to dashboard

#### Chat Flow
1. User types question → Input field active
2. User clicks send → Message appears, input clears
3. Loading state → Typing dots animation
4. Response appears → Auto-scroll to bottom

#### Analysis Flow
1. User clicks tab → Tab highlights, loading spinner
2. API call in progress → Centered loading animation
3. Content loads → Fade-in animation
4. User clicks copy → Button shows checkmark

### 6.4 Responsive Design

#### Breakpoints
```css
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

#### Layout Adaptations
- **Mobile**: Single column, stacked components
- **Tablet**: Adjusted spacing, smaller fonts
- **Desktop**: Two-column grid (chat + analysis)

## 7. Security Design

### 7.1 Authentication & Authorization
**Current**: None (MVP)
**Future**: JWT-based authentication, role-based access control

### 7.2 Data Security

#### API Key Management
```python
# .env file (not committed to git)
GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# Loaded via python-dotenv
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")
```

#### File Upload Security
- File type validation (PDF only)
- File size limits (50MB)
- Temporary storage with immediate cleanup
- No permanent file storage

#### CORS Configuration
```python
# Development: Allow all origins
allow_origins=["*"]

# Production: Restrict to frontend domain
allow_origins=["https://yourdomain.com"]
```

### 7.3 Input Validation

#### Backend (Pydantic)
```python
class QueryRequest(BaseModel):
    question: str  # Required, non-empty

class AnalysisRequest(BaseModel):
    document_text: Optional[str] = None  # Validated in endpoint
```

#### Frontend (TypeScript)
```typescript
// Input sanitization
const sanitizedInput = input.trim();
if (!sanitizedInput) return;

// File validation
if (file.type !== 'application/pdf') {
  throw new Error('Only PDF files are supported');
}
```

### 7.4 Error Handling

#### Backend Strategy
```python
try:
    # Operation
except Exception as e:
    print(f"Error in /endpoint: {e}")  # Server logs
    raise HTTPException(status_code=500, detail=str(e))  # Client response
```

#### Frontend Strategy
```typescript
try {
  const data = await apiCall();
  // Success handling
} catch (error) {
  console.error(error);  // Debug logs
  // User-friendly error message
  setError("Sorry, something went wrong. Please try again.");
}
```

## 8. Performance Optimization

### 8.1 Frontend Optimizations

#### Code Splitting
- Next.js automatic code splitting per page
- Dynamic imports for heavy components
- Lazy loading of analysis tabs

#### Asset Optimization
- SVG icons (Lucide React) - small bundle size
- Tailwind CSS purging - removes unused styles
- Next.js image optimization (if images added)

#### State Management
- Local component state (useState)
- No global state library needed (simple app)
- Efficient re-renders with React 19

### 8.2 Backend Optimizations

#### Embedding Efficiency
```python
# Batch embedding (faster than individual)
embeddings = embedder.embed_documents(chunks)

# Model loaded once at startup
embedder = Embedder()  # Global instance
```

#### Vector Search
- ChromaDB HNSW index: O(log n) search
- Limit results to top 5 (n_results=5)
- Persistent storage avoids re-indexing

#### LLM Optimization
- Groq API: Ultra-fast inference (< 1s)
- Text truncation to avoid token limits
- Single API call per request

### 8.3 Caching Strategy

**Current**: No caching (MVP)

**Future Enhancements**:
- Redis cache for repeated questions
- Browser localStorage for recent documents
- CDN for static assets

## 9. Deployment Architecture

### 9.1 Development Environment

#### Directory Structure
```
legal-document-analyzer/
├── backend/
│   ├── analysis/
│   │   ├── clause_extractor.py
│   │   ├── groq_client.py
│   │   ├── risk_analyzer.py
│   │   └── summarizer.py
│   ├── embeddings/
│   │   ├── chunker.py
│   │   ├── embedder.py
│   │   └── vectorstore.py
│   ├── chroma_db/          # Persistent vector DB
│   ├── venv/               # Python virtual environment
│   ├── .env                # Environment variables
│   ├── main.py             # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── AnalysisResults.tsx
│   │   ├── ChatInterface.tsx
│   │   └── UploadArea.tsx
│   ├── lib/
│   │   └── api.ts          # API client
│   ├── node_modules/
│   ├── package.json
│   └── next.config.ts
├── start.ps1               # Startup script
└── README.md
```

#### Startup Process
```powershell
# start.ps1
# 1. Activate Python venv
# 2. Start FastAPI (port 8000)
# 3. Start Next.js (port 3000)
# 4. Open browser to localhost:3000
```

### 9.2 Production Deployment (Future)

#### Recommended Stack
- **Frontend**: Vercel (Next.js optimized)
- **Backend**: Railway / Render / AWS EC2
- **Database**: Managed ChromaDB or Pinecone
- **CDN**: Cloudflare
- **Monitoring**: Sentry, LogRocket

#### Environment Variables
```bash
# Backend
GROQ_API_KEY=xxx
ALLOWED_ORIGINS=https://yourdomain.com
CHROMA_DB_PATH=/data/chroma_db

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 10. Testing Strategy

### 10.1 Frontend Testing (Future)

#### Unit Tests
- Component rendering (Jest + React Testing Library)
- API client functions (mock axios)
- Utility functions

#### Integration Tests
- User flows (upload → chat → analysis)
- API integration (mock backend)

#### E2E Tests
- Playwright/Cypress for full user journeys

### 10.2 Backend Testing (Future)

#### Unit Tests
```python
# pytest
test_extract_text_from_pdf()
test_chunk_text()
test_embedder()
test_vector_store()
```

#### Integration Tests
```python
# FastAPI TestClient
test_upload_endpoint()
test_ask_endpoint()
test_analysis_endpoints()
```

#### Load Tests
- Locust for concurrent user simulation
- Test vector DB performance at scale

## 11. Monitoring & Logging

### 11.1 Logging Strategy

#### Backend Logging
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Log levels
logger.info("Document uploaded: {filename}")
logger.warning("Large document truncated")
logger.error("API call failed: {error}")
```

#### Frontend Logging
```typescript
// Development
console.log("Upload started");
console.error("API error:", error);

// Production
// Send to logging service (Sentry, LogRocket)
```

### 11.2 Metrics to Track

#### Application Metrics
- Documents processed per hour
- Average processing time
- API response times (p50, p95, p99)
- Error rates by endpoint

#### Business Metrics
- Active users
- Feature usage (summary vs clauses vs risks)
- Question types (NLP analysis)
- User retention

## 12. Scalability Considerations

### 12.1 Current Limitations
- Single ChromaDB collection (all documents mixed)
- No user isolation
- In-memory processing (limited by RAM)
- Single-threaded FastAPI (Uvicorn default)

### 12.2 Scaling Strategies

#### Horizontal Scaling
- Multiple FastAPI instances behind load balancer
- Shared ChromaDB or migrate to Pinecone/Weaviate
- Stateless backend (no session storage)

#### Vertical Scaling
- Increase RAM for larger documents
- GPU acceleration for embeddings (future)
- SSD for faster vector DB access

#### Database Scaling
- Separate collections per user/document
- Sharding for large-scale deployments
- Read replicas for query performance

## 13. Technology Decisions

### 13.1 Why Next.js?
- Server-side rendering for SEO
- Built-in routing and optimization
- TypeScript support
- Large ecosystem and community

### 13.2 Why FastAPI?
- Fast development with automatic API docs
- Async support for concurrent requests
- Pydantic validation
- Python ecosystem for AI/ML

### 13.3 Why ChromaDB?
- Easy setup (no external service)
- Persistent storage
- Good performance for MVP scale
- Python-native integration

### 13.4 Why Groq?
- Ultra-fast inference (< 1s)
- Free tier for development
- Llama 3.3 70B quality
- Simple API

### 13.5 Why SentenceTransformers?
- Open-source and free
- Good quality embeddings
- Small model size (all-MiniLM-L6-v2)
- Fast inference on CPU

## 14. Future Enhancements

### 14.1 Technical Improvements
- WebSocket for real-time streaming responses
- Background job queue (Celery) for long-running tasks
- Redis caching layer
- Database migrations (Alembic)
- Comprehensive test suite
- CI/CD pipeline (GitHub Actions)

### 14.2 Feature Additions
- User authentication (Auth0, Clerk)
- Document history and management
- Multi-document comparison
- Export to PDF/Word
- Custom clause templates
- Collaborative features
- Mobile app (React Native)

### 14.3 AI Enhancements
- Fine-tuned models for legal domain
- Multi-modal support (images, tables)
- Confidence scores for answers
- Citation tracking
- Summarization quality metrics
