from flask import Flask, request, jsonify
import spacy
import PyPDF2
import docx
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

nlp = spacy.load("en_core_web_sm")
analyzer = SentimentIntensityAnalyzer()

def extract_text(file):
    text = ""
    if file.filename.endswith(".pdf"):
        reader = PyPDF2.PdfReader(file)
        text = " ".join([page.extract_text() for page in reader.pages if page.extract_text()])
    elif file.filename.endswith(".docx"):
        doc = docx.Document(file)
        text = " ".join([para.text for para in doc.paragraphs])
    return text

def analyze_sentiment(text):
    score = analyzer.polarity_scores(text)
    return "Positive" if score['compound'] > 0 else "Negative" if score['compound'] < 0 else "Neutral"

def extract_entities(text):
    doc = nlp(text)
    entities = {ent.label_: [] for ent in doc.ents}
    for ent in doc.ents:
        entities[ent.label_].append(ent.text)
    return entities

def extract_topics(text):
    vectorizer = CountVectorizer(max_df=0.85, stop_words='english')
    X = vectorizer.fit_transform([text])
    lda = LatentDirichletAllocation(n_components=2, random_state=42)
    lda.fit(X)
    words = vectorizer.get_feature_names_out()
    topics = [" ".join([words[i] for i in topic.argsort()[-5:]]) for topic in lda.components_]
    return topics

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
    app.run(debug=True) 
