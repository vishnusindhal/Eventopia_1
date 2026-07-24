# ==============================================================================
#  Eventopia — Local Deployment Orchestrator for AWS EC2
#  Run this script on your Windows machine to deploy the app to AWS.
# ==============================================================================

# Set encoding to UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         Eventopia Local Deployment Orchestrator          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Prompt for Deployment Details
$DefaultIP = ""
$EC2_IP = Read-Host "1. Enter your EC2 Instance Public IP"
if ([string]::IsNullOrWhiteSpace($EC2_IP)) {
    Write-Error "EC2 Public IP is required. Exiting."
    Exit 1
}

$DefaultKey = "eventopia-key.pem"
$KeyInput = Read-Host "2. Enter the path to your SSH key .pem file [Default: eventopia-key.pem]"
$KEY_PATH = if ([string]::IsNullOrWhiteSpace($KeyInput)) { $DefaultKey } else { $KeyInput }

if (-not (Test-Path $KEY_PATH)) {
    Write-Error "SSH Private Key not found at '$KEY_PATH'. Please place it in the project folder or verify the path. Exiting."
    Exit 1
}

Write-Host "`n--- Email Alert Configuration (Optional) ---" -ForegroundColor Yellow
$EMAIL_USER = Read-Host "3. Enter your Gmail address (press Enter to skip email alerts)"
$EMAIL_PASSWORD_PLAIN = ""
if (-not [string]::IsNullOrWhiteSpace($EMAIL_USER)) {
    $EMAIL_PASSWORD = Read-Host "   Enter your Gmail App Password" -AsSecureString
    if ($EMAIL_PASSWORD) {
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($EMAIL_PASSWORD)
        $EMAIL_PASSWORD_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }
}

# 2. Fix Key File Permissions (Crucial Windows SSH Fix)
Write-Host "`n--> Adjusting SSH key permissions for OpenSSH compliance..." -ForegroundColor Green
try {
    $KeyFullPath = (Get-Item $KEY_PATH).FullName
    $Acl = Get-Acl $KeyFullPath
    
    # Disable inheritance and remove inherited rules
    $Acl.SetAccessRuleProtection($true, $false)
    $Acl.Access | ForEach-Object { $Acl.RemoveAccessRule($_) } | Out-Null
    
    # Grant Full Control only to the current user
    $CurrentUser = [System.Security.Principal.NTAccount]("$env:USERDOMAIN\$env:USERNAME")
    $AccessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($CurrentUser, "FullControl", "Allow")
    $Acl.AddAccessRule($AccessRule)
    
    Set-Acl $KeyFullPath $Acl
    Write-Host "    Key permissions secured successfully (Only $env:USERNAME has access)." -ForegroundColor Gray
} catch {
    Write-Warning "Could not secure key file permissions: $_. If SSH fails, run: icacls `"$KEY_PATH`" /inheritance:r /grant `"$($env:USERNAME):F`""
}

# 3. Create Production Environment file
Write-Host "`n--> Generating production environment file..." -ForegroundColor Green
$JWT_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

$EnvContent = @"
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/eventopia
REDIS_URL=redis://redis:6379
KAFKA_BROKERS=kafka:29092
KAFKA_CLIENT_ID=eventopia-backend
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=30d
CLIENT_URL=http://$EC2_IP,https://eventopia-1.vercel.app
VITE_API_URL=http://$EC2_IP/api
NODE_ENV=production

# Email Config
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=$EMAIL_USER
EMAIL_PASSWORD=$EMAIL_PASSWORD_PLAIN
"@

$EnvContent | Out-File -FilePath deploy.env -Encoding utf8 -NoNewline
Write-Host "    deploy.env file generated." -ForegroundColor Gray

# 4. Archive project code (excluding node_modules/git folders)
Write-Host "`n--> Packaging project source files using native 'tar'..." -ForegroundColor Green
if (Test-Path eventopia.tar.gz) { Remove-Item eventopia.tar.gz -Force }

# Windows 10/11 includes bsdtar.exe by default at System32\tar.exe
& tar --exclude=".git" --exclude="node_modules" --exclude="backend/node_modules" --exclude="frontend/node_modules" --exclude="dist" --exclude=".env" --exclude="eventopia.tar.gz" --exclude="deploy.env" -czf eventopia.tar.gz .

if (-not (Test-Path eventopia.tar.gz)) {
    Write-Error "Failed to create eventopia.tar.gz archive. Exiting."
    Remove-Item deploy.env -Force -ErrorAction SilentlyContinue
    Exit 1
}
Write-Host "    Project packaged: eventopia.tar.gz (~$((Get-Item eventopia.tar.gz).Length / 1MB -as [int]) MB)." -ForegroundColor Gray

# 5. Upload files to EC2
Write-Host "`n--> Uploading package, setup script, and configuration to EC2 via SCP..." -ForegroundColor Green
Write-Host "    Connecting to ubuntu@$EC2_IP (This may take a moment to upload)..." -ForegroundColor Gray

scp -o StrictHostKeyChecking=no -i $KEY_PATH eventopia.tar.gz ec2-setup.sh deploy.env ubuntu@${EC2_IP}:~/

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to upload files to EC2 instance. Verify the IP address, key path, and security group inbound SSH rule. Exiting."
    Remove-Item deploy.env, eventopia.tar.gz -Force -ErrorAction SilentlyContinue
    Exit 1
}
Write-Host "    Upload complete!" -ForegroundColor Gray

# 6. Execute Remote Setup
Write-Host "`n--> Connecting via SSH to run installation script..." -ForegroundColor Green
ssh -o StrictHostKeyChecking=no -i $KEY_PATH ubuntu@$EC2_IP "chmod +x ~/ec2-setup.sh && ~/ec2-setup.sh"

$SshStatus = $LASTEXITCODE

# 7. Clean up local files
Remove-Item deploy.env, eventopia.tar.gz -Force -ErrorAction SilentlyContinue

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($SshStatus -eq 0) {
    Write-Host " 🎉 Deployment Orchestration Complete!" -ForegroundColor Green
    Write-Host " Open your browser and go to: http://$EC2_IP" -ForegroundColor Green
} else {
    Write-Warning " Remote deployment script completed with exit code $SshStatus."
    Write-Warning " Please inspect the remote server output above to diagnose any errors."
}
Write-Host "==========================================================" -ForegroundColor Cyan
