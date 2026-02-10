echo "Starting uvicorn on port ${PORT} (reload enabled)..."
exec uvicorn server:app --host 0.0.0.0 --port "${PORT}" 
