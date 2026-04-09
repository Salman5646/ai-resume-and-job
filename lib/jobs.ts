export interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  requiredSkills: string[];
}

export const jobCatalog: Job[] = [
  {
    id: "1",
    title: "Frontend Developer",
    category: "Development",
    description: "Design and implement user interfaces for modern web applications using React and TypeScript.",
    requiredSkills: ["React", "HTML", "CSS", "JavaScript", "TypeScript", "Next.js", "Tailwind CSS"],
  },
  {
    id: "2",
    title: "Backend Developer",
    category: "Development",
    description: "Build scalable server-side systems, APIs, and manage databases.",
    requiredSkills: ["Node.js", "Python", "SQL", "REST APIs", "Docker", "PostgreSQL", "MongoDB"],
  },
  {
    id: "3",
    title: "Data Analyst",
    category: "Data Science",
    description: "Analyze large datasets to extract meaningful insights and create visualizations.",
    requiredSkills: ["Python", "SQL", "Excel", "Tableau", "Power BI", "Statistics", "Data Visualization"],
  },
  {
    id: "4",
    title: "ML Engineer",
    category: "Data Science",
    description: "Develop and deploy machine learning models and AI systems.",
    requiredSkills: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Deep Learning", "NLP", "Computer Vision"],
  },
  {
    id: "5",
    title: "UI/UX Designer",
    category: "Design",
    description: "Create user-centered designs, wireframes, and prototypes for digital products.",
    requiredSkills: ["Figma", "Adobe XD", "Wireframing", "Prototyping", "User Research", "Interaction Design"],
  },
  {
    id: "6",
    title: "DevOps Engineer",
    category: "Operations",
    description: "Manage infrastructure, CI/CD pipelines, and cloud deployments.",
    requiredSkills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform", "Jenkins"],
  },
  {
    id: "7",
    title: "Mobile Developer",
    category: "Development",
    description: "Build native or cross-platform mobile applications for iOS and Android.",
    requiredSkills: ["React Native", "Flutter", "Swift", "Kotlin", "Mobile App Development", "Firebase"],
  },
  {
    id: "8",
    title: "Data Engineer",
    category: "Data Science",
    description: "Build and maintain data pipelines and large-scale data processing systems.",
    requiredSkills: ["Spark", "Kafka", "Airflow", "SQL", "Python", "BigData", "Hadoop"],
  },
  {
    id: "9",
    title: "Cybersecurity Analyst",
    category: "Security",
    description: "Protect systems and networks from cyber threats and perform security audits.",
    requiredSkills: ["Networking", "SIEM", "Penetration Testing", "Security Operations", "Incident Response"],
  },
  {
    id: "10",
    title: "Product Manager",
    category: "Management",
    description: "Define product strategy, roadmaps, and work with engineering teams to deliver features.",
    requiredSkills: ["Agile", "Roadmapping", "JIRA", "Stakeholder Management", "User Stories"],
  },
  {
    id: "11",
    title: "Cloud Architect",
    category: "Operations",
    description: "Design and implement cloud infrastructure solutions for enterprise scale.",
    requiredSkills: ["AWS", "Azure", "GCP", "Terraform", "Cloud Networking", "Solution Architecture"],
  },
  {
    id: "12",
    title: "Full Stack Developer",
    category: "Development",
    description: "Handle both frontend and backend development tasks for complete web solutions.",
    requiredSkills: ["React", "Node.js", "SQL", "REST APIs", "Git", "TypeScript", "Express"],
  },
];
