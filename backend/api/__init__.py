from flask import Flask
from flask_cors import CORS

from .main import main

def create_app(config_object='api.settings'):
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(config_object)
    app.register_blueprint(main)
    return app