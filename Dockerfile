# AI Curation Engine - Main Application Dockerfile
# For Render.com deployment

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for BAML CLI
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install BAML CLI globally
RUN npm install -g @boundaryml/baml

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install BAML Python client
RUN pip install --no-cache-dir baml-py>=0.46.0 pydantic>=2.4.2

# Copy BAML source files
COPY config/baml_src/ ./baml_src/

# Copy core scripts
COPY tools/scripts/BAML_Integration_Real.py ./scripts/
COPY tools/scripts/curation_engine_pluggable.py ./scripts/

# Generate BAML client (with fallback if fails)
RUN baml-cli generate --from ./baml_src --lang python --output ./baml_client || \
    echo "⚠️ BAML generation failed, using fallback mode"

# Copy application code
COPY src/ui/demo-frontend/ ./demo/

# Create necessary directories
RUN mkdir -p logs templates static

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=5001
ENV FLASK_APP=demo/app.js
ENV FLASK_ENV=production

EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5001/api/health || exit 1

# Start the application
CMD ["python", "demo/app.js"]

