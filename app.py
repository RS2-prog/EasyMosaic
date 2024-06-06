from flask import Flask, request, send_file, render_template
from PIL import Image, ImageDraw
import io

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('template.html')

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files or 'mask' not in request.files:
        return 'No file part', 400

    image_file = request.files['image']
    mask_file = request.files['mask']
    
    image = Image.open(image_file.stream)
    mask = Image.open(mask_file.stream).convert('L')  # Convert mask to grayscale

    # モザイク処理
    small_image = image.resize((int(image.width / 10), int(image.height / 10)), Image.NEAREST)
    mosaic_image = small_image.resize((image.width, image.height), Image.NEAREST)

    # マスクを使用してモザイクを適用する
    result = Image.composite(mosaic_image, image, mask)

    img_byte_arr = io.BytesIO()
    result.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)

    return send_file(img_byte_arr, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)
