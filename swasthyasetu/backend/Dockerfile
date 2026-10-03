# Multi-stage production Dockerfile for KAAPAN Backend (FastAPI)
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production runner stage
FROM python:3.11-slim AS runner

WORKDIR /app

# Non-root user for container security
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/sh -m appuser

COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONPATH=/app

COPY --chown=appuser:appgroup app /app/app
COPY --chown=appuser:appgroup data /app/data
COPY --chown=appuser:appgroup migrations /app/migrations

USER appuser

ENV PORT=8000
ENV HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request, os; urllib.request.urlopen('http://localhost:' + str(os.environ.get('PORT', 8000)) + '/health')" || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
