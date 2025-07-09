import { createBrowserRouter } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import ProfileView from '../components/profile/ProfileView';
import ProfileEditPage from '../components/profile/ProfileEditPage';
import PostCreate from '../components/posts/PostCreate';
import PostList from '../components/posts/PostList';
import Feed from '../components/feed/Feed';
import JobList from '../components/job-board/JobList';
import MessageList from '../components/messaging/MessageList';
import Layout from '../components/layout/Layout';
import PostView from '../components/posts/PostView';

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
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'profile',
        element: <ProfileView />,
      },
      {
        path: 'profile/edit',
        element: <ProfileEditPage />,
      },
      {
        path: 'posts/create',
        element: <PostCreate />,
      },
      {
        path: 'posts',
        element: <PostList />,
      },
      {
        path: 'posts/:id',
        element: <PostView />,
      },
      {
        path: 'feed',
        element: <Feed />,
      },
      {
        path: 'jobs',
        element: <JobList />,
      },
      {
        path: 'messages',
        element: <MessageList />,
      },
    ],
  },
]); 