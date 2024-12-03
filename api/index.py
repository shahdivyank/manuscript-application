from flask import Flask, request
from flask_cors import CORS
import cv2
import numpy as np
import base64

app = Flask(__name__)
CORS(app)

@app.route("/api/ocr", methods=["POST"])
def process():
    base64_image = request.data.decode("utf-8").split(",")[1]
    decoded = base64.b64decode(base64_image)
    img_array = np.fromstring(decoded, np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    print(image)

    return [1, 2, 3]