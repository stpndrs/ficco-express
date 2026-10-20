import sys, json, joblib, numpy as np
from pathlib import Path

MODELS_DIR = Path("./models")
_cache = {}

def get_model(name):
    if name not in _cache:
        path = MODELS_DIR / f"{name}.pkl"
        if path.exists():
            _cache[name] = joblib.load(path)
    return _cache.get(name)

def run_inference(model_name, payload):
    bundle = get_model(model_name)
    if not bundle:
        return {"error": f"Model {model_name} not found"}

    if model_name == "model1_stock_forecasting":
        scaler = bundle.get("scaler")
        model = bundle.get("model")
        X = np.array(payload["features"]).reshape(1, -1)
        if scaler: X = scaler.transform(X)
        pred = model.predict(X)[0]
        return {"predicted_days": max(1, int(pred))}

    elif model_name == "model4_waste_analysis":
        scaler = bundle.get("scaler")
        model = bundle.get("model")
        X = scaler.transform([payload["features"]]) if scaler else [payload["features"]]
        pred = model.predict(X)[0] # -1: Anomali/Review, 1: Optimal
        return {"status": "Review" if pred == -1 else "Optimal"}

    elif model_name == "model5_basket_analysis":
        rules = bundle.get("rules")
        top_rules = rules.head(10).to_dict(orient="records") if hasattr(rules, 'head') else []
        return {"rules": top_rules}

    elif model_name == "model8_supplier_price_anomaly":
        scaler = bundle.get("scaler")
        model = bundle.get("model")
        X = scaler.transform([payload["features"]]) if scaler else [payload["features"]]
        pred = model.predict(X)[0]
        return {"is_anomaly": True if pred == -1 else False}

    elif model_name == "model9_cashflow_projection":
        scaler = bundle.get("scaler")
        model = bundle.get("model")
        X = scaler.transform([payload["features"]]) if scaler else [payload["features"]]
        pred_daily = float(model.predict(X)[0])
        return {"predicted_daily": pred_daily}

    return {"error": "Unsupported model"}

if __name__ == "__main__":
    if len(sys.argv) > 2:
        m_name = sys.argv[1]
        p_data = json.loads(sys.argv[2])
        print(json.dumps(run_inference(m_name, p_data)))