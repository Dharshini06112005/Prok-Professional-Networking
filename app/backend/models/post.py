from ..extensions import db
from datetime import datetime

class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), db.ForeignKey('users.email'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    media_url = db.Column(db.String(255), nullable=True)
    media_type = db.Column(db.String(100), nullable=True)  # MIME type of media file
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    title = db.Column(db.String(255), nullable=False)
    allow_comments = db.Column(db.Boolean, default=True)
    is_public = db.Column(db.Boolean, default=True)
    category = db.Column(db.String(100), nullable=True)
    tags = db.Column(db.String(255), nullable=True)  # Comma-separated tags
    likes = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)

    user = db.relationship('User', backref=db.backref('posts', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_email': self.user_email,
            'title': self.title,
            'content': self.content,
            'media_url': self.media_url,
            'media_type': self.media_type,
            'created_at': self.created_at.isoformat(),
            'allow_comments': self.allow_comments,
            'is_public': self.is_public,
            'category': self.category,
            'tags': self.tags.split(',') if self.tags else [],
            'likes': self.likes,
            'views': self.views
        }
