'''from flask import Flask, request, jsonify
import spacy
import PyPDF2
import docx
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from flask_cors import CORS
import os
from dotenv import load_dotenv
from io import BytesIO

load_dotenv()  # Load environment variables

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

nlp = spacy.load("en_core_web_sm")
analyzer = SentimentIntensityAnalyzer()

# Add a health check route
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "Semantic analysis service is running"})

def extract_text(file):
    text = ""
    if file.filename.endswith(".pdf"):
        reader = PyPDF2.PdfReader(BytesIO(file.read()))
        text = " ".join([page.extract_text() for page in reader.pages if page.extract_text()])
    elif file.filename.endswith(".docx"):
        doc = docx.Document(BytesIO(file.read()))
        text = " ".join([para.text for para in doc.paragraphs])
    return text.strip()

def analyze_sentiment(text):
    if not text:
        return "No content available"
    score = analyzer.polarity_scores(text)
    return "Positive" if score['compound'] > 0 else "Negative" if score['compound'] < 0 else "Neutral"

def extract_entities(text):
    doc = nlp(text)
    entities = {}
    for ent in doc.ents:
        if ent.label_ not in entities:
            entities[ent.label_] = []
        entities[ent.label_].append(ent.text)
    return entities

def extract_topics(text):
    try:
        vectorizer = CountVectorizer(max_df=0.85, stop_words='english')
        X = vectorizer.fit_transform([text])
        if X.shape[1] == 0:
            return ["Not enough data for topic extraction"]
        lda = LatentDirichletAllocation(n_components=2, random_state=42)
        lda.fit(X)
        words = vectorizer.get_feature_names_out()
        topics = [" ".join([words[i] for i in topic.argsort()[-5:]]) for topic in lda.components_]
        return topics
    except Exception as e:
        return [f"Error extracting topics: {str(e)}"]

@app.route("/analyze", methods=["POST"])
def analyze():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty file"}), 400

    text = extract_text(file)
    if not text:
        return jsonify({"error": "No text extracted"}), 400

    sentiment = analyze_sentiment(text)
    entities = extract_entities(text)
    topics = extract_topics(text)

    return jsonify({
        "sentiment": sentiment,
        "entities": entities,
        "topics": topics
    })

if __name__ == "__main__":
    # Use environment variables with defaults
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug) 
'''
