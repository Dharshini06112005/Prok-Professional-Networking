from flask import Blueprint, request, jsonify
from app.backend.extensions import db
from app.backend.models.user import User
from flask_jwt_extended import create_access_token
import re
from sqlalchemy.exc import IntegrityError
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import cross_origin

from flask import current_app as app

# Blueprint
auth_bp = Blueprint('auth', __name__)

# Rate limiter (attach to app in factory)
limiter = Limiter(key_func=get_remote_address, default_limits=["10 per minute"])

# Password complexity regex
PASSWORD_REGEX = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$')

# Input sanitization helper
def sanitize_input(value):
    return re.sub(r'<.*?>', '', value.strip())

@auth_bp.route('/api/signup', methods=['POST'])
@cross_origin()
@limiter.limit("5 per minute")
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

@auth_bp.route('/api/login', methods=['POST'])
@cross_origin()
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    email = sanitize_input(data.get('email', ''))
    password = data.get('password', '')

    # Find user by email only
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'msg': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=user.email)
    return jsonify({'token': access_token, 'user': user.to_dict()}), 200

# Routes will be implemented here 