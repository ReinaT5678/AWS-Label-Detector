from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
from swapmeet import process_image

app = Flask(__name__)
# enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/api/process-image', methods=['POST', 'OPTIONS'])
def api_process_image():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    if 'image' not in request.json:
        return jsonify({'success': False, 'error': 'No image provided'}), 400
    
    # get base64 image data
    image_data = request.json['image']
    
    # Remove data URL prefix if present
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    
    # Decode base64 to binary
    image_binary = BytesIO(base64.b64decode(image_data))
    
    # Process the image
    results = process_image(image_binary)
    
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)