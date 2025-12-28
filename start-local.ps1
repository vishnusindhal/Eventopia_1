# Start backend and frontend dev servers in separate PowerShell windows
# Run this from the repo root using: .\start-local.ps1
Start-Process -NoNewWindow -FilePath powershell -ArgumentList '-NoExit','-Command','cd backend; npm install; npm run dev'
Start-Process -NoNewWindow -FilePath powershell -ArgumentList '-NoExit','-Command','cd frontend; npm install; npm run dev'
