#!/bin/bash

# ===============================================
# AI Curation Engine - EC2 User Data Script
# ===============================================

set -e

# Logging
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "Starting AI Curation Engine setup..."

# Variables from Terraform
PROJECT_NAME="${project_name}"
ENVIRONMENT="${environment}"
DB_ENDPOINT="${db_endpoint}"
DB_NAME="${db_name}"
DB_USERNAME="${db_username}"
DB_PASSWORD="${db_password}"
MODEL_BUCKET="${model_bucket}"
AWS_REGION="${aws_region}"

# Update system
apt-get update -y
apt-get upgrade -y

# Install dependencies
apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    postgresql-client \
    awscli \
    curl \
    git \
    htop \
    unzip \
    jq \
    nginx

# Install Docker for Ollama
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Create application user
useradd -m -s /bin/bash aiapp
usermod -aG docker aiapp

# Create application directories
mkdir -p /opt/ai-curation-engine
mkdir -p /var/log/ai-curation-engine
mkdir -p /opt/models
chown -R aiapp:aiapp /opt/ai-curation-engine
chown -R aiapp:aiapp /var/log/ai-curation-engine
chown -R aiapp:aiapp /opt/models

# Mount EBS volume for models
mkfs -t ext4 /dev/nvme1n1 || true
mount /dev/nvme1n1 /opt/models || true
echo '/dev/nvme1n1 /opt/models ext4 defaults,nofail 0 2' >> /etc/fstab
chown -R aiapp:aiapp /opt/models

# Clone application code
cd /opt/ai-curation-engine
git clone https://github.com/gitmujoshi/ai-curation-engine.git .
chown -R aiapp:aiapp .

# Install Python dependencies
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt || pip install flask flask-cors requests pydantic python-dotenv baml-py

# Create environment configuration
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://$DB_USERNAME:$DB_PASSWORD@$DB_ENDPOINT:5432/$DB_NAME

# AWS Configuration
AWS_REGION=$AWS_REGION
MODEL_BUCKET=$MODEL_BUCKET

# BAML Configuration
BAML_LOG_LEVEL=ERROR
BOUNDARY_TELEMETRY_DISABLED=true
OLLAMA_BASE_URL=http://localhost:11434

# Application Configuration
FLASK_ENV=production
FLASK_DEBUG=false
PORT=5001

# Environment
PROJECT_NAME=$PROJECT_NAME
ENVIRONMENT=$ENVIRONMENT
EOF

chown aiapp:aiapp .env

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm || dpkg -i amazon-cloudwatch-agent.deb

# Configure CloudWatch agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "cwagent"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/ai-curation-engine/*.log",
            "log_group_name": "/aws/ec2/$PROJECT_NAME-$ENVIRONMENT",
            "log_stream_name": "{instance_id}/application",
            "retention_in_days": 7
          },
          {
            "file_path": "/var/log/user-data.log",
            "log_group_name": "/aws/ec2/$PROJECT_NAME-$ENVIRONMENT",
            "log_stream_name": "{instance_id}/user-data",
            "retention_in_days": 7
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "AI-Curation-Engine",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_iowait",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": [
          "used_percent"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "diskio": {
        "measurement": [
          "io_time"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "mem": {
        "measurement": [
          "mem_used_percent"
        ],
        "metrics_collection_interval": 60
      }
    }
  }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s

# Setup Ollama service
cat > /etc/systemd/system/ollama.service << EOF
[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=aiapp
Group=aiapp
Restart=always
RestartSec=3
Environment="OLLAMA_HOST=0.0.0.0"
Environment="OLLAMA_ORIGINS=*"

[Install]
WantedBy=multi-user.target
EOF

# Setup AI Curation Engine service
cat > /etc/systemd/system/ai-curation-engine.service << EOF
[Unit]
Description=AI Curation Engine
After=network-online.target ollama.service
Requires=ollama.service

[Service]
Type=simple
User=aiapp
Group=aiapp
WorkingDirectory=/opt/ai-curation-engine
Environment=PATH=/opt/ai-curation-engine/venv/bin
ExecStart=/opt/ai-curation-engine/venv/bin/python demo-frontend/app.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Enable and start services
systemctl daemon-reload
systemctl enable ollama
systemctl enable ai-curation-engine
systemctl start ollama

# Wait for Ollama to start
sleep 10

# Download Ollama models as aiapp user
sudo -u aiapp bash << 'EOF'
cd /opt/ai-curation-engine
export OLLAMA_HOST=localhost:11434

# Download models
ollama pull llama3.2
ollama pull llama3.1

# Generate BAML client if possible
if command -v baml-cli &> /dev/null; then
    baml-cli generate
fi
EOF

# Start AI Curation Engine
systemctl start ai-curation-engine

# Configure Nginx as reverse proxy
cat > /etc/nginx/sites-available/ai-curation-engine << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /ollama/ {
        proxy_pass http://localhost:11434/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/generate {
        proxy_pass http://localhost:11434/api/generate;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/chat {
        proxy_pass http://localhost:11434/api/chat;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/tags {
        proxy_pass http://localhost:11434/api/tags;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -s /etc/nginx/sites-available/ai-curation-engine /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "AI Curation Engine setup completed successfully!"
echo "Application should be available on port 5001"
echo "Ollama API should be available on port 11434"

# Create status check script
cat > /opt/ai-curation-engine/health_check.sh << 'EOF'
#!/bin/bash
echo "=== AI Curation Engine Health Check ==="
echo "Date: $(date)"
echo ""

echo "Service Status:"
systemctl is-active ollama && echo "✅ Ollama: Running" || echo "❌ Ollama: Not running"
systemctl is-active ai-curation-engine && echo "✅ AI Engine: Running" || echo "❌ AI Engine: Not running"
systemctl is-active nginx && echo "✅ Nginx: Running" || echo "❌ Nginx: Not running"

echo ""
echo "Port Status:"
netstat -tlnp | grep :5001 > /dev/null && echo "✅ Port 5001: Open" || echo "❌ Port 5001: Closed"
netstat -tlnp | grep :11434 > /dev/null && echo "✅ Port 11434: Open" || echo "❌ Port 11434: Closed"

echo ""
echo "Health Endpoints:"
curl -s http://localhost:5001/health > /dev/null && echo "✅ App Health: OK" || echo "❌ App Health: Failed"
curl -s http://localhost:11434/api/tags > /dev/null && echo "✅ Ollama API: OK" || echo "❌ Ollama API: Failed"
EOF

chmod +x /opt/ai-curation-engine/health_check.sh
chown aiapp:aiapp /opt/ai-curation-engine/health_check.sh

echo "Setup completed successfully!"
