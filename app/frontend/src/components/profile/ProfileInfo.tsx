import React, { useState } from "react";
import type { UserProfile } from "../../types/profile";
import "./ProfileInfo.css";

interface Props {
  user: UserProfile;
}

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4 section-fade-in">
      <button
        className="w-full text-left font-semibold py-2 px-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded hover:bg-blue-200 transition-colors duration-200 flex justify-between items-center text-black"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-black">{title}</span>
        <span className={`transition-transform duration-300 text-black ${open ? "rotate-180" : "rotate-0"}`}>{open ? "▲" : "▼"}</span>
      </button>
      <div
        className={`collapsible-content transition-all duration-500 ease-in-out overflow-hidden ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        {open && <div className="p-4 text-black">{children}</div>}
      </div>
    </div>
  );
};

const ProfileInfo: React.FC<Props> = ({ user }) => (
  <div className="mt-4 text-black">
    <CollapsibleSection title="Bio">
      <p className="animate-fade-in-slow text-black">{user.bio}</p>
    </CollapsibleSection>
    <CollapsibleSection title="Skills">
      <div className="flex flex-wrap gap-2">
        {user.skills.map((skill) => (
          <span key={skill} className="skill-chip bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold shadow hover:bg-blue-200 hover:scale-110 transition-all duration-200 cursor-pointer">
            {skill}
          </span>
        ))}
      </div>
    </CollapsibleSection>
    <CollapsibleSection title="Experience">
      {user.experience.map((exp, idx) => (
        <div key={idx} className="experience-item animate-fade-in-slow text-black">
          <div className="experience-title text-black">{exp.title} @ {exp.company}</div>
          <div className="experience-dates text-black">{exp.startDate} - {exp.endDate || "Present"}</div>
          <div className="experience-description text-black">{exp.description}</div>
        </div>
      ))}
    </CollapsibleSection>
    <CollapsibleSection title="Education">
      {user.education.map((edu, idx) => (
        <div key={idx} className="education-item animate-fade-in-slow text-black">
          <div className="education-degree text-black">{edu.degree} in {edu.field}</div>
          <div className="education-school text-black">{edu.school}</div>
          <div className="education-dates text-black">{edu.startDate} - {edu.endDate}</div>
        </div>
      ))}
    </CollapsibleSection>
    <CollapsibleSection title="Contact">
      <div className="animate-fade-in-slow text-black">Email: {user.contact.email}</div>
      {user.contact.phone && <div className="animate-fade-in-slow text-black">Phone: {user.contact.phone}</div>}
      {user.contact.website && <div className="animate-fade-in-slow text-black">Website: <a href={user.contact.website} className="text-blue-500 underline hover:text-blue-700" target="_blank" rel="noopener noreferrer">{user.contact.website}</a></div>}
    </CollapsibleSection>
  </div>
);

export default ProfileInfo; 