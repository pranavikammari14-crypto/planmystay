# -----------------------------------------------------------------------------
# PlanMyStay.in Django Production Dockerfile
# Python 3.10+ Multi-stage Alpine/Slim Container
# -----------------------------------------------------------------------------

FROM python:3.10-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Final runtime image
FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

COPY . .

# Collect static files and set permissions
ENV DJANGO_SETTINGS_MODULE=planmystay.settings
RUN python manage.py collectstatic --noinput --dry-run || true

EXPOSE 8000

CMD ["gunicorn", "--config", "gunicorn.conf.py", "planmystay.wsgi:application"]
