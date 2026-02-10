apt update
apt install ca-certificates curl gnupg lsb-release -y
apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
docker run -d --name taxi-mongo -p 27017:27017 mongo:6.0

echo "Starting uvicorn on port ${PORT} (reload enabled)..."
exec uvicorn server:app --host 0.0.0.0 --port "${PORT}" 
