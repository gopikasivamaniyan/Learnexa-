/**
 * Mock data for visual development ONLY.
 * Every export here mirrors the shape the Flask API is expected to return,
 * so screens can switch to `api.get(...)` without changing components.
 */

export type Stat = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: string;
};

export const learnerProfile = {
  name: "Gopika",
  fullName: "Gopika S",
  email: "gopika@learnexa.ai",
  role: "learner" as const,
  level: "Intermediate",
  streak: 12,
  avatarInitials: "GS",
};

export const dashboardStats: Stat[] = [
  {
    id: "time",
    label: "Learning Time",
    value: "28h 40m",
    delta: "+3h this week",
    trend: "up",
    icon: "clock",
  },
  { id: "chats", label: "AI Chats", value: "164", delta: "+22", trend: "up", icon: "message" },
  {
    id: "topics",
    label: "Completed Topics",
    value: "37",
    delta: "+5",
    trend: "up",
    icon: "check",
  },
  { id: "quiz", label: "Quiz Score", value: "86%", delta: "+4%", trend: "up", icon: "target" },
  {
    id: "progress",
    label: "Study Progress",
    value: "72%",
    delta: "+8%",
    trend: "up",
    icon: "trending",
  },
];

export const continueLearning = [
  {
    id: "c1",
    title: "Python Functions & Recursion",
    subject: "Programming",
    progress: 68,
    lastOpened: "2 hours ago",
  },
  {
    id: "c2",
    title: "Normalization in DBMS",
    subject: "Databases",
    progress: 41,
    lastOpened: "Yesterday",
  },
  {
    id: "c3",
    title: "Supervised Learning Basics",
    subject: "Machine Learning",
    progress: 85,
    lastOpened: "3 days ago",
  },
];

export type DocumentItem = {
  id: string;
  name: string;
  type: "pdf" | "docx" | "image";
  size: string;
  pages: number;
  subject: string;
  uploadedAt: string;
  status: "ready" | "processing" | "failed";
};

export const documents: DocumentItem[] = [
  {
    id: "d1",
    name: "Operating Systems Unit 3.pdf",
    type: "pdf",
    size: "4.2 MB",
    pages: 38,
    subject: "Operating Systems",
    uploadedAt: "2026-09-12",
    status: "ready",
  },
  {
    id: "d2",
    name: "Machine Learning Notes.docx",
    type: "docx",
    size: "1.1 MB",
    pages: 12,
    subject: "Machine Learning",
    uploadedAt: "2026-09-10",
    status: "ready",
  },
  {
    id: "d3",
    name: "DBMS ER Diagram.png",
    type: "image",
    size: "820 KB",
    pages: 1,
    subject: "Databases",
    uploadedAt: "2026-09-08",
    status: "ready",
  },
  {
    id: "d4",
    name: "Python Practice Set.pdf",
    type: "pdf",
    size: "2.6 MB",
    pages: 21,
    subject: "Programming",
    uploadedAt: "2026-09-05",
    status: "processing",
  },
];

export const recommendations = [
  {
    id: "r1",
    title: "Revise Python Functions",
    reason: "You scored 62% on the last functions quiz.",
    difficulty: "Medium",
    minutes: 25,
    subject: "Programming",
  },
  {
    id: "r2",
    title: "Practice SQL Queries",
    reason: "Joins and subqueries are your weakest topic this week.",
    difficulty: "Hard",
    minutes: 40,
    subject: "Databases",
  },
  {
    id: "r3",
    title: "Review Machine Learning Basics",
    reason: "It has been 9 days since your last revision.",
    difficulty: "Easy",
    minutes: 20,
    subject: "Machine Learning",
  },
  {
    id: "r4",
    title: "Deadlock Handling in OS",
    reason: "Upcoming exam on 28 Sep covers this unit.",
    difficulty: "Medium",
    minutes: 30,
    subject: "Operating Systems",
  },
];

export const weeklyActivity = [
  { day: "Mon", minutes: 65, quiz: 72 },
  { day: "Tue", minutes: 90, quiz: 78 },
  { day: "Wed", minutes: 45, quiz: 69 },
  { day: "Thu", minutes: 120, quiz: 84 },
  { day: "Fri", minutes: 80, quiz: 88 },
  { day: "Sat", minutes: 150, quiz: 91 },
  { day: "Sun", minutes: 60, quiz: 86 },
];

export const topicProgress = [
  { topic: "Python", progress: 82 },
  { topic: "DBMS", progress: 64 },
  { topic: "ML", progress: 58 },
  { topic: "OS", progress: 47 },
  { topic: "Networks", progress: 35 },
];

export const learningTrend = [
  { week: "W1", score: 58 },
  { week: "W2", score: 64 },
  { week: "W3", score: 71 },
  { week: "W4", score: 69 },
  { week: "W5", score: 78 },
  { week: "W6", score: 86 },
];

export const todayPlan = [
  { id: "t1", topic: "Python Recursion", duration: "45 min", priority: "High", done: true },
  { id: "t2", topic: "SQL Joins Practice", duration: "30 min", priority: "High", done: false },
  { id: "t3", topic: "ML Cost Functions", duration: "40 min", priority: "Medium", done: false },
  { id: "t4", topic: "OS Paging Revision", duration: "25 min", priority: "Low", done: false },
];

export const notes = [
  {
    id: "n1",
    title: "Python Functions — Quick Notes",
    subject: "Programming",
    source: "ai" as const,
    updatedAt: "2026-09-13",
    content:
      "A function groups reusable logic.\n\n• def defines a function\n• Arguments can be positional, keyword or default\n• *args collects extra positional args, **kwargs collects keyword args\n• Recursion needs a base case to terminate\n• Prefer pure functions for testability",
  },
  {
    id: "n2",
    title: "DBMS Normalization",
    subject: "Databases",
    source: "ai" as const,
    updatedAt: "2026-09-11",
    content:
      "1NF: atomic values.\n2NF: no partial dependency on a composite key.\n3NF: no transitive dependency.\nBCNF: every determinant is a candidate key.",
  },
  {
    id: "n3",
    title: "Doubts to ask in class",
    subject: "General",
    source: "manual" as const,
    updatedAt: "2026-09-09",
    content: "• Difference between paging and segmentation\n• When is BCNF decomposition lossy?",
  },
];

export const flashcards = [
  {
    id: "f1",
    front: "What is a pure function?",
    back: "A function whose output depends only on its inputs and which causes no side effects.",
    subject: "Programming",
  },
  {
    id: "f2",
    front: "Define 3NF",
    back: "A relation in 2NF with no transitive dependency of non-prime attributes on the primary key.",
    subject: "Databases",
  },
  {
    id: "f3",
    front: "What is overfitting?",
    back: "When a model learns noise in the training data and fails to generalise to unseen data.",
    subject: "Machine Learning",
  },
  {
    id: "f4",
    front: "What causes a deadlock?",
    back: "Mutual exclusion, hold and wait, no preemption and circular wait occurring together.",
    subject: "Operating Systems",
  },
  {
    id: "f5",
    front: "What does *args do?",
    back: "Collects any number of extra positional arguments into a tuple.",
    subject: "Programming",
  },
];

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  topic: string;
  explanation: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "Which keyword defines a function in Python?",
    options: ["func", "def", "function", "lambda"],
    answerIndex: 1,
    topic: "Python Functions",
    explanation: "`def` introduces a named function definition in Python.",
  },
  {
    id: "q2",
    question: "Which normal form removes transitive dependencies?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answerIndex: 2,
    topic: "Normalization",
    explanation: "3NF removes transitive dependencies on the primary key.",
  },
  {
    id: "q3",
    question: "Supervised learning requires…",
    options: ["Unlabeled data", "Labeled data", "No data", "Only images"],
    answerIndex: 1,
    topic: "Machine Learning",
    explanation: "Supervised learning maps inputs to known labels.",
  },
  {
    id: "q4",
    question: "Which SQL clause combines rows from two tables?",
    options: ["GROUP BY", "JOIN", "HAVING", "ORDER BY"],
    answerIndex: 1,
    topic: "SQL",
    explanation: "JOIN combines rows based on a related column.",
  },
  {
    id: "q5",
    question: "A deadlock requires all of the following EXCEPT…",
    options: ["Circular wait", "Hold and wait", "Preemption", "Mutual exclusion"],
    answerIndex: 2,
    topic: "Operating Systems",
    explanation: "Deadlock needs NO preemption; preemption prevents it.",
  },
];

export const revisionItems = {
  today: [
    { id: "rv1", topic: "Python Recursion", subject: "Programming", strength: 62 },
    { id: "rv2", topic: "SQL Joins", subject: "Databases", strength: 48 },
  ],
  upcoming: [
    {
      id: "rv3",
      topic: "Gradient Descent",
      subject: "Machine Learning",
      due: "16 Sep",
      strength: 71,
    },
    {
      id: "rv4",
      topic: "Process Scheduling",
      subject: "Operating Systems",
      due: "18 Sep",
      strength: 66,
    },
  ],
  overdue: [
    { id: "rv5", topic: "Normalization", subject: "Databases", due: "10 Sep", strength: 39 },
  ],
};

export const chatHistory = [
  {
    id: "h1",
    title: "Explain recursion with an example",
    preview: "Recursion is when a function calls itself…",
    date: "Today",
    messages: 12,
  },
  {
    id: "h2",
    title: "Difference between SQL and NoSQL",
    preview: "SQL databases are relational and schema-based…",
    date: "Yesterday",
    messages: 8,
  },
  {
    id: "h3",
    title: "Summarise Operating Systems Unit 3",
    preview: "Unit 3 covers memory management, paging…",
    date: "12 Sep",
    messages: 16,
  },
];

export const strongTopics = ["Python Basics", "Arrays", "OOP Concepts", "ER Modelling"];
export const weakTopics = ["SQL Joins", "Deadlocks", "Gradient Descent", "Normalization"];

/* ---------- Institution ---------- */

export const institutionStats = [
  {
    id: "s1",
    label: "Total Students",
    value: "1,284",
    delta: "+64 this month",
    trend: "up" as const,
  },
  { id: "s2", label: "Active Students", value: "978", delta: "76% active", trend: "up" as const },
  { id: "s3", label: "Courses", value: "42", delta: "+3 new", trend: "up" as const },
  { id: "s4", label: "Average Progress", value: "68%", delta: "+5%", trend: "up" as const },
  { id: "s5", label: "Average Quiz Score", value: "74%", delta: "-2%", trend: "down" as const },
];

export type Student = {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  quizAverage: number;
  status: "active" | "blocked";
};

export const students: Student[] = [
  {
    id: "st1",
    name: "Aarav Menon",
    email: "aarav@campus.edu",
    course: "B.Tech CSE",
    progress: 82,
    quizAverage: 88,
    status: "active",
  },
  {
    id: "st2",
    name: "Divya Krishnan",
    email: "divya@campus.edu",
    course: "B.Tech IT",
    progress: 74,
    quizAverage: 79,
    status: "active",
  },
  {
    id: "st3",
    name: "Rahul Verma",
    email: "rahul@campus.edu",
    course: "MCA",
    progress: 51,
    quizAverage: 62,
    status: "blocked",
  },
  {
    id: "st4",
    name: "Sneha Pillai",
    email: "sneha@campus.edu",
    course: "B.Sc Data Science",
    progress: 91,
    quizAverage: 94,
    status: "active",
  },
  {
    id: "st5",
    name: "Karthik Raj",
    email: "karthik@campus.edu",
    course: "B.Tech CSE",
    progress: 64,
    quizAverage: 70,
    status: "active",
  },
];

export const teachers = [
  {
    id: "t1",
    name: "Dr. Meera Nair",
    email: "meera@campus.edu",
    department: "Computer Science",
    courses: 4,
    students: 210,
  },
  {
    id: "t2",
    name: "Prof. Anand Kumar",
    email: "anand@campus.edu",
    department: "Data Science",
    courses: 3,
    students: 168,
  },
  {
    id: "t3",
    name: "Dr. Lakshmi Iyer",
    email: "lakshmi@campus.edu",
    department: "Information Technology",
    courses: 5,
    students: 241,
  },
];

export const courses = [
  {
    id: "c1",
    title: "Data Structures & Algorithms",
    code: "CS201",
    teacher: "Dr. Meera Nair",
    students: 186,
    progress: 72,
  },
  {
    id: "c2",
    title: "Database Management Systems",
    code: "CS304",
    teacher: "Dr. Lakshmi Iyer",
    students: 164,
    progress: 65,
  },
  {
    id: "c3",
    title: "Machine Learning Foundations",
    code: "DS410",
    teacher: "Prof. Anand Kumar",
    students: 132,
    progress: 58,
  },
  {
    id: "c4",
    title: "Operating Systems",
    code: "CS306",
    teacher: "Dr. Meera Nair",
    students: 149,
    progress: 61,
  },
];

export const materials = [
  {
    id: "m1",
    title: "DSA Module 1 — Complexity",
    course: "CS201",
    type: "pdf",
    size: "3.4 MB",
    uploadedAt: "2026-09-11",
  },
  {
    id: "m2",
    title: "DBMS Lab Manual",
    course: "CS304",
    type: "docx",
    size: "1.8 MB",
    uploadedAt: "2026-09-09",
  },
  {
    id: "m3",
    title: "ML Lecture Slides — Regression",
    course: "DS410",
    type: "pdf",
    size: "5.1 MB",
    uploadedAt: "2026-09-06",
  },
];
