from ..extensions import db

class Profile(db.Model):
    __tablename__ = 'profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), db.ForeignKey('users.email'), unique=True, nullable=False)
    avatar = db.Column(db.String(255))
    name = db.Column(db.String(120))
    title = db.Column(db.String(120))
    location = db.Column(db.String(120))
    bio = db.Column(db.Text)
    skills = db.Column(db.Text)  # Comma-separated string
    social = db.Column(db.Text)  # JSON string
    experience = db.Column(db.Text)  # JSON string
    education = db.Column(db.Text)  # JSON string
    contact = db.Column(db.Text)  # JSON string
    connections = db.Column(db.Integer, default=0)
    mutual_connections = db.Column(db.Integer, default=0)
    activity = db.Column(db.Text)  # JSON string

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'avatar': self.avatar,
            'name': self.name,
            'title': self.title,
            'location': self.location,
            'bio': self.bio,
            'skills': self.skills.split(',') if self.skills else [],
            'social': json.loads(self.social) if self.social else [],
            'experience': json.loads(self.experience) if self.experience else [],
            'education': json.loads(self.education) if self.education else [],
            'contact': json.loads(self.contact) if self.contact else {},
            'connections': self.connections,
            'mutualConnections': self.mutual_connections,
            'activity': json.loads(self.activity) if self.activity else [],
        }
