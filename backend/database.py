import sqlite3

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


def add_pdf_metadata(filename, text):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO pdfs (filename, text) VALUES (?, ?)', (filename, text))
    conn.commit()
    conn.close()
