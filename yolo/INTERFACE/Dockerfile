FROM ultralytics/ultralytics:latest-python
WORKDIR /app
RUN pip install --no-cache-dir Flask
COPY . .
EXPOSE 5000
CMD ["python", "inference_service.py"]