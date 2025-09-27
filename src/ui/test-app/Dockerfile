FROM python:3.11-slim

# Set working directory
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

# Copy requirements first for better Docker layer caching
COPY test-app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy BAML source files
COPY baml_src/ ./baml_src/
COPY BAML_Integration_Implementation.py .
COPY baml_types.ts .

# Generate BAML client
RUN baml-cli generate --from ./baml_src --lang python --output ./baml_client || \
    echo "BAML client generation failed, will use fallback mode"

# Copy application code
COPY test-app/ .

# Create necessary directories
RUN mkdir -p templates static logs

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=development
ENV PYTHONPATH=/app

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Run the application
CMD ["python", "app.py"]
