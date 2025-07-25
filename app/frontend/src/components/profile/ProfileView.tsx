import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from './api';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import ProfileActivity from './ProfileActivity';
import ProfileEdit from './ProfileEdit';
import type { UserProfile } from '../../types/profile';

const ProfileView: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileApi.getProfile();
      setUser(data);
    } catch (err: any) {
      if (err.message && err.message.includes('Token has expired')) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return (
    <div className="text-center mt-8 text-black">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-black">Loading profile...</p>
    </div>
  );
  
  if (error) return (
    <div className="text-center text-red-500 mt-8">
      <p className="text-black">Error loading profile</p>
      <p className="text-red-500">{error}</p>
    </div>
  );
  
  if (!user) return (
    <div className="text-center mt-8 text-black">
      <p>No profile found.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto mt-8 text-black">
      <ProfileHeader user={user} />
      <div className="flex justify-between mt-2">
        <button className="btn text-black" onClick={() => setEditing((e) => !e)}>
          {editing ? "Cancel" : "Edit Profile"}
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors ml-2"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      {editing ? (
        <ProfileEdit user={user} onSave={(u) => { setUser(u); setEditing(false); }} />
      ) : (
        <>
          <ProfileInfo user={user} />
          <ProfileActivity user={user} />
        </>
      )}
    </div>
  );
};

export default ProfileView; 