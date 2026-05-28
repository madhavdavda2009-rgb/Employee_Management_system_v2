import sqlite3

conn = sqlite3.connect("employees.db")
cursor = conn.cursor()

cursor.execute(
    """create table if not exists employees(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department TEXT NOT NULL
    )"""
)


conn.commit()
conn.close()
print("Database and table created successfully.")
