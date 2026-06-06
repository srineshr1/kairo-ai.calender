<#
.SYNOPSIS
    Deploy Kairo Bridge backend to AWS EC2 with Docker

.DESCRIPTION
    Creates EC2 instance, security group, key pair, and deploys the
    whatsapp-bridge using Docker Compose with persistent sessions volume.

.PARAMETER InstanceType
    EC2 instance type (default: t3.micro - free tier eligible)

.PARAMETER KeyName
    SSH key pair name (default: kairo-bridge-key)

.PARAMETER DryRun
    Validate configuration only, do not create resources
#>

param(
    [string]$InstanceType = "t3.micro",
    [string]$KeyName = "kairo-bridge-key",
    [string]$SecurityGroupName = "kairo-bridge-sg",
    [int]$BridgePort = 3001,
    [string]$InstanceName = "kairo-bridge",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$script:Region = aws configure get region 2>$null
if (-not $script:Region) { $script:Region = "ap-south-2" }

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$BridgeDir = Join-Path $ProjectRoot "whatsapp-bridge"
$KeyFile = Join-Path $PSScriptRoot "$KeyName.pem"

$UbuntuAMI = "/aws/service/canonical/ubuntu/server/22.04/stable/current/amd64/hvm/ebs-gp2/ami-id"

# ------------------------------------------------------------------
# Helper functions
# ------------------------------------------------------------------

function Write-Step { param([string]$Msg) Write-Host "`n>>> $Msg" -ForegroundColor Cyan }
function Write-OK { param([string]$Msg) Write-Host "  OK  $Msg" -ForegroundColor Green }
function Write-Warn { param([string]$Msg) Write-Host "  WARN $Msg" -ForegroundColor Yellow }
function Write-Err { param([string]$Msg) Write-Host "  ERR  $Msg" -ForegroundColor Red }

function Get-MyIP {
    try {
        (Invoke-RestMethod -Uri "https://checkip.amazonaws.com" -TimeoutSec 5).Trim()
    } catch {
        Write-Warn "Could not determine your public IP. Using 0.0.0.0/0 (open to all)."
        "0.0.0.0/0"
    }
}

# ------------------------------------------------------------------
# Pre-flight checks
# ------------------------------------------------------------------

Write-Step "Pre-flight checks"

# Check AWS CLI
$awsVersion = aws --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "AWS CLI not found. Install from https://aws.amazon.com/cli/"
    exit 1
}
Write-OK "AWS CLI: $awsVersion"

# Check identity
$identity = aws sts get-caller-identity --output json 2>&1 | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) {
    Write-Err "AWS credentials not configured. Run 'aws configure' first."
    exit 1
}
Write-OK "AWS Identity: $($identity.Arn)"

# Check .env file
$envFile = Join-Path $BridgeDir ".env"
if (-not (Test-Path $envFile)) {
    Write-Err ".env file not found at $envFile"
    Write-Host "  Create it from .env.example with your API keys and Supabase credentials."
    exit 1
}

$envContent = Get-Content $envFile -Raw
$requiredVars = @("GROQ_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")
$missingVars = @()
foreach ($var in $requiredVars) {
    if ($envContent -notmatch "(?m)^$var=\S") {
        $missingVars += $var
    }
}
if ($missingVars.Count -gt 0) {
    Write-Err "Missing required env vars in .env: $($missingVars -join ', ')"
    Write-Host "  Add them before deploying."
    exit 1
}
Write-OK ".env file found with required variables"

# Check docker-compose.yml
if (-not (Test-Path (Join-Path $BridgeDir "docker-compose.yml"))) {
    Write-Err "docker-compose.yml not found in $BridgeDir"
    exit 1
}
Write-OK "docker-compose.yml found"

if ($DryRun) {
    Write-Step "Dry run complete - all checks passed"
    exit 0
}

# ------------------------------------------------------------------
# Get Ubuntu AMI
# ------------------------------------------------------------------

Write-Step "Looking up latest Ubuntu 22.04 AMI for $script:Region"
$amiId = aws ssm get-parameters --names $UbuntuAMI --query "Parameters[0].Value" --output text --region $script:Region 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "Failed to look up AMI: $amiId"
    exit 1
}
Write-OK "AMI: $amiId"

# ------------------------------------------------------------------
# Security Group
# ------------------------------------------------------------------

Write-Step "Setting up security group"

$existingSg = aws ec2 describe-security-groups --region $script:Region `
    --filters "Name=group-name,Values=$SecurityGroupName" `
    --query "SecurityGroups[0].GroupId" --output text 2>&1

if ($existingSg -ne "None" -and $LASTEXITCODE -eq 0) {
    $sgId = $existingSg
    Write-OK "Using existing security group: $sgId"
} else {
    $vpcId = aws ec2 describe-vpcs --region $script:Region `
        --filters "Name=isDefault,Values=true" `
        --query "Vpcs[0].VpcId" --output text 2>&1

    $sgId = aws ec2 create-security-group --region $script:Region `
        --group-name $SecurityGroupName `
        --description "Kairo Bridge - SSH, HTTP, HTTPS, Bridge port" `
        --vpc-id $vpcId `
        --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$SecurityGroupName}]" `
        --query "GroupId" --output text 2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to create security group: $sgId"
        exit 1
    }
    Write-OK "Created security group: $sgId"

    # Ingress rules
    $myIP = Get-MyIP
    $ipCidr = if ($myIP -ne "0.0.0.0/0") { "$myIP/32" } else { "0.0.0.0/0" }

    $rules = @(
        @{Port=22;   Protocol="tcp"; Cidr=$ipCidr;       Desc="SSH from your IP"},
        @{Port=$BridgePort; Protocol="tcp"; Cidr="0.0.0.0/0"; Desc="Bridge API"},
        @{Port=80;  Protocol="tcp"; Cidr="0.0.0.0/0";    Desc="HTTP"},
        @{Port=443; Protocol="tcp"; Cidr="0.0.0.0/0";    Desc="HTTPS"}
    )

    $ipPermissions = @()
    foreach ($rule in $rules) {
        $ipPermissions += @{
            IpProtocol = $rule.Protocol
            FromPort   = $rule.Port
            ToPort     = $rule.Port
            IpRanges   = @(@{ CidrIp = $rule.Cidr; Description = $rule.Desc })
        }
    }

    $ipPermissionsJson = $ipPermissions | ConvertTo-Json -Compress -Depth 3
    aws ec2 authorize-security-group-ingress --region $script:Region `
        --group-id $sgId --ip-permissions $ipPermissionsJson 2>&1 | Out-Null

    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Some ingress rules may already exist (this is OK)"
    }
    Write-OK "Ingress rules configured (SSH: $ipCidr, Bridge: 0.0.0.0/0)"
}

# ------------------------------------------------------------------
# Key Pair
# ------------------------------------------------------------------

Write-Step "Setting up SSH key pair"

$existingKey = aws ec2 describe-key-pairs --region $script:Region `
    --key-names $KeyName --query "KeyPairs[0].KeyName" --output text 2>&1

if ($existingKey -ne "None" -and $LASTEXITCODE -eq 0) {
    Write-OK "Using existing key pair: $KeyName"
    if (-not (Test-Path $KeyFile)) {
        Write-Warn "Key file not found locally at $KeyFile. You'll need the .pem file to SSH."
        Write-Warn "If lost, delete the key pair in AWS console and re-run this script."
    }
} else {
    $keyJson = aws ec2 create-key-pair --region $script:Region `
        --key-name $KeyName --output json 2>&1 | ConvertFrom-Json

    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to create key pair"
        exit 1
    }

    [System.IO.File]::WriteAllText($KeyFile, $keyJson.KeyMaterial, [System.Text.Encoding]::ASCII)
    Write-OK "Created key pair and saved to: $KeyFile"

    $whoami = whoami
    icacls $KeyFile /inheritance:r 2>&1 | Out-Null
    icacls $KeyFile /grant:r "$whoami`:(R)" 2>&1 | Out-Null
    Write-OK "Key file permissions restricted to current user"
}

# ------------------------------------------------------------------
# User Data (Docker install)
# ------------------------------------------------------------------

Write-Step "Preparing EC2 instance"

$userData = @'
#!/bin/bash
set -e
exec > /var/log/user-data.log 2>&1

echo "=== Installing Docker ==="
apt-get update -y
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
usermod -aG docker ubuntu
systemctl enable docker
systemctl start docker

echo "=== Docker installed successfully ==="
docker --version
docker compose version

echo "=== User data complete ==="
'@

$userDataB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($userData))

# ------------------------------------------------------------------
# Launch EC2 Instance
# ------------------------------------------------------------------

Write-Step "Launching EC2 instance ($InstanceType)"

$instanceId = aws ec2 run-instances --region $script:Region `
    --image-id $amiId `
    --instance-type $InstanceType `
    --key-name $KeyName `
    --security-group-ids $sgId `
    --user-data $userDataB64 `
    --block-device-mappings "DeviceName=/dev/sda1,Ebs={VolumeSize=20,VolumeType=gp3}" `
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$InstanceName},{Key=Project,Value=kairo}]" `
    --query "Instances[0].InstanceId" --output text 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Err "Failed to launch instance: $instanceId"
    exit 1
}
Write-OK "Instance launched: $instanceId"

# Wait for running state
Write-Host "  Waiting for instance to be running..."
aws ec2 wait instance-running --region $script:Region --instance-ids $instanceId
aws ec2 wait instance-status-ok --region $script:Region --instance-ids $instanceId
Write-OK "Instance is running and healthy"

# Get public IP
$publicIP = aws ec2 describe-instances --region $script:Region `
    --instance-ids $instanceId `
    --query "Reservations[0].Instances[0].PublicIpAddress" --output text 2>&1
Write-OK "Public IP: $publicIP"

# ------------------------------------------------------------------
# Elastic IP (optional, for stable address)
# ------------------------------------------------------------------

Write-Step "Allocating Elastic IP"

$allocId = aws ec2 allocate-address --region $script:Region `
    --domain vpc --tag-specifications "ResourceType=elastic-ip,Tags=[{Key=Name,Value=$InstanceName-eip}]" `
    --query "AllocationId" --output text 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Warn "Could not allocate Elastic IP (may hit account limit). Using dynamic IP instead."
    $elasticIP = $publicIP
} else {
    Write-OK "Elastic IP allocated: $allocId"

    Start-Sleep -Seconds 5
    aws ec2 associate-address --region $script:Region `
        --instance-id $instanceId --allocation-id $allocId 2>&1 | Out-Null

    $elasticIP = aws ec2 describe-addresses --region $script:Region `
        --allocation-ids $allocId --query "Addresses[0].PublicIp" --output text 2>&1
    Write-OK "Elastic IP associated: $elasticIP"
}

# ------------------------------------------------------------------
# Wait for user-data (Docker install) to complete
# ------------------------------------------------------------------

Write-Step "Waiting for Docker to be ready on the instance (this may take 2-3 minutes)"
$maxWait = 20
$ready = $false
for ($i = 1; $i -le $maxWait; $i++) {
    $status = ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i $KeyFile "ubuntu@$elasticIP" "docker --version" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $ready = $true
        Write-OK "Docker ready after $i attempts"
        break
    }
    Write-Host "  Attempt $i/$maxWait - waiting for instance to finish bootstrapping..."
    Start-Sleep -Seconds 15
}

if (-not $ready) {
    Write-Err "Timed out waiting for Docker. Check /var/log/user-data.log on the instance."
    Write-Host "  ssh -i $KeyFile ubuntu@$elasticIP"
    exit 1
}

# ------------------------------------------------------------------
# Deploy the application
# ------------------------------------------------------------------

Write-Step "Deploying Kairo Bridge to EC2"

# Create a .env for production on the instance
Write-Host "  Preparing production .env..."
$prodEnv = @"
# Kairo Bridge - AWS Production
$(Get-Content $envFile -Raw)

NODE_ENV=production
BRIDGE_REQUIRE_AUTH=true
PORT=$BridgePort
BRIDGE_PORT=$BridgePort
CALENDAR_URL=https://kairocalender.web.app
ALLOWED_ORIGINS=http://localhost:5173,https://kairo.srinesh.in,https://kairocalender.web.app,https://kairocalender.firebaseapp.com
"@

# Copy files to instance
Write-Host "  Copying files to instance..."
$tempEnv = Join-Path $env:TEMP "kairo-deploy.env"
Set-Content -Path $tempEnv -Value $prodEnv -NoNewline

ssh -o StrictHostKeyChecking=no -i $KeyFile "ubuntu@$elasticIP" "mkdir -p ~/whatsapp-bridge" 2>&1 | Out-Null

scp -o StrictHostKeyChecking=no -i $KeyFile (Join-Path $BridgeDir "docker-compose.yml") "ubuntu@${elasticIP}:~/whatsapp-bridge/" 2>&1
scp -o StrictHostKeyChecking=no -i $KeyFile (Join-Path $BridgeDir "Dockerfile") "ubuntu@${elasticIP}:~/whatsapp-bridge/" 2>&1
scp -o StrictHostKeyChecking=no -i $KeyFile (Join-Path $BridgeDir ".dockerignore") "ubuntu@${elasticIP}:~/whatsapp-bridge/" 2>&1
scp -o StrictHostKeyChecking=no -i $KeyFile (Join-Path $BridgeDir "package.json") "ubuntu@${elasticIP}:~/whatsapp-bridge/" 2>&1
scp -o StrictHostKeyChecking=no -i $KeyFile (Join-Path $BridgeDir "package-lock.json") "ubuntu@${elasticIP}:~/whatsapp-bridge/" 2>&1
scp -o StrictHostKeyChecking=no -i $KeyFile $tempEnv "ubuntu@${elasticIP}:~/whatsapp-bridge/.env" 2>&1

# Copy all source files
$sourceFiles = @(
    "bridge-server.js", "sessionManager.js", "whatsappProcessor.js",
    "supabaseClient.js", "extractor.js"
)
foreach ($file in $sourceFiles) {
    $src = Join-Path $BridgeDir $file
    if (Test-Path $src) {
        scp -o StrictHostKeyChecking=no -i $KeyFile $src "ubuntu@${elasticIP}:~/whatsapp-bridge/" 2>&1 | Out-Null
    }
}

# Copy middleware directory
scp -o StrictHostKeyChecking=no -i $KeyFile -r (Join-Path $BridgeDir "middleware") "ubuntu@${elasticIP}:~/whatsapp-bridge/" 2>&1

Remove-Item $tempEnv -Force -ErrorAction SilentlyContinue
Write-OK "Files copied"

# Build and start
Write-Host "  Building and starting Docker container (this will take several minutes)..."
$buildOutput = ssh -o StrictHostKeyChecking=no -i $KeyFile "ubuntu@$elasticIP" "cd ~/whatsapp-bridge && docker compose up -d --build 2>&1"
Write-Host $buildOutput

if ($LASTEXITCODE -ne 0) {
    Write-Err "Docker build may have failed. Check logs on the instance:"
    Write-Host "  ssh -i $KeyFile ubuntu@$elasticIP"
    Write-Host "  cd ~/whatsapp-bridge && docker compose logs"
    exit 1
}

# Wait for container to be healthy
Write-Host "  Waiting for container to be healthy..."
Start-Sleep -Seconds 10

$healthCheck = Invoke-RestMethod -Uri "http://$($elasticIP):$BridgePort/health" -TimeoutSec 10 -ErrorAction SilentlyContinue
if ($healthCheck) {
    Write-OK "Health check passed: $($healthCheck | ConvertTo-Json -Compress)"
} else {
    Write-Warn "Health check failed. Container may still be starting."
    Write-Host "  Check: curl http://$($elasticIP):$BridgePort/health"
}

# ------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------

Write-Step "Deployment complete!"
Write-Host ""
Write-Host "  Instance ID : $instanceId"
Write-Host "  Public IP   : $elasticIP"
Write-Host "  Bridge URL  : http://$($elasticIP):$BridgePort"
Write-Host "  Health      : http://$($elasticIP):$BridgePort/health"
Write-Host ""
Write-Host "  SSH: ssh -i $KeyFile ubuntu@$elasticIP"
Write-Host "  Logs: ssh -i $KeyFile ubuntu@$elasticIP 'cd ~/whatsapp-bridge && docker compose logs -f'"
Write-Host ""
Write-Host "==============================================="
Write-Host " NEXT STEPS:"
Write-Host "==============================================="
Write-Host "  1. Update frontend VITE_BRIDGE_URL=http://$($elasticIP):$BridgePort"
Write-Host "  2. Rebuild & redeploy frontend to Firebase"
Write-Host "  3. (Optional) Set up a domain + HTTPS with Nginx/Caddy"
Write-Host "==============================================="
Write-Host ""
Write-Host "To tear down: aws ec2 terminate-instances --region $script:Region --instance-ids $instanceId"
Write-Host "             aws ec2 release-address --region $script:Region --allocation-id $allocId"
Write-Host "             aws ec2 delete-security-group --region $script:Region --group-id $sgId"
