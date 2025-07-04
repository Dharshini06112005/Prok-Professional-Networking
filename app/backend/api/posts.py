from flask import Blueprint

posts_bp = Blueprint('posts', __name__)

# NOTE: Define routes as '/something', not '/api/something'. The blueprint is registered with '/api/posts'.
# Routes will be implemented here 