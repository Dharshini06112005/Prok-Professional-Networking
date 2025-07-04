import { createBrowserRouter } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';
import PostCreate from '../components/posts/PostCreate';
import PostList from '../components/posts/PostList';
import Feed from '../components/feed/Feed';
import JobList from '../components/job-board/JobList';
import MessageList from '../components/messaging/MessageList';
import React, { useState } from "react";
import { mockUserProfile } from "../components/profile/mockProfileData";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileInfo from "../components/profile/ProfileInfo";
import ProfileActivity from "../components/profile/ProfileActivity";

const ProfilePage: React.FC = () => {
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

export default ProfilePage;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/profile',
    element: <ProfileView />,
  },
  {
    path: '/profile/edit',
    element: <ProfileEdit />,
  },
  {
    path: '/posts/create',
    element: <PostCreate />,
  },
  {
    path: '/posts',
    element: <PostList />,
  },
  {
    path: '/jobs',
    element: <JobList />,
  },
  {
    path: '/messages',
    element: <MessageList />,
  },
]); 