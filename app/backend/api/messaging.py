from flask import Blueprint

messaging_bp = Blueprint('messaging', __name__)

# NOTE: Define routes as '/something', not '/api/something'. The blueprint is registered with '/api/messaging'.
# Routes will be implemented here 