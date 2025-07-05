import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileEdit from './ProfileEdit';
import { profileApi } from './api';
import type { UserProfile } from '../../types/profile';
import { useAuth } from '../../context/AuthContext';

const ProfileEditPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileApi.getProfile();
        setProfile(data);
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

    loadProfile();
  }, [logout, navigate]);

  const handleSave = async (updatedProfile: UserProfile) => {
    try {
      await profileApi.updateProfile(updatedProfile);
      setProfile(updatedProfile);
      navigate('/profile');
    } catch (err: any) {
      if (err.message && err.message.includes('Token has expired')) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.message || 'Failed to save profile');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Profile not found. Please create a profile first.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <ProfileEdit user={profile} onSave={handleSave} />
    </div>
  );
};

export default ProfileEditPage; 