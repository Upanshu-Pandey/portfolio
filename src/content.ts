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

/** The three project buildings. Each answers a different question, so no write-up repeats another. */
export type BuildingId = "platform" | "consultancy" | "observatory";

export const BUILDINGS: Record<BuildingId, { name: string; intro: string }> = {
  platform: {
    name: "The Platform",
    intro:
      "An AI analytics platform for Microsoft Dynamics 365 Business Central and LS Retail, built at Voyager Nepal. " +
      "Point it at a client's ERP database and AI reads the schema, designs a ClickHouse warehouse, builds the ETL, " +
      "generates dashboards and answers questions asked in plain English. I was a core developer on it. " +
      "Each station is one part of the platform I built or worked on.",
  },
  consultancy: {
    name: "Consultancy Office",
    intro:
      "Across both of my roles I provided technical consultancy on Microsoft Dynamics 365 Business Central " +
      "and developed customisations to client specifications, in AL and C/AL. Each case file is one engagement. " +
      "Clients are kept anonymous.",
  },
  observatory: {
    name: "Observatory",
    intro: "Work from outside the day job: my First Class dissertation and a personal project.",
  },
};

export interface Project {
  id: string;
  title: string;
  short: string;          // one-liner for lists
  building: BuildingId;
  categories: Category[];
  when: string;
  client?: string;        // case files: who the work was for (always generic)
  brief?: string;         // case files: what the client needed
  body: string[];         // paragraphs
  highlights: string[];
  tags: string[];         // also the evidence for SKILLS: a skill links to every project tagged with it
  pdf?: { label: string; path: string };   // supporting document, opened in a new tab
}

export const PROJECTS: Project[] = [
  // ── The Platform: one station per part of the Voyager analytics platform ──
  {
    id: "nl-query",
    title: "Natural-Language Query Engine",
    short: "Plain-English questions in, ClickHouse SQL out, with self-healing retries",
    building: "platform",
    categories: ["AI", "DATA"],
    when: "Voyager Nepal · 2026",
    body: [
      "Users ask the platform questions in plain English and get answers from their ClickHouse warehouse. I built the engine behind that.",
      "An LLM writes the ClickHouse SQL. When a generated query fails, the engine repairs it and retries automatically, and it guards against SQL injection.",
    ],
    highlights: [
      "LLM-generated ClickHouse SQL",
      "Failed queries repaired and retried automatically",
      "SQL-injection guards",
    ],
    tags: [".NET", "ClickHouse", "LLM integration"],
  },
  {
    id: "rag",
    title: "RAG Knowledge Base",
    short: "Business Central .app files parsed into a Qdrant vector database",
    building: "platform",
    categories: ["AI"],
    when: "Voyager Nepal · 2026",
    body: [
      "I built the platform's RAG (retrieval-augmented generation) knowledge base. It parses Business Central .app files into embeddings and stores them in a Qdrant vector database for the AI features to draw on.",
      "Seeding the knowledge base is batched: about 8,000 calls became about 80.",
    ],
    highlights: [
      "Business Central .app files parsed into embeddings",
      "Stored in a Qdrant vector database",
      "Batched seeding: ~8,000 → ~80 calls",
    ],
    tags: [".NET", "Qdrant", "RAG systems", "Business Central"],
  },
  {
    id: "ml-service",
    title: "Forecasting & ML Service",
    short: "Python/FastAPI service with Prophet forecasting and Celery training jobs",
    building: "platform",
    categories: ["AI", "DATA"],
    when: "Voyager Nepal · 2026",
    body: [
      "I worked on the platform's machine-learning service, a separate Python service built with FastAPI. It forecasts with Prophet and runs model training as Celery jobs.",
      "When a dependency conflict made the service's Docker image unbuildable, I untangled it by building from a frozen, consistent package set.",
    ],
    highlights: [
      "Python/FastAPI service",
      "Prophet forecasting",
      "Celery training jobs",
      "Fixed an unbuildable image with a frozen package set",
    ],
    tags: ["Python", "FastAPI", "Prophet", "Celery", "Docker"],
  },
  {
    id: "saas-features",
    title: "Multi-Tenant SaaS & Reporting",
    short: "Subscription tiers, usage metering, bring-your-own AI keys, KPIs and escalations",
    building: "platform",
    categories: ["API", "DATA"],
    when: "Voyager Nepal · 2026",
    body: [
      "The platform is multi-tenant, and I developed its SaaS features: subscription tiers with usage metering, and bring-your-own AI keys.",
      "On the reporting side I built KPI targets with red/amber/green status, alert digests and an escalation workflow.",
    ],
    highlights: [
      "Multi-tenancy",
      "Subscription tiers and usage metering",
      "Bring-your-own AI keys",
      "KPI targets, alert digests and escalations",
    ],
    tags: [".NET"],
  },
  {
    id: "platform-services",
    title: "Identity & Data Connectors",
    short: ".NET identity and data-connector services shared across the product",
    building: "platform",
    categories: ["API"],
    when: "Voyager Nepal · 2026",
    body: [
      "Shared platform services behind the analytics product, written in C# on .NET with a command/query (MediatR) structure, FluentValidation and EF Core.",
      "The identity service handles login, authorization, roles and groups, user management and two-factor authentication.",
      "The connector service manages connections to customers' data, with connection pooling, a connector marketplace and schema governance. Its providers cover SQL Server, PostgreSQL, MySQL, MariaDB and Oracle, NoSQL stores (document, graph, key-value, wide-column), cloud storage (Amazon S3, Azure Blob, Google Cloud Storage, MinIO) and streams (Kafka, Azure Event Hubs, Kinesis).",
    ],
    highlights: [
      "Identity: login, authorization, roles and groups, 2FA",
      "Connectors for relational, NoSQL, cloud-storage and streaming sources",
      "Connection pooling, marketplace and schema governance",
    ],
    tags: ["C#", ".NET", "MediatR", "EF Core"],
  },
  {
    id: "front-end",
    title: "Web Front End & Admin App",
    short: "React/TypeScript dashboards, AI query screens, pipeline UI and admin tools",
    building: "platform",
    categories: ["WEB"],
    when: "Voyager Nepal · 2026",
    body: [
      "The analytics app is built with React, TypeScript, TanStack Query, Tailwind CSS and ECharts. I built the screens people use every day: interactive dashboards with drill-down charts and per-widget or global date ranges, a KPI scorecard with red/amber/green status, plain-English query results, and machine-learning training and analysis views.",
      "I also built the screens that drive the data pipeline: schema harvesting, automatic table classification, warehouse design, ETL run history and the RAG knowledge-base seeding status.",
      "For administrators there's an admin dashboard with health checks, a seven-tab settings page with super-admin platform settings, an organisation page for divisions and roles with ECharts tree diagrams, and an escalation workflow UI.",
      "Separately, I built the React 19 + TypeScript admin app for the platform services: roles and permissions, user management, invitations, billing and subscriptions, and the connector marketplace.",
    ],
    highlights: [
      "Dashboards with drill-down charts and date-range controls",
      "KPI scorecard, plain-English query and ML analysis screens",
      "Data-pipeline UI: harvesting, classification, warehouse design, ETL history",
      "Admin dashboard, settings, organisation and escalation pages",
      "React 19 admin app: roles, users, invitations, billing",
    ],
    tags: ["React", "TypeScript", "TanStack Query", "Tailwind CSS", "ECharts"],
  },
  {
    id: "data-backend",
    title: "ETL, Migration & Observability",
    short: "Large-table and Data Lake ETL, a SQL Server → PostgreSQL move, tracing and jobs",
    building: "platform",
    categories: ["DATA", "INFRA"],
    when: "Voyager Nepal · 2026",
    body: [
      "I worked on the platform's large-table ETL and its Azure Data Lake (bc2adls) ETL.",
      "I migrated the platform from SQL Server to PostgreSQL, and added OpenTelemetry observability, Hangfire background jobs and caching.",
    ],
    highlights: [
      "Large-table and Azure Data Lake (bc2adls) ETL",
      "SQL Server → PostgreSQL migration",
      "OpenTelemetry observability, Hangfire jobs, caching",
    ],
    tags: [".NET", "PostgreSQL", "SQL Server", "Azure", "Hangfire", "OpenTelemetry"],
  },
  {
    id: "deployment",
    title: "Hosting & Deployment",
    short: "Azure/IIS first, then Docker Compose on a Linux VPS with rollback-safe deploys",
    building: "platform",
    categories: ["INFRA"],
    when: "Voyager Nepal · 2026",
    body: [
      "I hosted the platform on Azure first: the ASP.NET Core API published from Visual Studio to IIS, with an Azure SQL database.",
      "I then deployed it to an Ubuntu VPS with Docker Compose: the .NET API with the React app baked into its image, the Python ML service, and ClickHouse, SQL Server, Qdrant, Typesense, Redis and Ollama, behind an nginx reverse proxy that terminates TLS.",
      "I wrote the deploy scripts for it. Each one backs up the running container, swaps in the new build, health-checks it and rolls back automatically on failure, and every release is committed as a versioned image so earlier versions stay one command away.",
    ],
    highlights: [
      "Azure hosting: ASP.NET Core on IIS with Azure SQL",
      "Docker Compose VPS deployment behind nginx with TLS",
      "Deploy scripts with backups, health checks and automatic rollback",
      "Versioned release images",
    ],
    tags: ["Docker", "nginx", "Linux", "Azure", "IIS", "Redis"],
  },

  // ── Consultancy Office: one case file per engagement ──
  {
    id: "retail-group",
    title: "LS Central 27 Upgrade & Retail Chatbot",
    short: "Upgrade, AI chatbot and finance controls for a retail group",
    building: "consultancy",
    categories: ["ERP", "AI"],
    when: "Voyager Nepal",
    client: "A Middle East retail and distribution group",
    brief: "Bring the group's LS Retail customisations onto Business Central 27 / LS Central 27.1, and extend the system.",
    body: [
      "I upgraded the group's LS Retail customisations to Business Central 27 / LS Central 27.1, including POS receipt printing and buying management.",
      "Inside Business Central I built an Azure OpenAI chatbot for retail insights.",
      "I also developed capex limit controls, job card extensions, and VAT and contract reports.",
    ],
    highlights: [
      "LS Retail upgrade to Business Central 27 / LS Central 27.1",
      "Azure OpenAI retail-insights chatbot inside Business Central",
      "Capex limit controls, job card extensions, VAT and contract reports",
    ],
    tags: ["Business Central", "LS Retail", "AL", "Azure OpenAI", "LLM integration"],
  },
  {
    id: "health-insurance",
    title: "Health Insurance Integration",
    short: "A hospital's Dynamics NAV system connected to the national scheme over FHIR",
    building: "consultancy",
    categories: ["ERP", "API"],
    when: "Agile Solutions",
    client: "A hospital running Dynamics NAV",
    brief: "Connect the hospital's Dynamics NAV system to the national health insurance scheme.",
    body: [
      "I integrated the hospital's Dynamics NAV system with the national health insurance scheme through FHIR APIs, writing the NAV side in C/AL.",
      "The integration covers eligibility checks, claim codes and co-payments.",
    ],
    highlights: [
      "FHIR API integration with the national health insurance scheme",
      "Eligibility checks, claim codes and co-payments",
    ],
    tags: ["Dynamics NAV", "C/AL", "FHIR"],
  },
  {
    id: "ird-localisation",
    title: "Nepal IRD Localisation",
    short: "TDS posting on purchases and sales in Business Central",
    building: "consultancy",
    categories: ["ERP"],
    when: "Agile Solutions",
    client: "Business Central users in Nepal",
    brief: "Localise Business Central for Nepal's Inland Revenue Department (IRD).",
    body: [
      "I built Nepal IRD localisation features for Business Central, such as TDS (tax deducted at source) posting on purchases and sales.",
    ],
    highlights: ["TDS posting on purchases and sales"],
    tags: ["Business Central", "AL"],
  },
  {
    id: "warehouse-ext",
    title: "Warehouse Extensions & Reports",
    short: "Warehouse-management extensions and custom reports for an overseas client",
    building: "consultancy",
    categories: ["ERP"],
    when: "Agile Solutions",
    client: "An overseas client",
    brief: "Extend Business Central's warehouse management and reporting to the client's specifications.",
    body: [
      "I developed warehouse-management extensions and custom reports on Business Central to the client's specifications.",
    ],
    highlights: ["Warehouse-management extensions", "Custom reports"],
    tags: ["Business Central", "AL"],
  },
  {
    id: "integrations",
    title: "Cloud, On-Premise & POS Integrations",
    short: "APIs linking cloud and on-premise environments, and POS-to-database sync",
    building: "consultancy",
    categories: ["ERP", "API"],
    when: "Agile Solutions",
    client: "Business Central clients",
    brief: "Keep data moving between cloud and on-premise environments, and from point-of-sale systems.",
    body: [
      "I created and consumed APIs to integrate data between cloud and on-premise environments, and to sync POS systems to the database.",
    ],
    highlights: ["Cloud ↔ on-premise data integration", "POS-to-database sync"],
    tags: ["Business Central", "AL"],
  },
  {
    id: "amc-support",
    title: "Maintenance Contracts & Servers",
    short: "Business Central and SQL Server upkeep, database triggers, SSL and on-prem servers",
    building: "consultancy",
    categories: ["ERP", "INFRA"],
    when: "Agile Solutions",
    client: "Clients on Annual Maintenance Contracts",
    brief: "Keep clients' Business Central systems, databases and servers healthy.",
    body: [
      "Under Annual Maintenance Contracts I maintained and configured clients' Business Central and SQL Server instances.",
      "I created and managed databases and database triggers for data security, created and managed SSL certificates, and handled server and network issues on clients' on-premise servers.",
    ],
    highlights: [
      "Business Central and SQL Server maintenance and configuration",
      "Databases and triggers for data security",
      "SSL certificates and on-premise server support",
    ],
    tags: ["Business Central", "SQL Server", "PL/SQL", "SSL certificate management"],
  },

  // ── Observatory: academic and personal work ──
  {
    id: "quantum",
    title: "Quantum RL Circuit Optimizer",
    short: "PPO agent that learns circuits matching a hidden bit string",
    building: "observatory",
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
  },  {
    id: "ecommerce",
    title: "E-Commerce Website",
    short: "Laravel store with search, cart, checkout and payments",
    building: "observatory",
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
  },];

/** Projects tagged with a skill. "Qdrant (vector DB)" matches the tag "Qdrant"; "Microsoft Dynamics 365 Business Central" matches "Business Central". */
export function projectsUsing(skill: string): Project[] {
  const key = skill.replace(/\s*\(.*\)$/, "");
  return PROJECTS.filter((p) => p.tags.some((t) => t === key || key.endsWith(` ${t}`)));
}

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

// ─── Info panels opened from the Town Hall and House ───
export type PanelId = "about" | "skills" | "education" | "experience" | "contact";
