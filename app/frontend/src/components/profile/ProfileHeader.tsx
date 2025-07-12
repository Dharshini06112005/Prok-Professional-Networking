import React from "react";
import type { UserProfile } from "../../types/profile";
import "./ProfileHeader.css";

interface Props {
  user: UserProfile;
}

const socialIcons: Record<string, string> = {
  LinkedIn: "fab fa-linkedin-in",
  Twitter: "fab fa-twitter",
  GitHub: "fab fa-github",
  Facebook: "fab fa-facebook-f",
  Instagram: "fab fa-instagram",
};

const getAvatarUrl = (avatar: string) => {
  if (!avatar) return '/default-avatar.png';
  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('/api/')) return `https://prok-professional-networking-t19l.onrender.com${avatar}`;
  return avatar;
};

const ProfileHeader: React.FC<Props> = ({ user }) => (
  <div className="profile-header flex flex-col md:flex-row items-center md:items-start p-6 bg-white rounded-2xl shadow-xl animate-fade-in">
    <div className="avatar-wrapper group mb-4 md:mb-0 md:mr-8">
      <img
        src={getAvatarUrl(user.avatar)}
        alt={user.name}
        className="w-28 h-28 rounded-full border-4 border-blue-400 shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:glow-avatar"
      />
    </div>
    <div className="flex-1 text-center md:text-left">
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 animate-slide-up mb-1">
        {user.name}
      </h2>
      <p className="text-lg text-blue-700 font-semibold animate-fade-in-slow mb-1">
        {user.title} <span className="mx-2 text-gray-400">•</span> {user.location}
      </p>
      <div className="flex justify-center md:justify-start space-x-4 mt-2">
        {user.social.map((link) => (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon group-hover:scale-110 transition-transform duration-200"
            title={link.platform}
          >
            <i className={socialIcons[link.platform] + " text-2xl text-blue-500 hover:text-blue-700 transition-colors duration-200"}></i>
          </a>
        ))}
      </div>
    </div>
  </div>
);

export default ProfileHeader; 