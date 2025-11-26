# Setup virtual environment for backend

This document explains how to create and use a Python virtual environment (`.venv`) for the `backend` folder on Windows (PowerShell).

Steps (run in `d:\test\myproject\backend`):

1. Create the virtual environment

```powershell
python -m venv .venv
```

2. Activate the virtual environment (PowerShell)

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell prevents script execution you can allow user-level unsigned scripts (one-time):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser; .\.venv\Scripts\Activate.ps1
```

3. Upgrade pip and install dependencies

```powershell
python -m pip install --upgrade pip
pip install -r .\app\requirements.txt
```

4. Verify installation

```powershell
python --version
pip list
```

Requirements file content (from `app/requirements.txt`):

```
fastapi
uvicorn
sqlalchemy
psycopg2
pydantic
pytest
ruff
argon2-cffi
python-jose
```

5. Run the app (from `backend`):

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Notes:
- The `.venv/` folder is created in `backend` and should be ignored by git. The repository `.gitignore` already contains a `.venv/` entry; we will also explicitly ignore `backend/.venv/`.
- If you prefer a different virtual environment tool, adapt the commands accordingly.
