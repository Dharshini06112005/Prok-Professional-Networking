import React, { useState } from "react";
import type { UserProfile } from "../../types/profile";
import ImageUpload from "./ImageUpload";
import "./ProfileEdit.css";

interface Props {
  user: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ProfileEdit: React.FC<Props> = ({ user, onSave }) => {
  const [form, setForm] = useState(user);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (url: string) => {
    setForm({ ...form, avatar: url });
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!form.name) errs.name = "Name is required";
    if (!validateEmail(form.contact.email)) errs.email = "Invalid email";
    if (!form.title) errs.title = "Title is required";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      setTimeout(() => {
        onSave(form);
        setSubmitting(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1500);
      }, 1000); // Simulate API
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form p-6 bg-white rounded-2xl shadow-xl mt-4 animate-fade-in">
      <ImageUpload value={form.avatar} onChange={handleImageChange} />
      <div className="mb-4 relative">
        <input name="name" value={form.name} onChange={handleChange} className="input-floating peer" required />
        <label className="floating-label">Name</label>
        {errors.name && <div className="error-message animate-shake">{errors.name}</div>}
      </div>
      <div className="mb-4 relative">
        <input name="email" value={form.contact.email} onChange={e => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })} className="input-floating peer" required />
        <label className="floating-label">Email</label>
        {errors.email && <div className="error-message animate-shake">{errors.email}</div>}
      </div>
      <div className="mb-4 relative">
        <input name="title" value={form.title} onChange={handleChange} className="input-floating peer" required />
        <label className="floating-label">Title</label>
        {errors.title && <div className="error-message animate-shake">{errors.title}</div>}
      </div>
      <div className="mb-4 relative">
        <textarea name="bio" value={form.bio} onChange={handleChange} className="input-floating peer" />
        <label className="floating-label">Bio</label>
      </div>
      {/* Add more fields as needed */}
      <button type="submit" className="btn-animated" disabled={submitting || success}>
        {submitting ? <span className="loader spinner-border animate-spin"></span> : success ? <span className="success-check">✔</span> : "Save"}
      </button>
    </form>
  );
};

export default ProfileEdit; 