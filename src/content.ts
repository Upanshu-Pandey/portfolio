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
    "At Voyager Nepal I was a core developer on an AI analytics platform for Business Central: " +
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
    id: "analytics-ui",
    title: "Analytics Platform Front End",
    short: "React/TypeScript dashboards, AI query screens and admin tools",
    building: "web",
    categories: ["WEB", "AI"],
    when: "Voyager Nepal · 2026",
    body: [
      "The web front end of the AI analytics platform for Business Central (its backend lives in Systems Works), built with React, TypeScript, TanStack Query, Tailwind CSS and ECharts.",
      "I built the screens people use every day: interactive dashboards with drill-down charts and per-widget or global date ranges, a KPI scorecard with red/amber/green status, plain-English query results, and machine-learning training and analysis views.",
      "I also built the screens that drive the data pipeline: schema harvesting, automatic table classification, warehouse design, ETL run history and the RAG knowledge-base seeding status.",
      "For administrators there's an admin dashboard with health checks, a seven-tab settings page with super-admin platform settings, an organisation page for divisions and roles with ECharts tree diagrams, and an escalation workflow UI.",
    ],
    highlights: [
      "Dashboards with drill-down charts and date-range controls",
      "KPI scorecard, plain-English query and ML analysis screens",
      "Data-pipeline UI: harvesting, classification, warehouse design, ETL history",
      "Admin dashboard, settings, organisation and escalation pages",
    ],
    tags: ["React", "TypeScript", "TanStack Query", "Tailwind CSS", "ECharts"],
  },
  {
    id: "saas-platform",
    title: "SaaS Platform: Identity, Connectors & Admin",
    short: ".NET identity and data-connector services with a React admin app",
    building: "web",
    categories: ["WEB", "API"],
    when: "Voyager Nepal · 2026",
    body: [
      "Shared platform services behind the analytics product, written in C# on .NET with a command/query (MediatR) structure, FluentValidation and EF Core.",
      "The identity service handles login, authorization, roles and groups, user management and two-factor authentication.",
      "The connector service manages connections to customers' data, with connection pooling, a connector marketplace and schema governance. Its providers cover SQL Server, PostgreSQL, MySQL, MariaDB and Oracle, NoSQL stores (document, graph, key-value, wide-column), cloud storage (Amazon S3, Azure Blob, Google Cloud Storage, MinIO) and streams (Kafka, Azure Event Hubs, Kinesis).",
      "I also built the matching React 19 + TypeScript admin app: roles and permissions, user management, invitations, billing and subscriptions, and the connector marketplace.",
    ],
    highlights: [
      "Identity: login, authorization, roles and groups, 2FA",
      "Connectors for relational, NoSQL, cloud-storage and streaming sources",
      "Connection pooling, marketplace and schema governance",
      "React admin app: roles, users, invitations, billing",
    ],
    tags: ["C#", ".NET", "MediatR", "EF Core", "React", "TypeScript"],
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
    id: "analytics",
    title: "AI Analytics Platform for Business Central",
    short: "ERP database in; warehouse, plain-English answers and forecasts out",
    building: "systems",
    categories: ["AI", "DATA"],
    when: "Voyager Nepal · 2026",
    body: [
      "A multi-tenant analytics platform for Microsoft Dynamics 365 Business Central and LS Retail. Point it at a client's ERP database and AI reads the schema, designs a ClickHouse warehouse, builds the ETL, generates dashboards and answers questions asked in plain English. (Its web front end and platform services are in the Web Workshop.)",
      "I was a core developer on the .NET backend. I built the natural-language query engine, which has an LLM write ClickHouse SQL, repairs failed queries automatically and guards against SQL injection, and the RAG knowledge base, which parses Business Central .app files into embeddings in a Qdrant vector database.",
      "I also worked on the Python/FastAPI ML service (Prophet forecasting, Celery training jobs), large-table and Azure Data Lake (bc2adls) ETL, and the SaaS layer: subscription tiers with usage metering, bring-your-own AI keys, KPI targets with red/amber/green status, alert digests and an escalation workflow.",
      "I hosted it on Azure first, publishing the ASP.NET Core API from Visual Studio to IIS with an Azure SQL database, then moved it to a Docker Compose deployment on a Linux VPS (see Databases & Infrastructure). I also migrated the platform from SQL Server to PostgreSQL and added OpenTelemetry observability, Hangfire background jobs and caching.",
    ],
    highlights: [
      "Natural-language → ClickHouse SQL with self-healing retries",
      "RAG over Business Central .app files on Qdrant (batched seeding: ~8,000 → ~80 calls)",
      "Python ML service: Prophet forecasting and Celery training jobs",
      "SaaS features: tiers, usage metering, bring-your-own AI keys, KPIs and escalations",
      "Hosted on Azure (IIS + Azure SQL), then Docker on a Linux VPS",
      "SQL Server → PostgreSQL migration",
      "OpenTelemetry observability, Hangfire jobs, caching",
    ],
    tags: [".NET", "Python", "ClickHouse", "Qdrant", "PostgreSQL", "Azure", "LLMs"],
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
    short: "Docker VPS deployment, Azure/IIS hosting, SQL Server, SSL and on-prem servers",
    building: "systems",
    categories: ["INFRA", "DATA"],
    when: "Agile Solutions & Voyager Nepal · 2022–2026",
    body: [
      "At Voyager Nepal I deployed the AI analytics platform to an Ubuntu VPS with Docker Compose: the .NET API with the React app baked into its image, the Python ML service, and ClickHouse, SQL Server, Qdrant, Typesense, Redis and Ollama, behind an nginx reverse proxy that terminates TLS.",
      "I wrote the deploy scripts for it. Each one backs up the running container, swaps in the new build, health-checks it and rolls back automatically on failure, and every release is committed as a versioned image so earlier versions stay one command away. I also untangled a dependency conflict that made the ML image unbuildable, by building from a frozen, consistent package set.",
      "Before the VPS, I hosted the platform on Azure: the ASP.NET Core API published from Visual Studio to IIS, with an Azure SQL database.",
      "At Agile Solutions I created and managed databases and database triggers for data security, created and managed SSL certificates, and handled server and network issues on clients' on-premise servers.",
      "The code base lived in GitHub repositories that I managed.",
    ],
    highlights: [
      "Docker Compose VPS deployment behind nginx with TLS",
      "Deploy scripts with backups, health checks and automatic rollback",
      "Azure hosting: ASP.NET Core on IIS with Azure SQL",
      "Databases and triggers for data security",
      "SSL certificates and on-premise server support",
    ],
    tags: ["Docker", "nginx", "Linux", "Azure", "IIS", "SQL Server", "PL/SQL", "GitHub", "SSL"],
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
      "Core developer on an AI analytics platform for Business Central and LS Retail (.NET, React/TypeScript, Python): it reads a client's ERP schema, designs a ClickHouse warehouse, builds the ETL and dashboards, and answers plain-English questions.",
      "Built its natural-language query engine (LLM-generated ClickHouse SQL with self-healing retries and SQL-injection guards) and a RAG knowledge base that parses Business Central .app files into Qdrant embeddings.",
      "Developed the Python/FastAPI ML service (Prophet forecasting, Celery training jobs), plus SaaS and reporting features: multi-tenancy, subscription tiers and usage metering, KPI targets, alert digests and escalation workflows.",
      "Migrated the platform from SQL Server to PostgreSQL and added OpenTelemetry observability, Hangfire background jobs and caching; built its React/TypeScript dashboards and admin screens, plus .NET data-source connectors and identity services (authentication, roles, 2FA).",
      "Upgraded LS Retail customisations to Business Central 27 / LS Central 27.1 for a Middle East retail group, built an Azure OpenAI retail-insights chatbot inside Business Central, and developed capex controls, job card extensions and VAT reports.",
      "Hosted the platform on Azure (ASP.NET Core on IIS, Azure SQL), then deployed it to a Linux VPS with Docker Compose and nginx, writing deploy scripts with health checks and automatic rollback; maintained the containers running Qdrant, Redis, ClickHouse and other services.",
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
  { group: "Cloud & DevOps", items: ["Azure", "IIS", "Docker", "nginx", "Linux", "Azure DevOps", "GitHub", "Hangfire", "OpenTelemetry", "SSL certificate management"] },
  { group: "AI / Machine Learning", items: ["LLM integration (Claude, DeepSeek, Azure OpenAI)", "RAG systems", "Prophet", "Scikit-Learn", "TensorFlow", "Pandas", "NumPy", "Qiskit"] },
  { group: "ERP", items: ["Microsoft Dynamics 365 Business Central", "LS Retail (LS Central)", "Dynamics NAV (C/AL)"] },
];

// ─── Info panels opened from the Lab and House ───
export type PanelId = "about" | "skills" | "education" | "experience" | "contact";
