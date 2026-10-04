// src/content.ts
// ─── Single source of truth for everything the portfolio says ───
// Panels, the project list, the résumé and the <noscript> fallback all read from here.
// Source: the CV (public/assets/resume, built from resume/cv.html) and Upanshu's own work repos.
// Keep every claim traceable to those. Clients are described generically, never by name.

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
    "Microsoft Dynamics 365 Business Central, LS Retail and full-stack .NET and React development. " +
    "At Voyager Nepal I was a core developer on Aurora BI, an AI analytics platform for Business Central: " +
    "natural-language queries, a RAG knowledge base on Qdrant, a ClickHouse warehouse and a Python ML service. " +
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
    id: "aurora",
    title: "Aurora BI: AI Analytics for Business Central",
    short: "ERP database in; warehouse, dashboards, plain-English answers and forecasts out",
    building: "systems",
    categories: ["AI", "DATA", "WEB"],
    when: "Voyager Nepal · 2026",
    body: [
      "Aurora BI is a multi-tenant analytics platform for Microsoft Dynamics 365 Business Central and LS Retail. Point it at a client's ERP database and AI reads the schema, designs a ClickHouse warehouse, builds the ETL, generates dashboards and answers questions asked in plain English.",
      "I was a core developer and the top contributor to both the .NET backend and the React/TypeScript frontend. I built the natural-language query engine, which has an LLM write ClickHouse SQL, repairs failed queries automatically and guards against SQL injection, and the RAG knowledge base, which parses Business Central .app files into embeddings in a Qdrant vector database.",
      "I also worked on the Python/FastAPI ML service (Prophet forecasting, Celery training jobs), large-table and Azure Data Lake (bc2adls) ETL, and the SaaS layer: subscription tiers with usage metering, bring-your-own AI keys, KPI targets with red/amber/green status, alert digests and an escalation workflow.",
      "Later I migrated the platform from SQL Server to PostgreSQL and added OpenTelemetry observability, Hangfire background jobs and caching. Before Aurora BI, I built data-source connectors and identity services (authentication, roles, 2FA) in C# and React for the wider Aurora platform.",
    ],
    highlights: [
      "Natural-language → ClickHouse SQL with self-healing retries",
      "RAG over Business Central .app files on Qdrant (batched seeding: ~8,000 → ~80 calls)",
      "Python ML service: Prophet forecasting and Celery training jobs",
      "SaaS features: tiers, usage metering, bring-your-own AI keys, KPIs and escalations",
      "SQL Server → PostgreSQL migration; OpenTelemetry, Hangfire, caching",
    ],
    tags: [".NET", "React", "TypeScript", "Python", "ClickHouse", "Qdrant", "PostgreSQL", "LLMs"],
  },
  {
    id: "bc-erp",
    title: "Business Central ERP Consulting",
    short: "Customisations, integrations, upgrades and AMC support for clients",
    building: "systems",
    categories: ["ERP", "API"],
    when: "Agile Solutions & Voyager Nepal · 2022–2026",
    body: [
      "Across both roles I provided technical consultancy on Microsoft Dynamics 365 Business Central and developed customisations to client specifications, in AL and C/AL.",
      "For a Middle East retail and distribution group I upgraded LS Retail customisations to Business Central 27 / LS Central 27.1 (POS receipt printing, buying management), built an Azure OpenAI chatbot inside Business Central for retail insights, and developed capex limit controls, job card extensions and VAT and contract reports.",
      "At Agile Solutions I built Nepal IRD localisation features such as TDS posting on purchases and sales, and integrated a hospital's Dynamics NAV system with the national health insurance scheme through FHIR APIs (eligibility checks, claim codes and co-payments). I also developed warehouse-management extensions and custom reports for an overseas client.",
      "I created and consumed APIs to integrate data between cloud and on-premise environments and sync POS systems to the database. Under Annual Maintenance Contracts I maintained and configured clients' Business Central and SQL Server instances.",
    ],
    highlights: [
      "LS Retail upgrade to Business Central 27 / LS Central 27.1",
      "Azure OpenAI retail-insights chatbot inside Business Central",
      "Nepal IRD localisation (TDS) and health-insurance FHIR integration",
      "Cloud ↔ on-premise and POS integrations; AMC support",
    ],
    tags: ["Business Central", "LS Retail", "AL", "C/AL", "Azure OpenAI", "FHIR", "SQL Server"],
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
      "Core developer and top contributor on Aurora BI, an AI analytics platform for Business Central and LS Retail (.NET, React/TypeScript, Python): it reads a client's ERP schema, designs a ClickHouse warehouse, builds the ETL and dashboards, and answers plain-English questions.",
      "Built its natural-language query engine (LLM-generated ClickHouse SQL with self-healing retries and SQL-injection guards) and a RAG knowledge base that parses Business Central .app files into Qdrant embeddings.",
      "Developed the Python/FastAPI ML service (Prophet forecasting, Celery training jobs), plus SaaS and reporting features: multi-tenancy, subscription tiers and usage metering, KPI targets, alert digests and escalation workflows.",
      "Migrated the platform from SQL Server to PostgreSQL and added OpenTelemetry observability, Hangfire background jobs and caching; built data-source connectors and identity services (authentication, roles, 2FA).",
      "Upgraded LS Retail customisations to Business Central 27 / LS Central 27.1 for a Middle East retail group, built an Azure OpenAI retail-insights chatbot inside Business Central, and developed capex controls, job card extensions and VAT reports.",
      "Maintained Docker containers running Qdrant, Redis, ClickHouse and other services, and worked on an Azure-hosted application.",
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
      "Developed customisations on Business Central to client specifications, including warehouse-management extensions and custom reports for an overseas client.",
      "Built Nepal IRD localisation features such as TDS posting on purchases and sales, and created and consumed APIs for cloud ↔ on-premise integration and POS-to-database sync.",
      "Integrated a hospital's Dynamics NAV system (C/AL) with the national health insurance scheme through FHIR APIs: eligibility checks, claim codes and co-payments.",
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
  { group: "Languages", items: ["C#", "Python", "TypeScript", "AL", "C/AL", "PL/SQL", "Java"] },
  { group: "Frontend", items: ["React", "TypeScript", "HTML", "CSS"] },
  { group: "Backend & Frameworks", items: [".NET (ASP.NET Core, EF Core)", "FastAPI", "Laravel"] },
  { group: "Databases", items: ["SQL Server", "PostgreSQL", "ClickHouse", "Redis", "Qdrant (vector DB)"] },
  { group: "Cloud & DevOps", items: ["Azure", "Azure DevOps", "Docker", "GitHub", "Hangfire", "OpenTelemetry", "SSL certificate management"] },
  { group: "AI / Machine Learning", items: ["LLM integration (Claude, DeepSeek, Azure OpenAI)", "RAG systems", "Prophet", "Scikit-Learn", "TensorFlow", "Pandas", "NumPy", "Qiskit"] },
  { group: "ERP", items: ["Microsoft Dynamics 365 Business Central", "LS Retail (LS Central)", "Dynamics NAV (C/AL)"] },
];

// ─── Info panels opened from the Lab and House ───
export type PanelId = "about" | "skills" | "education" | "experience" | "contact";
