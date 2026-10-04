// src/content.ts
// ─── Single source of truth for everything the portfolio says ───
// Panels, the project list, the résumé and the <noscript> fallback all read from here.
// Source: "Upanshu Pandey CV 2026". Keep every claim traceable to the CV.

export const PROFILE = {
  name: "Upanshu Pandey",
  title: "ERP Consultant · Full-Stack Developer",
  location: "Kathmandu, Nepal",
  status: "Open to new roles",
  email: "upanshupandey@gmail.com",
  linkedin: "https://www.linkedin.com/in/upanshu-pandey-48a48b1a4/",
  resume: "assets/resume/upanshu-pandey-cv.pdf",
  summary:
    "Technical Consultant and Full-Stack Developer with nearly four years of experience across " +
    "Microsoft Dynamics 365 Business Central, full-stack C# and React applications, and AI and data work: " +
    "a RAG pipeline on a Qdrant vector database and machine learning forecasting models in Python. " +
    "I like the unglamorous parts too: integrations, databases and servers that keep production running.",
};

export type Category = "WEB" | "DATA" | "ERP" | "AI" | "INFRA" | "API";

/** Colour-coded category tags. */
export const CATEGORY_COLORS: Record<Category, string> = {
  WEB: "#5888d8", DATA: "#9870d0", ERP: "#e08838", AI: "#e05890", INFRA: "#708090", API: "#48a878",
};

export interface Project {
  id: string;
  title: string;
  short: string;          // one-liner for lists
  building: "web" | "systems";
  categories: Category[];
  when: string;
  body: string[];         // paragraphs
  highlights: string[];
  tags: string[];
  pdf?: { label: string; path: string };   // supporting document, opened in a new tab
}

export const PROJECTS: Project[] = [
  {
    id: "fullstack",
    title: "Full-Stack Business Applications",
    short: "C# and React applications, including an Azure-hosted app",
    building: "web",
    categories: ["WEB"],
    when: "Voyager Nepal · 2024–2026",
    body: [
      "At Voyager Nepal I developed full-stack applications with a C# (.NET) backend and a React front end.",
      "I also worked on an application hosted on Azure, alongside the containerised services (Qdrant, Redis, ClickHouse) that backed our enterprise tooling.",
    ],
    highlights: [
      "Full-stack development in C# and React",
      "Work on an Azure-hosted application",
      "Built alongside Business Central consultancy for the same clients",
    ],
    tags: ["C#", ".NET", "React", "Azure", "Docker"],
  },
  {
    id: "ecommerce",
    title: "E-Commerce Website",
    short: "Laravel store with search, cart, checkout and payments",
    building: "web",
    categories: ["WEB"],
    when: "Personal project",
    body: [
      "A complete e-commerce website built with Laravel.",
      "Shoppers can browse with product filters, site search and navigation, add items to a cart, check out with online payment, and leave reviews and comments on products.",
    ],
    highlights: [
      "Product filters, site search and navigation",
      "Cart, checkout and online payment",
      "Product reviews and comments",
    ],
    tags: ["Laravel", "PHP", "HTML", "CSS"],
  },
  {
    id: "quantum",
    title: "Quantum RL Circuit Optimizer",
    short: "PPO agent that learns circuits matching a hidden bit string",
    building: "web",
    categories: ["AI", "WEB"],
    when: "BSc dissertation · 2023 · First Class",
    body: [
      "My final-year dissertation, \"Quantum Reinforcement Learning for Quantum Circuit Optimization\": training a reinforcement-learning agent to generate quantum circuits that match a given hidden bit string, the problem behind the Bernstein–Vazirani algorithm.",
      "I built a custom Gym environment around Qiskit. Each episode builds the circuit (CX entangling gates driven by the hidden string, a Hadamard gate on every qubit, then measurement), runs it on Qiskit Aer's statevector simulator and gives the agent the measurement probabilities as its observation. The agent acts on individual qubits, and the reward is the probability-weighted share of bits that match the hidden string.",
      "The policy was trained with Proximal Policy Optimization (PPO) from Stable Baselines3 using an MLP policy, with a custom callback tracking reward and success rate during training.",
      "A Streamlit app loads the trained model: enter a hidden bit string and watch the agent work through the circuit, with the reward and a rendered circuit diagram at every step.",
      "The thesis also covers the alternatives I evaluated (TensorFlow Quantum, Microsoft's QDK) and future work such as other RL algorithms (DQN, A2C) and running on real quantum hardware.",
    ],
    highlights: [
      "Custom Gym environment over Qiskit Aer's statevector simulator",
      "PPO agent (Stable Baselines3) with a bit-match reward function",
      "Reward and success-rate tracking through a training callback",
      "Interactive Streamlit app with live circuit diagrams",
      "Graded First Class",
    ],
    tags: ["Python", "Qiskit", "Stable Baselines3", "PPO", "Gym", "Streamlit"],
    pdf: { label: "Read the thesis (PDF)", path: "assets/thesis/upanshu-pandey-qrl-thesis.pdf" },
  },
  {
    id: "ai-data",
    title: "RAG Pipeline & Forecasting for Business Central",
    short: "Enterprise data → Qdrant embeddings for a chatbot, plus ML forecasts",
    building: "systems",
    categories: ["AI", "DATA"],
    when: "Voyager Nepal · 2024–2026",
    body: [
      "I built a retrieval-augmented generation (RAG) pipeline that extracted business intelligence from Business Central .app files and stored the embeddings in a Qdrant vector database, giving a chatbot under development access to enterprise data.",
      "For the same enterprise systems, I developed machine learning models in Python to forecast data.",
    ],
    highlights: [
      "Extraction from Business Central .app files",
      "Embeddings stored in Qdrant (vector database)",
      "Python ML forecasting models for the same systems",
    ],
    tags: ["Python", "RAG", "Qdrant", "Business Central"],
  },
  {
    id: "bc-erp",
    title: "Business Central ERP Consulting",
    short: "Customisations, integrations and AMC support for clients",
    building: "systems",
    categories: ["ERP", "API"],
    when: "Agile Solutions & Voyager Nepal · 2022–2026",
    body: [
      "Across both roles I provided technical consultancy on Microsoft Dynamics 365 Business Central and developed customisations to client specifications, in AL and C/AL.",
      "I created and consumed APIs to integrate data between cloud and on-premise environments, sync POS systems to the database, and meet IRD (Inland Revenue Department) requirements.",
      "Under Annual Maintenance Contracts I maintained and configured clients' Business Central and SQL Server instances.",
    ],
    highlights: [
      "Client customisations in AL and C/AL",
      "Cloud ↔ on-premise, POS and IRD integrations",
      "AMC maintenance of Business Central and SQL Server",
    ],
    tags: ["Business Central", "AL", "C/AL", "APIs", "SQL Server"],
  },
  {
    id: "infra",
    title: "Databases & Infrastructure",
    short: "Docker services, SQL Server, triggers, SSL and on-prem servers",
    building: "systems",
    categories: ["INFRA", "DATA"],
    when: "Agile Solutions & Voyager Nepal · 2022–2026",
    body: [
      "At Voyager Nepal I maintained the Docker containers running Qdrant, Redis, ClickHouse and other services.",
      "At Agile Solutions I created and managed databases and database triggers for data security, created and managed SSL certificates, and handled server and network issues on clients' on-premise servers.",
      "The code base lived in GitHub repositories that I managed.",
    ],
    highlights: [
      "Docker containers for Qdrant, Redis and ClickHouse",
      "Databases and triggers for data security",
      "SSL certificates and on-premise server support",
    ],
    tags: ["Docker", "SQL Server", "PL/SQL", "Redis", "ClickHouse", "GitHub", "SSL"],
  },
];

export interface Job {
  org: string;
  when: string;
  roles: { title: string; when: string }[];
  points: string[];
}

export const EXPERIENCE: Job[] = [
  {
    org: "Voyager Nepal",
    when: "Oct 2024 – Jun 2026",
    roles: [{ title: "Technical Consultant", when: "Oct 2024 – Jun 2026" }],
    points: [
      "Developed full-stack applications using C# and React.",
      "Built a RAG pipeline that extracted business intelligence from Business Central .app files and stored embeddings in a Qdrant vector database, giving a chatbot under development access to enterprise data.",
      "Developed machine learning models in Python to forecast data for the same enterprise systems.",
      "Maintained Docker containers running Qdrant, Redis, ClickHouse and other services.",
      "Worked on an application hosted on Azure.",
      "Provided technical consultancy on Business Central ERP to clients and developed customisations to client specifications.",
    ],
  },
  {
    org: "Agile Solutions",
    when: "Aug 2022 – Oct 2024",
    roles: [
      { title: "Jr. Technical Consultant", when: "Jun 2023 – Oct 2024" },
      { title: "Associate Technical Consultant", when: "Dec 2022 – Jun 2023" },
      { title: "Technical Trainee", when: "Aug 2022 – Nov 2022" },
    ],
    points: [
      "Developed customisations on Business Central to client specifications.",
      "Created and consumed APIs for integrating data between cloud and on-premise environments, syncing POS to database, and for IRD requirements.",
      "Created and managed databases and database triggers for data security.",
      "Managed the code base in GitHub repositories.",
      "Provided technical consultancy on Business Central ERP, and maintained and configured Business Central and SQL Server instances under Annual Maintenance Contracts.",
      "Created and managed SSL certificates; managed server and network issues of clients' on-premise servers.",
    ],
  },
];

export const EDUCATION = [
  { title: "BSc Computing (Hons), First Class Honours", org: "The British College, Kathmandu",
    when: "2020 – 2023", note: "Dissertation: Quantum Reinforcement Learning for Quantum Circuit Optimization." },
  { title: "A-Levels", org: "GIHE, Kathmandu", when: "2017 – 2019", note: "" },
];

export const SKILLS: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["C#", "Python", "Java", "PL/SQL", "C/AL", "AL"] },
  { group: "Frontend", items: ["React", "HTML", "CSS"] },
  { group: "Backend & Frameworks", items: ["C#.NET", "Laravel"] },
  { group: "Databases", items: ["SQL Server", "ClickHouse", "Redis", "PostgreSQL", "Qdrant (vector DB)"] },
  { group: "Cloud & DevOps", items: ["Azure", "Docker", "GitHub", "SSL certificate management"] },
  { group: "AI / Machine Learning", items: ["RAG systems", "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", "Qiskit"] },
  { group: "ERP", items: ["Microsoft Dynamics 365 Business Central"] },
];

// ─── Info panels opened from the Lab and House ───
export type PanelId = "about" | "skills" | "education" | "experience" | "contact";
