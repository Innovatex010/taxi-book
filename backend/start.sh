#!/usr/bin/env bash
set -euo pipefail

# start.sh - start local MongoDB (Docker) and the FastAPI backend via uvicorn
# Usage: ./start.sh [--no-docker] [--port PORT]

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
NO_DOCKER=0
PORT=8000

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-docker)
      NO_DOCKER=1
      shift
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [--no-docker] [--port PORT]"
      exit 0
      ;;
    *)
      echo "Unknown arg: $1"
      exit 1
      ;;
  esac
done

cd "$ROOT_DIR"

if [ "$NO_DOCKER" -ne 1 ]; then
  # Check if a taxi-mongo container is already running
  if ! docker ps --format '{{.Names}}' | grep -q '^taxi-mongo$'; then
    echo "Starting MongoDB Docker container 'taxi-mongo'..."
    docker run -d --name taxi-mongo -p 27017:27017 --rm mongo:6.0 >/dev/null
    echo "MongoDB container started."
  else
    echo "MongoDB container 'taxi-mongo' already running."
  fi
else
  echo "Skipping Docker start (--no-docker). Ensure Mongo is running and MONGO_URL in .env points to it."
fi

echo "Loading environment from .env"
if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a
  # shellcheck disable=SC1090
  . .env
  set +a
fi

echo "Starting uvicorn on port ${PORT} (reload enabled)..."
exec uvicorn server:app --host 0.0.0.0 --port "${PORT}" 
