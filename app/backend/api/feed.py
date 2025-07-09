from flask import Blueprint, jsonify
from app.backend.extensions import db
from app.backend.models.post import Post
from app.backend.models.user import User

feed_bp = Blueprint('feed', __name__)

# NOTE: Define routes as '/something', not '/api/something'. The blueprint is registered with '/api/feed'. 

@feed_bp.route('/', methods=['GET'])
def get_feed():
    # Fetch all posts, newest first
    posts = Post.query.order_by(Post.created_at.desc()).all()
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
    return jsonify({'posts': posts_data}), 200 