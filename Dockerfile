FROM node:18 AS canvas_frontend

WORKDIR /app
ARG VITE_WEBSITE_URL
ENV VITE_WEBSITE_URL=$VITE_WEBSITE_URL
COPY client/ .
RUN npm install && npm run build

FROM python:3.11-slim AS canvas_backend
 

WORKDIR /app
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server/canvas_backend/ canvas_backend/
COPY --from=canvas_frontend /app/dist/ ./client/dist

EXPOSE 8000
CMD ["uvicorn", "canvas_backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
