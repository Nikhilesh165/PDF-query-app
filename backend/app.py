import os
import fitz  # PyMuPDF
import sqlite3
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from langchain.llms import Ollama
from langchain.chains.question_answering import load_qa_chain
from langchain.schema import Document

from pydantic import BaseModel


UPLOAD_DIR = "./uploads"
DB_NAME = "pdf_metadata.db"

# Initialize FastAPI app
app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
DB_NAME = "pdf_metadata.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS pdfs (
        id INTEGER PRIMARY KEY,
        filename TEXT NOT NULL,
        text TEXT NOT NULL
    )''')
    conn.commit()
    conn.close()

# Add PDF metadata to database
def add_pdf_metadata(filename, text):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO pdfs (filename, text) VALUES (?, ?)', (filename, text))
    conn.commit()
    conn.close()

# Retrieve PDF text from database
def get_pdf_text(filename):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT text FROM pdfs WHERE filename = ?', (filename,))
    result = cursor.fetchone()
    conn.close()
    return result[0] if result else None

#def get_all_pdfs():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT filename FROM pdfs')  # Adjust the query as needed
    pdfs = cursor.fetchall()
    conn.close()
    return [pdf[0] for pdf in pdfs]  # Return a list of filenames

init_db()


@app.get("/list-pdfs/")
def list_pdfs():
    try:
        conn = sqlite3.connect("pdf_metadata.db")
        cursor = conn.cursor()
        cursor.execute('SELECT id, filename FROM pdfs')
        pdfs = cursor.fetchall()
        conn.close()
        return {"pdfs": [{"id": pdf[0], "filename": pdf[1]} for pdf in pdfs]}
    except Exception as e:
        return JSONResponse(content={"message": str(e)}, status_code=500)

# Query a specific PDF

@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        doc = fitz.open(file_path)
        text = "".join([page.get_text() for page in doc])
        doc.close()

        add_pdf_metadata(file.filename, text)
        return JSONResponse(content={"message": "File uploaded successfully!"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload PDF: {str(e)}")
        
@app.delete("/delete-pdf/{pdf_id}/")
def delete_pdf(pdf_id: int):
    try:
        conn = sqlite3.connect("pdf_metadata.db")
        cursor = conn.cursor()
        cursor.execute('SELECT filename FROM pdfs WHERE id = ?', (pdf_id,))
        result = cursor.fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="PDF not found in the database.")

        filename = result[0]

        # Remove the PDF from the database
        cursor.execute('DELETE FROM pdfs WHERE id = ?', (pdf_id,))
        conn.commit()
        conn.close()

        # Remove the PDF file from the uploads directory
        filepath = f"{UPLOAD_DIR}/{filename}"
        if os.path.exists(filepath):
            os.remove(filepath)

        return {"message": "PDF deleted successfully"}
    except Exception as e:
        return JSONResponse(content={"message": str(e)}, status_code=500)

class QueryRequest(BaseModel):
    filename: str
    question: str
@app.post("/query/")
async def query_pdf(request: QueryRequest):
    try:
        filename = request.filename
        question = request.question

        # Retrieve content from the database
        conn = sqlite3.connect("pdf_metadata.db")
        cursor = conn.cursor()
        cursor.execute('SELECT text FROM pdfs WHERE filename = ?', (filename,))
        result = cursor.fetchone()
        conn.close()

        if not result:
            raise HTTPException(status_code=404, detail="PDF not found in the database.")

        content = result[0]
        # Initialize LangChain for question answering
        llm = Ollama(model="llama3.2")  
        chain = load_qa_chain(llm, chain_type="stuff")
        doc = Document(page_content=content)

        # Run the chain on the content
        answer = chain.run(input_documents=[doc], question=question)

        return JSONResponse(content={"answer": answer}, status_code=200)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"message": f"Internal server error: {str(e)}"}, status_code=500)
@app.get("/")
def root():
    return {"message": "Welcome to the PDF Query App!"}