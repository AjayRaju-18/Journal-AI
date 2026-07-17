# Paper Pipeline

Automated academic paper generation from data using LangGraph, FastAPI, and React.

## 🏗️ Architecture

- **Backend**: FastAPI + LangGraph + Groq LLM
- **Frontend**: React + Vite + Nginx
- **Deployment**: Docker + Docker Compose

## 📋 Features

- 📤 Upload CSV/Excel data files
- 📄 Optional DOCX template support
- 🤖 AI-powered paper generation with LangGraph workflow
- 📊 Real-time progress tracking
- 📚 Multiple citation styles (APA, MLA, Chicago, IEEE, Harvard)
- 📝 Multiple writing styles (Academic, Technical, Scientific, Business)
- 💾 DOCX output with proper formatting

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Groq API key ([Get one here](https://console.groq.com/))

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd paper-pipeline
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Development Setup

#### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with GROQ_API_KEY
cp .env.example .env

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## 📖 Usage

### 1. Upload Files

- Upload your data file (CSV or Excel)
- Optionally upload a DOCX template with section headings

### 2. Configure

- Select writing style (Academic, Technical, Scientific, Business)
- Choose citation format (APA, MLA, Chicago, IEEE, Harvard)

### 3. Generate

- Click "Generate Paper"
- Watch real-time progress through the workflow:
  - **Structuring**: Analyzes data and creates outline
  - **Drafting**: Writes section content grounded in data
  - **Citations**: Formats citations to target style
  - **Formatting**: Creates final DOCX document

### 4. Download

- Download your generated paper as a DOCX file
- Edit in Microsoft Word or compatible software

## 🏛️ Workflow Architecture

The paper generation workflow uses LangGraph with the following nodes:

```
Upload → Structuring → Drafting → Citations → Formatting → Download
```

**Structuring Node**: Analyzes data and creates section outline  
**Drafting Node**: Generates prose grounded strictly in provided data  
**Citation Node**: Formats existing citations (no generation)  
**Formatting Node**: Exports to DOCX with template structure

## 🛠️ Technology Stack

### Backend
- **FastAPI**: REST API framework
- **LangGraph**: Workflow orchestration
- **Groq**: LLM inference
- **Pandas**: Data processing
- **python-docx**: Document generation
- **Pydantic**: Data validation
- **SQLite**: State persistence

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool
- **Axios**: HTTP client
- **Nginx**: Production server

## 📁 Project Structure

```
paper-pipeline/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Configuration & LLM
│   │   ├── graph/        # LangGraph workflow
│   │   ├── models/       # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── main.py       # FastAPI app
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # React components
│   │   ├── App.jsx       # Main app
│   │   └── main.jsx      # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key (required) | - |
| `DB_URL` | Database connection string | `sqlite:///./paper_pipeline.db` |
| `UPLOAD_DIR` | Upload directory path | `./uploads` |

### API Endpoints

- `POST /api/upload` - Upload data and template files
- `POST /api/generate` - Start paper generation
- `GET /api/status/{job_id}` - Get job status
- `GET /api/result/{job_id}` - Download generated paper
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📊 Data Requirements

### Data File (Required)
- Format: CSV or Excel (.csv, .xlsx, .xls)
- Max size: 50 MB
- Should contain structured data for paper generation

### Template File (Optional)
- Format: DOCX only
- Max size: 10 MB
- Should contain section headings (Heading 1, Heading 2, etc.)
- Template structure will be preserved in output

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Powered by [LangGraph](https://github.com/langchain-ai/langgraph)
- LLM inference by [Groq](https://groq.com/)
- UI built with [React](https://react.dev/)

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: This application generates papers based strictly on provided data. Always review and edit the output for accuracy and completeness.
