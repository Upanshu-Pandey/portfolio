// src/content.ts
// ─── All modal content for every trigger point ───

export interface ModalData {
  zone:  string;        // zone label shown as tag
  title: string;
  body:  string;
  tags:  string[];
}

export const MODAL_CONTENT: Record<string, ModalData> = {

  // ── GYM 1 — FRONTEND CITY ────────────────────────────────────

  "building-dotnet-react": {
    zone:  "🏋️ Gym 1 — Frontend City",
    title: "Full-Stack Business Application",
    body: `A production full-stack application developed at Voyager Nepal, combining a modern React frontend with a robust .NET backend.

The application leverages ClickHouse — a high-performance columnar database — for analytics and reporting workloads, enabling fast aggregations over large datasets that traditional OLTP databases struggle with.

The architecture separates the React SPA from the .NET API layer, allowing independent scaling and deployment of each tier. The ClickHouse integration powers real-time dashboards and data-intensive reporting features.`,
    tags: [".NET", "React", "ClickHouse", "REST API", "TypeScript", "C#"],
  },

  "building-quantum": {
    zone:  "🏋️ Gym 1 — Frontend City",
    title: "Quantum Reinforcement Learning — Circuit Optimizer",
    body: `A research-grade web application developed as my university dissertation project, combining quantum computing with reinforcement learning to optimize quantum circuits.

The system uses Proximal Policy Optimization (PPO) — a modern RL algorithm — to learn how to construct minimal quantum circuits that correctly implement the Bernstein-Vazirani algorithm. The agent is trained on a simulated quantum environment built with Qiskit, IBM's open-source quantum computing framework.

The results are visualized in an interactive Streamlit web interface, allowing users to observe how the agent's circuit decisions evolve across training episodes.

This project earned a First Class grade as part of a BSc Computing (Hons) degree.`,
    tags: ["Python", "Qiskit", "Streamlit", "PPO (RL)", "TensorFlow", "NumPy"],
  },

  // ── GYM 2 — SYSTEMS HUB ─────────────────────────────────────

  "building-bc-erp": {
    zone:  "⚡ Gym 2 — Systems Hub",
    title: "Microsoft Business Central ERP — Custom Development",
    body: `Over 2.5 years at Agile Solutions, I worked as a Technical Consultant delivering end-to-end Microsoft Business Central ERP implementations for enterprise clients.

Core work included writing AL and C/AL extensions to customize Business Central workflows, forms, reports, and business logic to match each client's specific operational requirements.

A significant part of the role involved API development — creating and consuming REST APIs to bridge Business Central with external systems including POS terminals, cloud services, and IRD (Nepal's Inland Revenue Department) for tax compliance reporting.

I also maintained Annual Maintenance Contracts (AMC), providing ongoing support, configuration, upgrades, and troubleshooting for live production ERP environments.`,
    tags: ["AL", "C/AL", "Business Central", "REST APIs", "SQL Server", "Git"],
  },

  "building-clickhouse": {
    zone:  "⚡ Gym 2 — Systems Hub",
    title: "ClickHouse — High-Performance Analytics Database",
    body: `At Voyager Nepal, I work extensively with ClickHouse — an open-source columnar OLAP database designed for real-time analytical queries on large datasets.

Unlike row-oriented databases (PostgreSQL, MySQL), ClickHouse stores data in columns, enabling extremely fast aggregations — critical for dashboards, usage reports, and business intelligence workloads where you're scanning millions of rows.

My work includes schema design for analytical tables, writing optimized ClickHouse SQL queries, integrating ClickHouse with the .NET application layer, and building data pipelines that feed reporting systems in near real-time.`,
    tags: ["ClickHouse", "SQL", ".NET", "Data Pipelines", "OLAP"],
  },

  "building-db-infra": {
    zone:  "⚡ Gym 2 — Systems Hub",
    title: "Database Engineering & Server Infrastructure",
    body: `Across multiple client environments at Agile Solutions, I handled the full database and server engineering layer for Business Central deployments.

This included designing and managing SQL Server databases, writing PL/SQL procedures and database triggers for data integrity and security enforcement, and managing SSL certificate provisioning and renewal for client servers.

On the infrastructure side, I managed On-Premise Windows Servers — diagnosing network issues, configuring Business Central and SQL Server instances, and ensuring high availability for production environments running under AMC agreements.

I maintained all client codebases in GitHub, following version control best practices across concurrent client projects.`,
    tags: ["SQL Server", "PL/SQL", "Database Triggers", "SSL", "Windows Server", "GitHub"],
  },

  // ── PROFESSOR'S LAB ─────────────────────────────────────────

  "tech-stack": {
    zone:  "🔬 Professor's Lab",
    title: "Tech Stack",
    body: `ERP & Enterprise
  ● Microsoft Business Central (AL / C-AL)
  ● SQL Server & PL/SQL
  ● REST API Design & Integration

Full-Stack Development
  ● .NET (C#) — Backend
  ● React (TypeScript) — Frontend
  ● Laravel (PHP)

Data & Analytics
  ● ClickHouse OLAP Database
  ● Python (NumPy, Pandas, TensorFlow)
  ● Qiskit (Quantum Computing)

DevOps & Infrastructure
  ● Git & GitHub
  ● SSL Certificate Management
  ● Windows Server (On-Premise)
  ● Cloud ↔ On-Premise Integration`,
    tags: [],
  },

  "education": {
    zone:  "🔬 Professor's Lab",
    title: "Education",
    body: `BSc Computing (Hons) — First Class Honours
The British College, Kathmandu  |  2020 – 2023
Affiliated with Leeds Beckett University, UK.
Dissertation: Quantum Reinforcement Learning for
Quantum Circuit Optimization (Qiskit + PPO).

A-Levels
GIHE, Kathmandu  |  2017 – 2019`,
    tags: ["First Class Honours", "Leeds Beckett University", "The British College"],
  },

  "experience": {
    zone:  "🔬 Professor's Lab",
    title: "Work Experience",
    body: `Technical Consultant
Voyager Nepal  |  Oct 2024 – Present
Full-stack .NET + React development, ClickHouse analytics
engineering, and Business Central consultancy.

Jr. Technical Consultant
Agile Solutions  |  Jun 2023 – Oct 2024

Associate Technical Consultant
Agile Solutions  |  Dec 2022 – Jun 2023

Technical Trainee
Agile Solutions  |  Aug 2022 – Nov 2022

Total professional experience: 3+ years
Focus areas: ERP (Business Central) · APIs · Full-Stack · Data`,
    tags: ["Voyager Nepal", "Agile Solutions", "3+ Years Experience"],
  },
};

// ─── Typewriter dialogue shown when approaching a trigger ───

export const TRIGGER_DIALOGUE: Record<string, string> = {
  "welcome-sign":
    "Welcome, Trainer! I'm Upanshu Pandey —\nan ERP Consultant & Full-Stack Developer\nfrom Kathmandu, Nepal. 🇳🇵\n\nPress SPACE near signs & buildings to interact.\nPress ESC to open the Pokédex for fast travel.",

  "npc-guide":
    "Hey there! Head north for web & full-stack projects,\neast for ERP & backend work,\nor south to the Professor's Lab to learn about me.\n\nOr just press ESC — the Pokédex takes you anywhere!",

  "building-dotnet-react":
    "My most recent build — a full-stack app\nwith React on the frontend, .NET on the backend,\nand ClickHouse powering the analytics layer.",

  "building-quantum":
    "My dissertation project — quantum circuits\noptimized with reinforcement learning.\nQiskit + PPO + Streamlit. Graduated First Class.",

  "building-bc-erp":
    "2.5 years customizing Microsoft Business Central\nfor enterprise clients — AL extensions, REST APIs,\nPOS integrations, and IRD tax compliance.",

  "building-clickhouse":
    "ClickHouse — columnar OLAP for when your queries\nneed to scan millions of rows in milliseconds.\nThis is the analytics engine behind our stack.",

  "building-db-infra":
    "SQL Server, database triggers, SSL certs,\nOn-Premise server management — the unsexy work\nthat keeps production systems alive.",

  "about-sign":
    "Hi! I'm Upanshu Pandey.\n\nI'm a Technical Consultant and Full-Stack Developer\nbased in Kathmandu, Nepal, with 3+ years of experience\nacross ERP systems, backend APIs, and modern web apps.",

  "tech-stack":
    "The bookshelf of skills. From AL and Business Central\nto React, .NET, and ClickHouse. Plus a detour through\nquantum computing. It's been a ride.",

  "education":
    "BSc Computing, First Class Honours.\nThe British College, 2020–2023.\nMy dissertation was on quantum RL —\nnot your average final year project.",

  "experience":
    "3+ years from Trainee to Consultant.\nAgile Solutions shaped my ERP foundations.\nVoyager Nepal is where the full-stack work lives.",

  "resume-download":
    "Want a copy of my CV?\nPress SPACE to download the PDF —\nit has my full work history, skills, and contact details.",
};
