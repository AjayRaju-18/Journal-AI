# Setup Instructions

## Installation

### 1. Install Dependencies

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Groq API key
# GROQ_API_KEY=your_actual_key_here
```

### 3. Run the Application

#### Option A: Docker (Recommended)

```bash
# From project root
docker-compose up --build
```

Access:
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

#### Option B: Local Development

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## New UI Features

### Claude-like Chat Interface

The new UI includes:

✅ **Responsive Layout**
- Centered chat column (max-width: 768px)
- Scrollable message stream
- Fixed composer bar at bottom

✅ **Dark/Light Theme**
- Toggle button in header
- Custom Claude-inspired color palette
- Smooth transitions

✅ **Message Components**
- User messages (right-aligned, colored)
- Assistant messages (left-aligned, neutral)
- Avatars for both roles

✅ **Composer Bar**
- Auto-resizing textarea
- File attachment button (placeholder)
- Send button with hover effects
- Keyboard shortcuts:
  - `Enter` to send
  - `Shift+Enter` for new line

✅ **Empty State**
- Welcoming design
- Clear instructions
- Visual indicators for upload types

## Next Steps

1. Install dependencies: `cd frontend && npm install`
2. Run dev server: `npm run dev`
3. Integrate with existing backend API endpoints
4. Add file upload functionality
5. Connect to Paper Pipeline workflow

## Theme Customization

Edit `frontend/tailwind.config.js` to customize colors:

```js
colors: {
  'claude-accent': '#6366F1',  // Primary accent color
  // ... other colors
}
```
