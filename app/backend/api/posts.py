from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.user import User
from models.post import Post
import os, time
from werkzeug.utils import secure_filename
from PIL import Image
from sqlalchemy import or_, desc, asc
import re
import cloudinary
import cloudinary.uploader

posts_bp = Blueprint('posts', __name__)

MEDIA_FOLDER = '/data/uploads/post_media'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'webm'}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB
os.makedirs(MEDIA_FOLDER, exist_ok=True)

CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', 'dmspcref3')
CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '761459965218136')
CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', 'G6YHFTGxFXRC2Sh7bjZANBkeZZ4')

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

# Simple in-memory cache for categories and tags
_categories_cache = None
_popular_tags_cache = None
_cache_timestamp = 0
CACHE_DURATION = 300  # 5 minutes

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

def invalidate_cache():
    global _categories_cache, _popular_tags_cache, _cache_timestamp
    _categories_cache = None
    _popular_tags_cache = None
    _cache_timestamp = 0

@posts_bp.route('/', methods=['POST'])
@jwt_required()
def create_post():
    try:
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
        category = request.form.get('category', '').strip()
        tags = request.form.get('tags', '').strip()
        
        if not content:
            return jsonify({'msg': 'Content is required'}), 400
        
        media_url = None
        media_type = None
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
            ext = file.filename.rsplit('.', 1)[1].lower() if file.filename and '.' in file.filename else ''
            # Upload to Cloudinary
            resource_type = 'video' if ext in ['mp4', 'webm', 'avi', 'mov'] else 'image'
            upload_result = cloudinary.uploader.upload(file, folder='post_media', public_id=f"{int(time.time())}_{email.replace('@','_')}", overwrite=True, resource_type=resource_type)
            media_url = upload_result.get('secure_url')
            if not media_url:
                return jsonify({'msg': 'Media upload failed'}), 500
            media_type = upload_result.get('resource_type', resource_type)
        
        post = Post(
            user_email=email, 
            title=title, 
            content=content, 
            media_url=media_url, 
            media_type=media_type,
            allow_comments=allow_comments, 
            is_public=is_public,
            category=category if category else None,
            tags=tags if tags else None
        )
        db.session.add(post)
        db.session.commit()
        
        # Invalidate cache when new post is created
        invalidate_cache()
        
        return jsonify(post.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Post creation error: {str(e)}")
        return jsonify({'msg': 'Post creation failed', 'error': str(e)}), 500

@posts_bp.route('', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_post_no_slash():
    return create_post()

@posts_bp.route('/public', methods=['GET'])
def list_public_posts():
    """List public posts - no authentication required"""
    # Get query parameters
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 50)  # Max 50 per page
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    tag = request.args.get('tag', '').strip()
    sort = request.args.get('sort', 'created_at')
    
    # Build query - only public posts
    query = Post.query.filter(Post.is_public == True)
    
    # Apply filters
    if search:
        search_filter = or_(
            Post.title.ilike(f'%{search}%'),
            Post.content.ilike(f'%{search}%')
        )
        query = query.filter(search_filter)
    
    if category:
        query = query.filter(Post.category == category)
    
    if tag:
        query = query.filter(Post.tags.ilike(f'%{tag}%'))
    
    # Apply sorting
    if sort == 'likes':
        query = query.order_by(desc(Post.likes))
    elif sort == 'views':
        query = query.order_by(desc(Post.views))
    elif sort == 'created_at':
        query = query.order_by(desc(Post.created_at))
    else:
        query = query.order_by(desc(Post.created_at))
    
    # Apply pagination
    pagination = query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    posts = pagination.items
    
    # Convert to dict and add user info
    posts_data = []
    for post in posts:
        post_dict = post.to_dict()
        user = User.query.filter_by(email=post.user_email).first()
        post_dict['user'] = {
            'name': user.username if user else 'Unknown User',
            'email': post.user_email
        }
        post_dict['comments_count'] = 0
        posts_data.append(post_dict)
    
    return jsonify({
        'posts': posts_data,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200

@posts_bp.route('/', methods=['GET'])
@jwt_required()
def list_posts():
    # Get query parameters
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 50)  # Max 50 per page
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    visibility = request.args.get('visibility', '').strip()
    tag = request.args.get('tag', '').strip()
    sort = request.args.get('sort', 'created_at')
    
    # Build query
    query = Post.query
    
    # Apply filters
    if search:
        search_filter = or_(
            Post.title.ilike(f'%{search}%'),
            Post.content.ilike(f'%{search}%')
        )
        query = query.filter(search_filter)
    
    if category:
        query = query.filter(Post.category == category)
    
    if visibility:
        if visibility == 'public':
            query = query.filter(Post.is_public == True)
        elif visibility == 'private':
            query = query.filter(Post.is_public == False)
    
    if tag:
        query = query.filter(Post.tags.ilike(f'%{tag}%'))
    
    # Apply sorting
    if sort == 'likes':
        query = query.order_by(desc(Post.likes))
    elif sort == 'views':
        query = query.order_by(desc(Post.views))
    elif sort == 'created_at':
        query = query.order_by(desc(Post.created_at))
    else:
        query = query.order_by(desc(Post.created_at))
    
    # Apply pagination
    pagination = query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    posts = pagination.items
    
    # Convert to dict and add user info
    posts_data = []
    for post in posts:
        post_dict = post.to_dict()
        user = User.query.filter_by(email=post.user_email).first()
        post_dict['user'] = {
            'name': user.username if user else 'Unknown User',
            'email': post.user_email
        }
        # Add comments count (placeholder for now)
        post_dict['comments_count'] = 0
        posts_data.append(post_dict)
    
    return jsonify({
        'posts': posts_data,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200

@posts_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    global _categories_cache, _cache_timestamp
    
    # Check cache
    current_time = time.time()
    if _categories_cache and (current_time - _cache_timestamp) < CACHE_DURATION:
        return jsonify({'categories': _categories_cache}), 200
    
    # Query database
    categories = db.session.query(Post.category).filter(
        Post.category.isnot(None),
        Post.category != ''
    ).distinct().all()
    
    category_list = [cat[0] for cat in categories if cat[0]]
    
    # Update cache
    _categories_cache = category_list
    _cache_timestamp = current_time
    
    return jsonify({'categories': category_list}), 200

@posts_bp.route('/popular-tags', methods=['GET'])
@jwt_required()
def get_popular_tags():
    global _popular_tags_cache, _cache_timestamp
    
    # Check cache
    current_time = time.time()
    if _popular_tags_cache and (current_time - _cache_timestamp) < CACHE_DURATION:
        return jsonify({'tags': _popular_tags_cache}), 200
    
    # Query database for all tags
    posts_with_tags = Post.query.filter(
        Post.tags.isnot(None),
        Post.tags != ''
    ).all()
    
    # Count tag frequency
    tag_counts = {}
    for post in posts_with_tags:
        if post.tags:
            tags = [tag.strip() for tag in post.tags.split(',') if tag.strip()]
            for tag in tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
    
    # Sort by frequency and get top 20
    popular_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:20]
    tag_list = [tag for tag, count in popular_tags]
    
    # Update cache
    _popular_tags_cache = tag_list
    _cache_timestamp = current_time
    
    return jsonify({'tags': tag_list}), 200

@posts_bp.route('/media/<filename>', methods=['GET'])
def serve_media(filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    if ext in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']:
        mimetype = 'image/jpeg' if ext in ['jpg', 'jpeg'] else f'image/{ext}'
        return send_from_directory(MEDIA_FOLDER, filename, mimetype=mimetype)
    elif ext in ['mp4', 'webm', 'avi', 'mov']:
        mimetype = f'video/{ext}'
        return send_from_directory(MEDIA_FOLDER, filename, mimetype=mimetype)
    return send_from_directory(MEDIA_FOLDER, filename) 

@posts_bp.route('/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """Get a single post by ID - public endpoint for sharing"""
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'msg': 'Post not found'}), 404
    
    # Check if post is public
    if not post.is_public:
        # For private posts, require authentication
        try:
            from flask_jwt_extended import get_jwt_identity
            email = get_jwt_identity()
            if email != post.user_email:
                return jsonify({'msg': 'Post is private'}), 403
        except:
            return jsonify({'msg': 'Post is private'}), 403
    
    # Increment view count
    post.views = (post.views or 0) + 1
    db.session.commit()
    
    # Convert to dict and add user info
    post_dict = post.to_dict()
    user = User.query.filter_by(email=post.user_email).first()
    post_dict['user'] = {
        'name': user.username if user else 'Unknown User',
        'email': post.user_email
    }
    post_dict['comments_count'] = 0
    
    return jsonify(post_dict), 200

@posts_bp.route('/<int:post_id>/like', methods=['POST'])
def like_post(post_id):
    """Like a post - works for public posts without authentication"""
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'msg': 'Post not found'}), 404
    
    # Check if post is public
    if not post.is_public:
        # For private posts, require authentication
        try:
            from flask_jwt_extended import get_jwt_identity
            email = get_jwt_identity()
            if email != post.user_email:
                return jsonify({'msg': 'Post is private'}), 403
        except:
            return jsonify({'msg': 'Post is private'}), 403
    
    # Increment likes
    post.likes = (post.likes or 0) + 1
    db.session.commit()
    
    return jsonify({'msg': 'Post liked successfully', 'likes': post.likes}), 200

@posts_bp.route('/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    email = get_jwt_identity()
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'msg': 'Post not found'}), 404
    if post.user_email != email:
        return jsonify({'msg': 'Unauthorized'}), 403
    # Delete media file if exists
    if post.media_url:
        filename = post.media_url.split('/')[-1]
        file_path = os.path.join(MEDIA_FOLDER, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    db.session.delete(post)
    db.session.commit()
    invalidate_cache()
    return jsonify({'msg': 'Post deleted successfully'}), 200 