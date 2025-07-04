import type { UserProfile } from '../../types/profile';

export const mockUserProfile: UserProfile = {
  id: "1",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  name: "John Doe",
  title: "Software Engineer",
  location: "San Francisco, CA",
  social: [
    { platform: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
    { platform: "Twitter", url: "https://twitter.com/johndoe" },
    { platform: "GitHub", url: "https://github.com/johndoe" },
    { platform: "Instagram", url: "https://instagram.com/johndoe" }
  ],
  bio: "Passionate developer with 5+ years of experience in web technologies.",
  skills: ["React", "TypeScript", "Node.js", "GraphQL", "Tailwind CSS", "UI/UX", "Animations"],
  experience: [
    {
      company: "Tech Corp",
      title: "Senior Developer",
      startDate: "2019-01",
      endDate: "2022-12",
      description: "Worked on scalable web applications."
    },
    {
      company: "Webify",
      title: "Frontend Engineer",
      startDate: "2017-06",
      endDate: "2018-12",
      description: "Built modern UIs with React and TypeScript."
    }
  ],
  education: [
    {
      school: "MIT",
      degree: "B.Sc.",
      field: "Computer Science",
      startDate: "2014-09",
      endDate: "2018-06"
    }
  ],
  contact: {
    email: "john.doe@example.com",
    phone: "123-456-7890",
    website: "https://johndoe.dev"
  },
  connections: 150,
  mutualConnections: 10,
  activity: [
    {
      id: "a1",
      type: "post",
      content: "Excited to join Tech Corp!",
      date: "2023-01-01"
    },
    {
      id: "a2",
      type: "connection",
      content: "Connected with Jane Smith",
      date: "2023-01-02"
    },
    {
      id: "a3",
      type: "post",
      content: "Published a new article on React animations!",
      date: "2023-01-10"
    },
    {
      id: "a4",
      type: "like",
      content: "Liked a post by Alice Brown",
      date: "2023-01-12"
    },
    {
      id: "a5",
      type: "comment",
      content: "Commented on a discussion about TypeScript best practices.",
      date: "2023-01-15"
    },
    {
      id: "a6",
      type: "post",
      content: "Shared a project on GitHub!",
      date: "2023-01-20"
    }
  ]
}; 