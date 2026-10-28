import sqlite3
from datetime import datetime

DB_NAME = "nova.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            content TEXT,
            timestamp DATETIME
        )
    """)
    conn.commit()
    conn.close()

def save_message(session_id, role, content):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        "INSERT INTO chats (session_id, role, content, timestamp) VALUES (?, ?, ?, ?)",
        (session_id, role, content, now)
    )
    conn.commit()
    conn.close()

def get_chat_history(session_id, limit=10):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT role, content FROM chats WHERE session_id = ? ORDER BY id DESC LIMIT ?",
        (session_id, limit)
    )
    rows = cursor.fetchall()
    conn.close()
    history = [{"role": row[0], "content": row[1]} for row in reversed(rows)]
    return history
