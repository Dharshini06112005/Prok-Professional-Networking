import React, { useState } from 'react';
import { mockUserProfile } from './mockProfileData';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import ProfileActivity from './ProfileActivity';
import ProfileEdit from './ProfileEdit';

const ProfileView: React.FC = () => {
  const [user, setUser] = useState(mockUserProfile);
  const [editing, setEditing] = useState(false);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <ProfileHeader user={user} />
      <div className="flex justify-end mt-2">
        <button className="btn" onClick={() => setEditing((e) => !e)}>
          {editing ? "Cancel" : "Edit Profile"}
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