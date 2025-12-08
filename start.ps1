# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; python main.py"

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Backend and Frontend starting in separate windows..."
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"
