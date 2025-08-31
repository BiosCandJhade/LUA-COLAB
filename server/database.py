import sqlite3
import os
from datetime import datetime

class Database:
    def __init__(self, db_path="luacolab.db"):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        """Obtener conexión a la base de datos"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Acceso por nombre
        return conn

    def cursor(self):
        self.conn = self.get_connection()
        return self.conn.cursor()
    
    def commit_and_close(self):
        if self.conn:
            self.conn.commit()
            self.conn.close()
            self.conn = None

    def init_database(self):
        """Inicializar la base de datos y crear tablas"""
        conn = self.get_connection()
        cursor = conn.cursor()


        # =====================
        # USUARIOS
        # =====================
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_access TIMESTAMP,
            is_active INTEGER DEFAULT 1
        )
        """)

        # =====================
        # SESIONES (IPs, accesos)
        # =====================
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            ip_address TEXT,
            login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            logout_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        # =====================
        # EJECUCIONES DE CÓDIGO
        # =====================
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS executions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_id INTEGER,
            code_input TEXT NOT NULL, 
            code_output TEXT,
            input_size INTEGER,       -- tamaño del input en bytes
            output_size INTEGER,      -- tamaño del output en bytes
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            duration_ms INTEGER,      -- duración en milisegundos
            exit_status TEXT,         -- OK, ERROR, TIMEOUT, etc.
            error_message TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        )
        """)

        # =====================
        # MÉTRICAS DE RECURSOS
        # =====================
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS execution_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            execution_id INTEGER NOT NULL,
            cpu_usage REAL,           -- núcleos usados (ej. 0.25)
            ram_usage_mb REAL,
            instruction_count INTEGER,
            pid_count INTEGER,
            FOREIGN KEY (execution_id) REFERENCES executions(id)
        )
        """)

        # =====================
        # CELDAS (PROMPT ↔ RESPUESTA)
        # =====================
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS cells (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            prompt TEXT NOT NULL,
            response TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        # =====================
        # PERFILES DE LÍMITES
        # =====================
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS limits_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,     -- LOW, MEDIUM, HIGH, CUSTOM
            cpu_limit REAL,
            ram_limit_mb INTEGER,
            time_limit_ms INTEGER,
            input_limit_kb INTEGER,
            output_limit_kb INTEGER,
            instruction_limit INTEGER,
            pid_limit INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # =====================
        # LÍMITES PERSONALIZADOS DE USUARIO
        # =====================
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_limits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            profile_id INTEGER,
            custom_cpu REAL,
            custom_ram_mb INTEGER,
            custom_time_ms INTEGER,
            custom_input_kb INTEGER,
            custom_output_kb INTEGER,
            custom_instructions INTEGER,
            custom_pid_limit INTEGER,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (profile_id) REFERENCES limits_profiles(id)
        )
        """)

        conn.commit()
        conn.close()


# Instancia global de la base de datos
db = Database()

# Funciones de conveniencia
def get_db():
    return db

def init_db():
    db.init_database()

#==================================================================================================================
#USUARIOS
#CORREOS
#CONTRASEÑAS
#ips
#fechas de accesos(hora incluida)
#cantidad de ejecuciones x dia
#celdas ejecutadas(se guarda esto para no perder progreso(se divide en prompt y respuesta))
#CPU
#RAM
#Tiempo de ejecución
#Input(peso del código)
#output
#instrucciones
#==================================================================================================================