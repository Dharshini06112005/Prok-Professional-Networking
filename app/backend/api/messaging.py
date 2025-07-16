from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.message import Message
from ..models.user import User

messaging_bp = Blueprint('messaging', __name__)

# NOTE: Define routes as '/something', not '/api/something'. The blueprint is registered with '/api/messaging'.
# Routes will be implemented here 