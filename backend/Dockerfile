# Stage 1: Builder
# We use this stage to install dependencies safely
FROM python:3.11-slim as builder

WORKDIR /app

# Prevent Python from writing .pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install build dependencies if needed (e.g. for cryptography)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime
# This is the final lean image
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PATH=/root/.local/bin:$PATH

# Copy only the installed packages from the builder
COPY --from=builder /root/.local /root/.local
# Copy the application code
COPY . .

# Expose the default FastAPI port
EXPOSE 8000

# Run with uvicorn
# In production, we use --workers to handle more concurrency
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
