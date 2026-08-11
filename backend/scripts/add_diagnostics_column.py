import sqlite3
import os

DB = os.path.join(os.path.dirname(__file__), '..', 'telecom_support.db')
DB = os.path.abspath(DB)
print('Using DB:', DB)
conn = sqlite3.connect(DB)
cur = conn.cursor()
cur.execute("PRAGMA table_info(tickets)")
cols = [r[1] for r in cur.fetchall()]
print('existing columns:', cols)
if 'diagnostics' in cols:
    print('diagnostics column already present')
else:
    try:
        cur.execute('ALTER TABLE tickets ADD COLUMN diagnostics TEXT')
        conn.commit()
        print('diagnostics column added')
    except Exception as e:
        print('failed to add diagnostics:', e)
conn.close()
