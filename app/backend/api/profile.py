from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.user import User
from models.profile import Profile
import os, time, json
from werkzeug.utils import secure_filename
from PIL import Image
import mimetypes
import cloudinary
import cloudinary.uploader

profile_bp = Blueprint('profile', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', 'dmspcref3')
CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '761459965218136')
CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', 'G6YHFTGxFXRC2Sh7bjZANBkeZZ4')

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def allowed_mime(file):
    # Use Flask file object's mimetype
    return file.mimetype in ['image/jpeg', 'image/png']

@profile_bp.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({'msg': 'Too many requests', 'limit': str(e.description)}), 429

@profile_bp.route('', methods=['GET'])
@profile_bp.route('/', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        email = get_jwt_identity()
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'msg': 'User not found'}), 404
        if not user.profile:
            profile = Profile(user_email=email)
            db.session.add(profile)
            db.session.commit()
            return jsonify(profile.to_dict()), 200
        
        # Ensure avatar URL is absolute
        profile_data = user.profile.to_dict()
        if profile_data.get('avatar') and not profile_data['avatar'].startswith('http'):
            backend_url = os.environ.get('BACKEND_URL', 'https://prok-professional-networking-t19l.onrender.com')
            profile_data['avatar'] = f"{backend_url}{profile_data['avatar']}"
        
        return jsonify(profile_data), 200
    except Exception as e:
        return jsonify({'msg': 'Server error', 'error': str(e)}), 500

@profile_bp.route('', methods=['PUT'])
@profile_bp.route('/', methods=['PUT'])
@jwt_required()
def update_profile():
    import ast
    import json
    try:
        email = get_jwt_identity()
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'msg': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'msg': 'No data provided'}), 400
            
        profile = user.profile or Profile(user_email=email)
        
        # Validation
        required_fields = ['name', 'title', 'contact']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'msg': f'{field} is required'}), 400
        if 'email' not in data['contact'] or not data['contact']['email']:
            return jsonify({'msg': 'Contact email is required'}), 400
        
        # Fields
        json_fields = ['social', 'experience', 'education', 'contact', 'activity']
        for field in ['avatar', 'name', 'title', 'location', 'bio', 'connections', 'mutualConnections', 'skills']:
            if field in data:
                db_field = field if field != 'mutualConnections' else 'mutual_connections'
                if field == 'skills':
                    value = data[field]
                    # Robustly parse skills: handle stringified arrays, nested arrays, and extra whitespace/quotes
                    import re
                    def flatten_skills(val):
                        if isinstance(val, str):
                            # Try to parse as JSON array
                            try:
                                import json
                                parsed = json.loads(val)
                                return flatten_skills(parsed)
                            except Exception:
                                # Split by comma if not JSON
                                return [v.strip().strip('"').strip("'") for v in val.split(',') if v.strip()]
                        elif isinstance(val, list):
                            flat = []
                            for v in val:
                                flat.extend(flatten_skills(v))
                            return flat
                        else:
                            return [str(val).strip().strip('"').strip("'")]
                    value = flatten_skills(value)
                    # Remove empty and duplicate skills
                    value = [s for s in value if s]
                    value = list(dict.fromkeys(value))
                    setattr(profile, db_field, ','.join(value))
                elif field in json_fields:
                    setattr(profile, db_field, json.dumps(data[field]))
                else:
                    setattr(profile, db_field, data[field])
        
        for field in json_fields:
            db_field = field if field != 'mutualConnections' else 'mutual_connections'
            value = data.get(field, getattr(profile, db_field, None))
            if not isinstance(value, str):
                setattr(profile, db_field, json.dumps(value if value is not None else [] if field != 'contact' else {}))
        
        if not user.profile:
            db.session.add(profile)
        
        # Commit with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                db.session.commit()
                break
            except Exception as commit_error:
                if attempt == max_retries - 1:
                    raise commit_error
                db.session.rollback()
                import time
                time.sleep(0.1 * (attempt + 1))  # Small delay before retry
        
        # Ensure avatar URL is absolute in response
        profile_data = profile.to_dict()
        if profile_data.get('avatar') and not profile_data['avatar'].startswith('http'):
            backend_url = os.environ.get('BACKEND_URL', 'https://prok-professional-networking-t19l.onrender.com')
            profile_data['avatar'] = f"{backend_url}{profile_data['avatar']}"
        
        return jsonify(profile_data), 200
    except Exception as e:
        db.session.rollback()
        print(f"Profile update error: {str(e)}")
        return jsonify({'msg': 'Profile update failed', 'error': str(e)}), 500

@profile_bp.route('/image', methods=['OPTIONS'])
def options_upload():
    return jsonify({'msg': 'OK'}), 200

@profile_bp.route('/image', methods=['POST'])
@jwt_required()
def upload_image():
    try:
        email = get_jwt_identity()
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'msg': 'User not found'}), 404
        if 'image' not in request.files:
            return jsonify({'msg': 'No file part'}), 400
        file = request.files['image']
        if file.filename == '':
            return jsonify({'msg': 'No selected file'}), 400
        if not allowed_file(file.filename):
            return jsonify({'msg': 'Invalid file type'}), 400
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        file.seek(0)
        if file_length > MAX_FILE_SIZE:
            return jsonify({'msg': 'File too large'}), 400
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(file, folder='profile_images', public_id=f"{int(time.time())}_{email.replace('@','_')}", overwrite=True, resource_type="image")
        image_url = upload_result.get('secure_url')
        if not image_url:
            return jsonify({'msg': 'Image upload failed'}), 500
        profile = user.profile or Profile(user_email=email)
        profile.avatar = image_url
        if not user.profile:
            db.session.add(profile)
        db.session.commit()
        response = jsonify({'url': profile.avatar})
        return response, 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': 'Image upload failed', 'error': str(e)}), 500 