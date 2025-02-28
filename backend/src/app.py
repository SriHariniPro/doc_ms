from flask import Flask, request, jsonify
import os
import PyPDF2
import docx
from sklearn.feature_extraction.text import TfidfVectorizer

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def extract_text_from_pdf(file_path):
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    return text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    # Extract text based on file type
    if file.filename.endswith(".pdf"):
        extracted_text = extract_text_from_pdf(file_path)
    elif file.filename.endswith(".docx"):
        extracted_text = extract_text_from_docx(file_path)
    else:
        return jsonify({"error": "Unsupported file format"}), 400

    return jsonify({"text": extracted_text})

@app.route("/analyze", methods=["POST"])
def analyze_text():
    data = request.json
    text_list = data.get("texts", [])

    if not text_list:
        return jsonify({"error": "No text provided"}), 400

    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(text_list)
    feature_names = vectorizer.get_feature_names_out().tolist()

    return jsonify({"features": feature_names})

if __name__ == "__main__":
    app.run(debug=True)
