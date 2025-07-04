from flask import Blueprint

jobs_bp = Blueprint('jobs', __name__)

# NOTE: Define routes as '/something', not '/api/something'. The blueprint is registered with '/api/jobs'.
# Routes will be implemented here 