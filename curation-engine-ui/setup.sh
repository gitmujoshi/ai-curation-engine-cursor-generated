#!/bin/bash

# AI Curation Engine Setup Script
# This script sets up the development environment for the AI Curation Engine

echo "🚀 Setting up AI Curation Engine..."
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $NODE_VERSION detected"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Installing MongoDB..."
    
    # Detect OS and install MongoDB
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew tap mongodb/brew
            brew install mongodb-community
            echo "✅ MongoDB installed via Homebrew"
        else
            echo "❌ Homebrew not found. Please install MongoDB manually from https://www.mongodb.com/try/download/community"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "Please install MongoDB manually for your Linux distribution:"
        echo "Ubuntu/Debian: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/"
        echo "CentOS/RHEL: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat/"
        exit 1
    else
        echo "❌ Unsupported OS. Please install MongoDB manually from https://www.mongodb.com/try/download/community"
        exit 1
    fi
else
    echo "✅ MongoDB detected"
fi

# Install npm dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create environment file
echo "🔧 Setting up environment variables..."

if [ ! -f .env.local ]; then
    cp env.example .env.local
    echo "✅ Environment file created (.env.local)"
    echo "⚠️  Please edit .env.local with your configuration"
else
    echo "⚠️  .env.local already exists, skipping..."
fi

# Create logs directory
mkdir -p logs
echo "✅ Logs directory created"

# Start MongoDB service
echo "🗄️  Starting MongoDB..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    brew services start mongodb/brew/mongodb-community
    echo "✅ MongoDB service started"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    sudo systemctl start mongod
    sudo systemctl enable mongod
    echo "✅ MongoDB service started"
fi

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Test MongoDB connection
if mongosh --eval "db.adminCommand('hello')" &> /dev/null; then
    echo "✅ MongoDB connection successful"
else
    echo "❌ MongoDB connection failed. Please check your MongoDB installation"
    exit 1
fi

# Create initial database and collections
echo "🗄️  Setting up database..."
mongosh curation-engine --eval "
    db.createCollection('users');
    db.createCollection('childprofiles');
    db.createCollection('curationrules');
    db.createCollection('contentanalyses');
    
    // Create indexes for performance
    db.users.createIndex({ 'email': 1 }, { unique: true });
    db.users.createIndex({ 'status': 1 });
    db.childprofiles.createIndex({ 'parentId': 1 });
    db.curationrules.createIndex({ 'userId': 1 });
    
    print('✅ Database and collections created');
"

# Generate JWT secrets if not set
if ! grep -q "JWT_SECRET=your-super-secret" .env.local; then
    echo "🔐 JWT secrets already configured"
else
    echo "🔐 Generating JWT secrets..."
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    # Update .env.local with generated secrets
    sed -i.bak "s/JWT_SECRET=your-super-secret-jwt-key-change-this-in-production/JWT_SECRET=$JWT_SECRET/" .env.local
    sed -i.bak "s/REFRESH_TOKEN_SECRET=your-refresh-token-secret/REFRESH_TOKEN_SECRET=$REFRESH_SECRET/" .env.local
    sed -i.bak "s/SESSION_SECRET=your-session-secret/SESSION_SECRET=$SESSION_SECRET/" .env.local
    
    rm .env.local.bak
    echo "✅ JWT secrets generated and configured"
fi

# Create a sample admin user (optional)
echo "👤 Would you like to create a sample admin user? (y/n)"
read -r create_user

if [[ $create_user == "y" || $create_user == "Y" ]]; then
    echo "Creating sample admin user..."
    
    # Start the backend temporarily to create user
    npm run backend &
    BACKEND_PID=$!
    
    sleep 10
    
    # Create admin user via API
    curl -X POST http://localhost:3001/api/auth/register \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin@example.com",
            "password": "admin123456",
            "firstName": "Admin",
            "lastName": "User",
            "country": "US",
            "consent": {
                "dataProcessing": true,
                "marketing": false,
                "analytics": true
            }
        }' > /dev/null 2>&1
    
    # Stop the backend
    kill $BACKEND_PID
    
    echo "✅ Sample admin user created:"
    echo "   Email: admin@example.com"
    echo "   Password: admin123456"
fi

# Print setup completion message
echo ""
echo "🎉 Setup completed successfully!"
echo "================================="
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev:full    # Starts both backend and frontend"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   MongoDB:  mongodb://localhost:27017/curation-engine"
echo ""
echo "📚 Next steps:"
echo "   1. Edit .env.local with your configuration"
echo "   2. Review the README.md for detailed setup instructions"
echo "   3. Run 'npm run dev:full' to start development"
echo ""
echo "⚠️  Important notes:"
echo "   • This is a development setup with mock data"
echo "   • BoundaryML integration is conceptual - replace with real API"
echo "   • For production, use proper secrets and security measures"
echo ""
echo "🆘 Need help? Check the README.md or create an issue on GitHub"
