from flask import Flask, request, jsonify
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
import logging
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load NLP models
try:
    nlp = spacy.load("en_core_web_sm")
    analyzer = SentimentIntensityAnalyzer()
except Exception as e:
    logger.error(f"Error loading NLP models: {str(e)}")
    nlp = None
    analyzer = None

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Semantic analysis service is running",
        "nlp_model_loaded": nlp is not None,
        "sentiment_analyzer_loaded": analyzer is not None
    })

def extract_text(file):
    if not file:
        raise ValueError("No file provided")

    text = ""
    try:
        if file.filename.endswith(".pdf"):
            reader = PyPDF2.PdfReader(BytesIO(file.read()))
            text = " ".join([page.extract_text() for page in reader.pages if page.extract_text()])
        elif file.filename.endswith(".docx"):
            doc = docx.Document(BytesIO(file.read()))
            text = " ".join([para.text for para in doc.paragraphs])
        elif file.filename.endswith(".txt"):
            text = file.read().decode('utf-8')
    except Exception as e:
        logger.error(f"Error extracting text from file: {str(e)}")
        raise ValueError(f"Error processing file: {str(e)}")

    return text.strip()

def analyze_sentiment(text):
    if not text:
        return "No content available"
    if not analyzer:
        raise RuntimeError("Sentiment analyzer not initialized")
    
    try:
        score = analyzer.polarity_scores(text)
        return {
            "sentiment": "Positive" if score['compound'] > 0 else "Negative" if score['compound'] < 0 else "Neutral",
            "scores": score
        }
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {str(e)}")
        raise RuntimeError(f"Error analyzing sentiment: {str(e)}")

def extract_entities(text):
    if not nlp:
        raise RuntimeError("NLP model not initialized")
    
    try:
        doc = nlp(text)
        entities = {}
        for ent in doc.ents:
            if ent.label_ not in entities:
                entities[ent.label_] = []
            entities[ent.label_].append(ent.text)
        return entities
    except Exception as e:
        logger.error(f"Error in entity extraction: {str(e)}")
        raise RuntimeError(f"Error extracting entities: {str(e)}")

def extract_topics(text, num_topics=2, num_words=5):
    try:
        vectorizer = CountVectorizer(max_df=0.85, stop_words='english')
        doc_term_matrix = vectorizer.fit_transform([text])
        
        if doc_term_matrix.shape[1] == 0:
            return ["Not enough data for topic extraction"]

        lda = LatentDirichletAllocation(
            n_components=num_topics,
            random_state=42,
            max_iter=10
        )
        lda.fit(doc_term_matrix)
        
        words = vectorizer.get_feature_names_out()
        topics = []
        
        for topic_idx, topic in enumerate(lda.components_):
            top_words_idx = topic.argsort()[:-num_words-1:-1]
            top_words = [words[i] for i in top_words_idx]
            topics.append({
                "topic": f"Topic {topic_idx + 1}",
                "words": top_words
            })
            
        return topics
    except Exception as e:
        logger.error(f"Error in topic extraction: {str(e)}")
        raise RuntimeError(f"Error extracting topics: {str(e)}")

@app.route("/analyze", methods=["POST"])
def analyze():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    try:
        text = extract_text(file)
        if not text:
            return jsonify({"error": "No text could be extracted from the file"}), 400

        analysis_results = {
            "sentiment": analyze_sentiment(text),
            "entities": extract_entities(text),
            "topics": extract_topics(text)
        }

        return jsonify(analysis_results)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

if __name__ == "__main__":
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Verify NLP models are loaded
    if not nlp or not analyzer:
        logger.warning("NLP models failed to load. Some functionality may be limited.")
    
    app.run(host='0.0.0.0', port=port, debug=debug) 
