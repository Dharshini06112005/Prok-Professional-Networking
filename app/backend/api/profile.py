from flask import Blueprint

profile_bp = Blueprint('profile', __name__)
 
# NOTE: Define routes as '/something', not '/api/something'. The blueprint is registered with '/api/profile'. 