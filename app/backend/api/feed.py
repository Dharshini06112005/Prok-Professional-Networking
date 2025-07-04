from flask import Blueprint

feed_bp = Blueprint('feed', __name__)
 
# NOTE: Define routes as '/something', not '/api/something'. The blueprint is registered with '/api/feed'. 