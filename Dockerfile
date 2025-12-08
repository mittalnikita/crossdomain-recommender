# Use Python image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy only backend folder
COPY backend/ /app/

# Install requirements
RUN pip install --no-cache-dir -r requirements.txt

# Run FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
