import React, { useState } from "react";
import type { UserProfile } from "../../types/profile";
import "./ProfileActivity.css";

interface Props {
  user: UserProfile;
}

const PAGE_SIZE = 3;

const ProfileActivity: React.FC<Props> = ({ user }) => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const activities = user.activity.slice(0, page * PAGE_SIZE);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="mt-4 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-4">
          <div className="counter-box">
            <span className="counter" data-count={user.connections}>{user.connections}</span> <span className="text-gray-500">Connections</span>
          </div>
          <div className="counter-box">
            <span className="counter" data-count={user.mutualConnections}>{user.mutualConnections}</span> <span className="text-gray-500">Mutual</span>
          </div>
        </div>
        <div className="font-semibold text-blue-700">Activity Timeline</div>
      </div>
      <ul className="timeline-list">
        {activities.map((act, idx) => (
          <li key={act.id} className={`mb-2 border-b pb-2 timeline-entry animate-slide-in delay-${idx}`}> 
            <div className="text-sm text-gray-500">{act.date}</div>
            <div>{act.content}</div>
          </li>
        ))}
      </ul>
      {activities.length < user.activity.length && (
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
          onClick={handleLoadMore}
          disabled={loading}
        >
          {loading && <span className="loader spinner-border animate-spin"></span>}
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
};

export default ProfileActivity; 