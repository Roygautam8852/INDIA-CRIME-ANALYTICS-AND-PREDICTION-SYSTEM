import sys
try:
    import flask
    import flask_cors
    import joblib
    import numpy
    import pandas
    import sklearn
    print("All python dependencies are present.")
except ImportError as e:
    print(f"MISSING_DEP: {e.name}")
    sys.exit(1)
