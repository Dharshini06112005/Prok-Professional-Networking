from flask import Blueprint, request, jsonify
from app.backend.extensions import db
from app.backend.models.user import User
from flask_jwt_extended import create_access_token
import re
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import cross_origin

from flask import current_app as app
import sys

# Remove per-file Limiter and cross_origin
# Blueprint
auth_bp = Blueprint('auth', __name__)

# Password complexity regex
PASSWORD_REGEX = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$')

# Input sanitization helper
def sanitize_input(value):
    return re.sub(r'<.*?>', '', value.strip())

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = sanitize_input(data.get('email', ''))
    username = sanitize_input(data.get('username', ''))
    password = data.get('password', '')

    # Validate input
    if not email or not username or not password:
        return jsonify({'msg': 'Missing required fields'}), 400
    if not PASSWORD_REGEX.match(password):
        return jsonify({'msg': 'Password must be at least 8 characters, include a letter and a number'}), 400

    # Check uniqueness
    if User.query.filter((User.email == email) | (User.username == username)).first():
        return jsonify({'msg': 'Email or username already exists'}), 400

    # Create user
    user = User(email=email, username=username, password=password)
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'msg': 'Email or username already exists'}), 400

    return jsonify({'msg': 'User created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = sanitize_input(data.get('email', ''))
    password = data.get('password', '')

    # Find user by email only (case-insensitive)
    user = User.query.filter(func.lower(User.email) == email.lower()).first()
    # Debug print for password check
    print(f"User: {user}, Password OK: {user.check_password(password) if user else 'N/A'}", file=sys.stderr)
    if not user or not user.check_password(password):
        return jsonify({'msg': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=user.email)
    return jsonify({'token': access_token, 'user': user.to_dict()}), 200

# Routes will be implemented here 