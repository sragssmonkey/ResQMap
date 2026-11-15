
import os
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

from preprocessing import clean_text


# --------------------------------------------------
# 1. TRAINING DATASET
# Prototype examples only. Expand with verified,
# representative and labelled emergency reports.
# --------------------------------------------------

DATA = [
    # FLOOD
    ("Heavy rainfall has flooded houses in the area", "FLOOD"),
    ("Water is entering homes and streets are submerged", "FLOOD"),
    ("River water has overflowed onto nearby villages", "FLOOD"),
    ("People are trapped due to rising flood water", "FLOOD"),
    ("Severe waterlogging has affected residential areas", "FLOOD"),
    ("Flood water has entered shops and buildings", "FLOOD"),
    ("The bridge is surrounded by rising water", "FLOOD"),
    ("Heavy rain has caused flooding in the village", "FLOOD"),
    ("Families need help because their houses are underwater", "FLOOD"),
    ("The road is submerged after continuous rainfall", "FLOOD"),

    # ROAD_BLOCKAGE
    ("A fallen tree is blocking the main road", "ROAD_BLOCKAGE"),
    ("A landslide has blocked the highway", "ROAD_BLOCKAGE"),
    ("A truck accident has blocked traffic", "ROAD_BLOCKAGE"),
    ("The road is blocked by fallen electric poles", "ROAD_BLOCKAGE"),
    ("Debris is preventing vehicles from passing", "ROAD_BLOCKAGE"),
    ("A damaged bridge has closed the road", "ROAD_BLOCKAGE"),
    ("A large tree has fallen across the street", "ROAD_BLOCKAGE"),
    ("Vehicles cannot pass because the road is blocked", "ROAD_BLOCKAGE"),
    ("Construction debris is obstructing the road", "ROAD_BLOCKAGE"),
    ("Traffic is stuck due to a blocked highway", "ROAD_BLOCKAGE"),

    # FIRE
    ("A building is on fire and smoke is spreading", "FIRE"),
    ("There is a major fire in a residential apartment", "FIRE"),
    ("A shop has caught fire", "FIRE"),
    ("Flames are coming out of a factory", "FIRE"),
    ("Smoke is coming from a burning vehicle", "FIRE"),
    ("A fire has spread to nearby houses", "FIRE"),
    ("The warehouse is burning", "FIRE"),
    ("People are evacuating due to a building fire", "FIRE"),
    ("An electrical short circuit caused a fire", "FIRE"),
    ("There is a forest fire near the village", "FIRE"),

    # MEDICAL
    ("An injured person needs an ambulance immediately", "MEDICAL"),
    ("A person has collapsed and needs medical assistance", "MEDICAL"),
    ("Several people are injured after an accident", "MEDICAL"),
    ("An elderly person is having difficulty breathing", "MEDICAL"),
    ("A patient needs urgent medical attention", "MEDICAL"),
    ("Someone is unconscious and needs an ambulance", "MEDICAL"),
    ("People are injured and need first aid", "MEDICAL"),
    ("A person has suffered serious injuries", "MEDICAL"),
    ("Medical supplies are needed at the relief centre", "MEDICAL"),
    ("A child is injured and needs medical help", "MEDICAL"),

    # BUILDING_COLLAPSE
    ("A building has collapsed trapping people inside", "BUILDING_COLLAPSE"),
    ("A residential structure has fallen down", "BUILDING_COLLAPSE"),
    ("The roof of a building has collapsed", "BUILDING_COLLAPSE"),
    ("People are trapped under the building rubble", "BUILDING_COLLAPSE"),
    ("An apartment building collapsed after the earthquake", "BUILDING_COLLAPSE"),
    ("A wall has fallen on nearby houses", "BUILDING_COLLAPSE"),
    ("The structure has partially collapsed", "BUILDING_COLLAPSE"),
    ("Rescuers are needed to search through the rubble", "BUILDING_COLLAPSE"),
    ("A school building has collapsed", "BUILDING_COLLAPSE"),
    ("The building is damaged and part of it has fallen", "BUILDING_COLLAPSE"),

    # LANDSLIDE
    ("A landslide has buried houses in the hillside", "LANDSLIDE"),
    ("Mud and rocks are sliding down the mountain", "LANDSLIDE"),
    ("Heavy rainfall triggered a landslide", "LANDSLIDE"),
    ("Soil has slipped onto the village road", "LANDSLIDE"),
    ("A hillside has collapsed near the settlement", "LANDSLIDE"),
    ("Large rocks are falling from the mountain", "LANDSLIDE"),
    ("Mud has covered several houses", "LANDSLIDE"),
    ("The village is threatened by a slope failure", "LANDSLIDE"),
    ("A landslide has damaged nearby buildings", "LANDSLIDE"),
    ("Debris from the hillside is moving downhill", "LANDSLIDE"),

    # OTHER
    ("There is an emergency situation in the area", "OTHER"),
    ("A person has reported an unusual incident", "OTHER"),
    ("There is damage to public infrastructure", "OTHER"),
    ("Residents need assistance after a local incident", "OTHER"),
    ("An unknown hazard has been reported", "OTHER"),
    ("The situation requires investigation", "OTHER"),
    ("People have reported an unidentified danger", "OTHER"),
    ("Public property has been damaged", "OTHER"),
    ("An emergency has occurred near the village", "OTHER"),
    ("Residents are requesting general assistance", "OTHER"),
]


def main():
    texts = [clean_text(text) for text, label in DATA]
    labels = [label for text, label in DATA]

    # Split data while keeping class proportions.
    X_train, X_test, y_train, y_test = train_test_split(
        texts,
        labels,
        test_size=0.20,
        random_state=42,
        stratify=labels
    )

    # TF-IDF converts text into numerical features.
    # Logistic Regression predicts the incident category.
    model = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=5000,
                sublinear_tf=True
            )
        ),
        (
            "classifier",
            LogisticRegression(
                max_iter=1000,
                class_weight="balanced"
            )
        )
    ])

    print("Training emergency classification model...")

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    print("\nModel evaluation")
    print("----------------")
    print("Accuracy:", round(accuracy_score(y_test, predictions), 3))

    print("\nClassification report:")
    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0
        )
    )

    # Save trained model inside ai_engine/ml_models.
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(base_dir, "ml_models")
    os.makedirs(model_dir, exist_ok=True)

    model_path = os.path.join(model_dir, "incident_classifier.joblib")
    joblib.dump(model, model_path)

    print("\nModel saved successfully:")
    print(model_path)


if __name__ == "__main__":
    main()
