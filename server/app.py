from flask import Flask, request, jsonify, render_template, redirect, url_for, session, flash
from database import get_db, init_db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import os, tempfile, subprocess, pathlib, unicodedata, threading,time,json, signal
import psutil

app = Flask(
	__name__, 
	static_folder='../static',
	template_folder='../web'
	)

app.secret_key = os.environ.get("SECRET_KEY", "ESTOSE USA PARA FIRMAR LAS COOKIES")

CORS(app)

init_db()

MAX_CODE_SIZE = 100 * 1024
EXEC_TIMEOUT_SEC = 10.0
MAX_OUTPUT_CHARS = 62_000
DOCKER_IMAGE = "lua-sandbox:1"

#docker build -t lua-sandbox "C:\Users\User\Desktop\lua-sandbox\docker"
#docker run -it lua-sandbox


def quitar_tildes(txt: str) -> str:
    nfkd = unicodedata.normalize("NFKD", txt)
    return "".join(c for c in nfkd if not unicodedata.combining(c))

@app.post("/run")
def run_code():
    payload = request.get_json(silent=True) or {}
    code = payload.get("code", "")
    if not isinstance(code, str):
        return jsonify({"output": "Error: 'code' debe ser texto"}), 400
    if len(code.encode("utf-8")) > MAX_CODE_SIZE:
        return jsonify({"output": "Error: código demasiado grande (máximo 100KB)"}), 400

    code = quitar_tildes(code)

    with tempfile.TemporaryDirectory() as tmpdir:
        work = pathlib.Path(tmpdir)
        (work / "code.lua").write_text(code, encoding="utf-8")

        cmd = [
            "docker", "run", "--rm",
            "--network", "bridge",
            "--cpus", "4", 
            "--memory", "1024m",
            "--pids-limit", "64",
            "--read-only",
            "--cap-drop", "ALL",
            "--security-opt", "no-new-privileges",
            "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
            "-e", "INSTR_LIMIT=1000",
            "-v", f"{work}:/work:ro",
            DOCKER_IMAGE
        ]

        try:
            start = time.perf_counter()
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=EXEC_TIMEOUT_SEC
            )
            end = time.perf_counter()
            elapsed = end - start

            output = (proc.stdout or "") + (proc.stderr or "")
        except subprocess.TimeoutExpired:
            output = "Time limit exceeded (wall time)\n"
            elapsed = EXEC_TIMEOUT_SEC
        except Exception as e:
            output = f"Error del servidor: {e}\n"
            elapsed = 0

    # limpiar paths
    output = output.replace("/work/", "")

    # añadir tiempo usado
    output += f"\nTiempo usado: {elapsed:.2f} segundos"

    if len(output) > MAX_OUTPUT_CHARS:
        output = output[:MAX_OUTPUT_CHARS] + "\n[output truncada]\n"

    return jsonify({"output": output})

@app.route("/logout")
def logout():
    session.pop("usuario", None)
    return redirect(url_for("login_page"))

@app.route("/")
def index():
    return render_template('index.html')

# ----------------------------------------------
# REGISTRO DE USUARIO
# ----------------------------------------------

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        usuario = request.form.get("usuario")
        email = request.form.get("email")
        password = request.form.get("password")
        confirmar = request.form.get("confirm_password")

        if not usuario or not email or not password:
            flash("Todos los campos son obligatorios", "error")
            return redirect(url_for("register"))

        if password != confirmar:
            flash("Las contraseñas no coinciden", "error")
            return redirect(url_for("register"))

        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT id FROM users WHERE usuario = ? OR email = ?", (usuario, email))
        if cursor.fetchone():
            flash("El usuario o correo ya están registrados", "error")
            return redirect(url_for("register"))

        password_hash = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO users (usuario, email, password_hash) VALUES (?, ?, ?)",
            (usuario, email, password_hash)
        )
        db.commit_and_close()

        flash("Registro exitoso, ahora puedes iniciar sesión", "success")
        return redirect(url_for("login_page"))

    return render_template("register.html")  

# ----------------------------------------------
# LOGIN DE USUARIO
# ----------------------------------------------

@app.route('/login', methods=["POST", "GET"])
def login_page():
    if request.method == "POST":
        usuario = request.form.get("usuario")
        password = request.form.get("password")
        print(usuario, password)
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT id, usuario, password_hash FROM users WHERE usuario = ?",(usuario,))
        user = cursor.fetchone()
        db.commit_and_close()
        if usuario == "admin" and password == "admin":
            return redirect(url_for('admin_page'))
        if user and check_password_hash(user["password_hash"], password):
            session['usuario'] = user["usuario"]
            flash("Inicio de sesión exitoso", "success")
            print("Tamos gozus")
            return redirect(url_for('index'))
        else:
            flash("Credenciales Inválidas", "error")
            print("Error putooooooooooo")
            return render_template('login.html')
    return render_template('login.html')

@app.route('/admin')
def admin_page():
    if "usuario" not in session:
        print("Usuario no está en session")
        return redirect(url_for("login_page"))
    print(f"Direccionando a admin: {session['usuario']}")
    return render_template('admin.html')

def run_flask():
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)

def cerrar_entorno(signum, frame):
    print("Culminando terminal")
    os._exit(0)

signal.signal(signal.SIGINT, cerrar_entorno)

if __name__ == "__main__":
	thread = threading.Thread(target=run_flask)
	thread.start()
	time.sleep(3)
	print("Inicializando Dominio wiadeuserrant.org")
	print("Usando archivo: tunnel-config.yml")
	tunnel_command = "host.exe tunnel run flask-wiade"
	os.system(tunnel_command)
