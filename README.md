# PDF Query and AI Chat Application

## Overview
This application combines a backend for PDF upload and query functionality with a frontend interface. It allows users to upload PDFs, query their content, and interact with a sophisticated query system powered by LangChain and Ollama.

## Features
### Backend Features:
1. **PDF Upload and Text Extraction**:
   - Users can upload PDFs via the `/upload/` endpoint.
   - Extracts and stores text content from PDFs in an SQLite database.

2. **Query PDFs**:
   - Users can query the content of uploaded PDFs via the `/query/` endpoint.
   - Supports natural language questions about PDF content using LangChain with Ollama integration and Stuff Chain methodology for robust query handling.

3. **General Query Handling**:
   - An endpoint `/api/get-response` provides a general-purpose response mechanism utilizing LangChain capabilities.

### Frontend Features:
1. **PDF Upload Interface**:
   - Upload PDFs directly through a user-friendly interface.

2. **Query Form**:
   - Allows users to input questions about uploaded PDFs and get responses.

3. **Dynamic Query Interface**:
   - A dynamic UI to interact with the backend query system.

## Requirements
- Python 3.x
- FastAPI
- Uvicorn
- PyMuPDF
- SQLite
- React (Frontend)
- LangChain
- Ollama(llama 3.2)

## Setup
### Backend Setup:
1. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the FastAPI server:
   ```bash
   uvicorn app:app --reload
   ```

### Frontend Setup:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run build
   npx serve -s build
   ```

## Backend API Endpoints
1. **Root Endpoint**:
   - `GET /`
   - Returns a welcome message.

2. **Upload PDF**:
   - `POST /upload/`
   - Accepts a PDF file, extracts its text, and stores it in the database.

3. **Query PDF**:
   - `POST /query/`
   - Accepts a filename and a natural language query.
   - Returns an answer based on the content of the specified PDF using LangChain and Ollama integration.

4. **General Query Handling**:
   - `POST /api/get-response`
   - Accepts a message and returns a processed response using LangChain.

## Database
- **SQLite Database (`pdf_metadata.db`)**:
  - Stores metadata of uploaded PDFs including filename and extracted text.

## Frontend Structure
1. **Components**:
   - `index.html`: Base HTML for the application.
   - `index.css`: Styles for the frontend.
   - `App.js`: Handles query interactions and backend communication.

## Usage
### PDF Upload and Query:
1. Upload PDFs through the `/upload/` endpoint or the frontend interface.
2. Query the uploaded PDFs using the `/query/` endpoint or frontend query form.

### Query System:
1. Interact with the query system using the dynamic interface in the frontend.
2. Backend endpoints process queries using LangChain and Ollama for accurate and context-aware responses.

## Notes
- Ensure CORS is handled for frontend-backend communication.
- Frontend communicates with the backend running on `localhost:8000`.


## Future Enhancements
1. **Enhanced Query Capabilities**:
   - Expand LangChain integrations for more robust question answering.
2. **User Authentication**:
   - Add user accounts and authentication for personalized experiences.
3. **Cloud Storage**:
   - Integrate with cloud storage services for scalable PDF handling.
