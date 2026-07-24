#!/bin/bash
# ==============================================================================
#  Eventopia — EC2 Remote Deployment & Configuration Script
#  This script runs on the EC2 Ubuntu instance to install Docker and boot the app.
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

echo "=========================================================="
echo "          Starting Eventopia EC2 Remote Setup            "
echo "=========================================================="

# 1. Update and install system dependencies
echo "--> [1/6] Updating packages and installing system tools..."
sudo apt-get update -y
sudo apt-get install -y curl tar git ca-certificates gnupg build-essential

# 2. Configure Swap Space (Critical for 1GB/2GB RAM Free-tier instances)
echo "--> [2/6] Configuring 4GB Swap Memory (prevents Kafka/Mongo crashes)..."
if sudo swapon --show | grep -q "/swapfile"; then
    echo "Swap space is already configured. Skipping creation."
else
    echo "Creating 4GB swap file..."
    sudo fallocate -l 4G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=4096
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap space configured successfully!"
fi
free -h

# 3. Install Docker & Docker Compose
echo "--> [3/6] Setting up Docker and Docker Compose..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Start and enable Docker on boot
    sudo systemctl enable docker
    sudo systemctl start docker
    
    # Add ubuntu user to docker group
    sudo usermod -aG docker ubuntu
    echo "Docker and Docker Compose installed successfully."
else
    echo "Docker is already installed. Skipping installation."
fi

# 4. Prepare App Directory
echo "--> [4/6] Extracting application files..."
mkdir -p ~/eventopia
tar -xzf ~/eventopia.tar.gz -C ~/eventopia
if [ -f ~/deploy.env ]; then
    mv ~/deploy.env ~/eventopia/.env
    echo "Environment file moved to ~/eventopia/.env"
else
    echo "Warning: ~/deploy.env not found. Ensure .env is set up manually."
fi

# 5. Build and Deploy Containers
echo "--> [5/6] Starting application containers using Docker Compose..."
cd ~/eventopia

# Force rebuild to ensure code updates are captured
sudo docker compose down -v --remove-orphans || true
sudo docker compose up --build -d

# 6. Verify Status
echo "--> [6/6] Verifying container statuses..."
sleep 5
sudo docker compose ps

# Cleanup transfer archive
rm -f ~/eventopia.tar.gz

PUBLIC_IP=$(curl -s ifconfig.me || wget -qO- ifconfig.me || echo "your_ec2_ip")

echo "=========================================================="
echo " 🎉 Deployment Finished Successfully!"
echo " 🌐 You can now access Eventopia at: http://$PUBLIC_IP"
echo " 📝 Verify logs using: ssh -i eventopia-key.pem ubuntu@$PUBLIC_IP 'cd ~/eventopia && docker compose logs -f'"
echo "=========================================================="
