from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.backend.extensions import db
from app.backend.models.user import User
from app.backend.models.post import Post
import os, time
from werkzeug.utils import secure_filename
from PIL import Image

posts_bp = Blueprint('posts', __name__)

MEDIA_FOLDER = os.path.join(os.getcwd(), 'uploads', 'post_media')
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'webm'}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB
os.makedirs(MEDIA_FOLDER, exist_ok=True)

def allowed_file(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    return ext in ALLOWED_IMAGE_EXTENSIONS or ext in ALLOWED_VIDEO_EXTENSIONS

def is_image(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    return ext in ALLOWED_IMAGE_EXTENSIONS

def compress_and_save_image(file, filename):
    img = Image.open(file)
    img = img.convert('RGB')
    img.thumbnail((1200, 1200))
    save_path = os.path.join(MEDIA_FOLDER, filename)
    img.save(save_path, format='JPEG', quality=85)
    return filename

@posts_bp.route('/', methods=['POST'])
@jwt_required()
def create_post():
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    title = request.form.get('title', '').strip()
    if not title:
        return jsonify({'msg': 'Title is required'}), 400
    allow_comments = request.form.get('allow_comments', 'true').lower() == 'true'
    is_public = request.form.get('is_public', 'true').lower() == 'true'
    content = request.form.get('content', '').strip()
    if not content:
        return jsonify({'msg': 'Content is required'}), 400
    media_url = None
    if 'media' in request.files:
        file = request.files['media']
        if file.filename == '':
            return jsonify({'msg': 'No selected file'}), 400
        if not allowed_file(file.filename):
            return jsonify({'msg': 'Invalid file type'}), 400
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        file.seek(0)
        if file_length > MAX_FILE_SIZE:
            return jsonify({'msg': 'File too large'}), 400
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = secure_filename(f"{int(time.time())}_{email.replace('@','_')}.{ext}")
        if is_image(file.filename):
            compress_and_save_image(file, filename)
        else:
            file.save(os.path.join(MEDIA_FOLDER, filename))
        media_url = f'/api/posts/media/{filename}'
    post = Post(user_email=email, title=title, content=content, media_url=media_url, allow_comments=allow_comments, is_public=is_public)
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201

@posts_bp.route('', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_post_no_slash():
    return create_post()

@posts_bp.route('/', methods=['GET'])
@jwt_required()
def list_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return jsonify([p.to_dict() for p in posts]), 200

@posts_bp.route('/media/<filename>', methods=['GET'])
def serve_media(filename):
    return send_from_directory(MEDIA_FOLDER, filename) 