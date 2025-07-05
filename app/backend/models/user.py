from app.backend.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    email = db.Column(db.String(120), unique=True, nullable=False, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    profile = db.relationship('Profile', backref='user', uselist=False)
    
    def __init__(self, email, username, password):
        self.email = email
        self.username = username
        self.set_password(password)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'email': self.email,
            'username': self.username
        }
    
    def __repr__(self):
        return f'<User {self.email}>'
