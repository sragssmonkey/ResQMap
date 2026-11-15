
import os
import joblib

from .preprocessing import clean_text


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml_models",
    "incident_classifier.joblib"
)

_model = None


def load_model():
    """
    Load the trained model once and reuse it.
    """
    global _model

    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "Trained AI model not found. "
                "Run: python ai_engine/train_model.py"
            )

        _model = joblib.load(MODEL_PATH)

    return _model



def analyse_report(description):
    """
    Predict the likely emergency category and return
    the top three candidate categories.
    """

    if not isinstance(description, str) or not description.strip():
        raise ValueError("Emergency description cannot be empty.")

    model = load_model()
    cleaned_description = clean_text(description)

    if not cleaned_description:
        raise ValueError("Description contains no usable text.")

    probabilities = model.predict_proba([cleaned_description])[0]
    classes = model.named_steps["classifier"].classes_

    ranked_indices = probabilities.argsort()[::-1][:3]

    top_predictions = [
        {
            "category": str(classes[index]),
            "confidence": round(float(probabilities[index]), 4)
        }
        for index in ranked_indices
    ]

    best_index = ranked_indices[0]
    confidence = float(probabilities[best_index])

    return {
        "predicted_category": str(classes[best_index]),
        "confidence": round(confidence, 4),
        "confidence_percentage": round(confidence * 100, 2),
        "top_predictions": top_predictions,
        "needs_human_review": confidence < 0.60
    }
