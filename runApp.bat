@echo off
REM Setting environment variables
SET FLASK_APP=app.py
SET FLASK_ENV=development

REM Running the Flask application
python -m flask run

REM Pausing to allow the server to start
timeout /t 5 /nobreak

REM Opening the browser
start http://127.0.0.1:5000/
