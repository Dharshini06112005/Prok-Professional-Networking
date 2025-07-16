from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.job import Job
from ..models.user import User

jobs_bp = Blueprint('jobs', __name__)

# NOTE: Define routes as '/something', not '/api/something'. The blueprint is registered with '/api/jobs'.
# Routes will be implemented here 