import React, { useState } from "react";
import type { UserProfile } from "../../types/profile";
import ImageUpload from "./ImageUpload";
import { profileApi } from "./api";
import "./ProfileEdit.css";

interface Props {
  user: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ProfileEdit: React.FC<Props> = ({ user, onSave }) => {
  const [form, setForm] = useState(user);
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (url: string) => {
    setForm({ ...form, avatar: url });
  };

  // --- Skills tag input logic ---
  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillInput(e.target.value);
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      if (!form.skills.includes(skillInput.trim())) {
        setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      }
      setSkillInput("");
    } else if (e.key === "Backspace" && !skillInput && form.skills.length > 0) {
      setForm({ ...form, skills: form.skills.slice(0, -1) });
    }
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };
  // --- End skills logic ---

  // --- Experience editing logic ---
  const addExperience = () => {
    const newExp = { title: "", company: "", startDate: "", endDate: "", description: "" };
    setForm({ ...form, experience: [...form.experience, newExp] });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updatedExp = [...form.experience];
    updatedExp[index] = { ...updatedExp[index], [field]: value };
    setForm({ ...form, experience: updatedExp });
  };

  const removeExperience = (index: number) => {
    setForm({ ...form, experience: form.experience.filter((_, i) => i !== index) });
  };

  // --- Education editing logic ---
  const addEducation = () => {
    const newEdu = { degree: "", field: "", school: "", startDate: "", endDate: "" };
    setForm({ ...form, education: [...form.education, newEdu] });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updatedEdu = [...form.education];
    updatedEdu[index] = { ...updatedEdu[index], [field]: value };
    setForm({ ...form, education: updatedEdu });
  };

  const removeEducation = (index: number) => {
    setForm({ ...form, education: form.education.filter((_, i) => i !== index) });
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!form.name) errs.name = "Name is required";
    if (!validateEmail(form.contact.email)) errs.email = "Invalid email";
    if (!form.title) errs.title = "Title is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setError(null);
    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      try {
        // Always send skills as a flat array
        const updated = await profileApi.updateProfile({ ...form, skills: form.skills });
        onSave(updated);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1500);
      } catch (err: any) {
        setError(err.message || "Update failed");
      } finally {
        setSubmitting(false);
      }
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
      {/* Skills input below bio */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Skills</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.skills.map((skill) => (
            <span key={skill} className="skill-chip bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold shadow hover:bg-blue-200 hover:scale-110 transition-all duration-200 cursor-pointer flex items-center">
              {skill}
              <button type="button" className="ml-2 text-blue-500 hover:text-red-500" onClick={() => removeSkill(skill)} title="Remove skill">&times;</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={skillInput}
          onChange={handleSkillInputChange}
          onKeyDown={handleSkillKeyDown}
          placeholder="Type a skill and press Enter"
          className="input-floating"
        />
      </div>

      {/* Experience Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block font-semibold">Experience</label>
          <button type="button" onClick={addExperience} className="btn-add text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors">
            + Add Experience
          </button>
        </div>
        {form.experience.map((exp, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-700">Experience #{index + 1}</h4>
              <button type="button" onClick={() => removeExperience(index)} className="text-red-500 hover:text-red-700 text-sm">
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => updateExperience(index, "title", e.target.value)}
                  placeholder="Job Title"
                  className="input-floating w-full"
                />
                <label className="floating-label">Job Title</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(index, "company", e.target.value)}
                  placeholder="Company"
                  className="input-floating w-full"
                />
                <label className="floating-label">Company</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                  placeholder="Start Date (e.g., Jan 2020)"
                  className="input-floating w-full"
                />
                <label className="floating-label">Start Date</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                  placeholder="End Date (e.g., Present)"
                  className="input-floating w-full"
                />
                <label className="floating-label">End Date</label>
              </div>
            </div>
            <div className="mt-3">
              <textarea
                value={exp.description}
                onChange={(e) => updateExperience(index, "description", e.target.value)}
                placeholder="Job description and responsibilities..."
                className="input-floating w-full"
                rows={3}
              />
              <label className="floating-label">Description</label>
            </div>
          </div>
        ))}
      </div>

      {/* Education Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block font-semibold">Education</label>
          <button type="button" onClick={addEducation} className="btn-add text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors">
            + Add Education
          </button>
        </div>
        {form.education.map((edu, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-700">Education #{index + 1}</h4>
              <button type="button" onClick={() => removeEducation(index)} className="text-red-500 hover:text-red-700 text-sm">
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, "degree", e.target.value)}
                  placeholder="Degree (e.g., Bachelor's)"
                  className="input-floating w-full"
                />
                <label className="floating-label">Degree</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => updateEducation(index, "field", e.target.value)}
                  placeholder="Field of Study"
                  className="input-floating w-full"
                />
                <label className="floating-label">Field of Study</label>
              </div>
              <div className="relative md:col-span-2">
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => updateEducation(index, "school", e.target.value)}
                  placeholder="School/University"
                  className="input-floating w-full"
                />
                <label className="floating-label">School/University</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                  placeholder="Start Date (e.g., 2018)"
                  className="input-floating w-full"
                />
                <label className="floating-label">Start Date</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                  placeholder="End Date (e.g., 2022)"
                  className="input-floating w-full"
                />
                <label className="floating-label">End Date</label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="submit" className="btn-animated" disabled={submitting || success}>
        {submitting ? <span className="loader spinner-border animate-spin"></span> : success ? <span className="success-check">✔</span> : "Save"}
      </button>
      {error && <div className="error-message mt-2 animate-shake">{error}</div>}
    </form>
  );
};

export default ProfileEdit; 