import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, ChevronDown, ChevronRight, CheckCircle2,
  BookOpen, Play, FlaskConical, FileQuestion, Clock, Trophy,
  Flame, Target, TrendingUp, Cloud, Zap, RotateCcw, ExternalLink,
} from 'lucide-react'

// ─── Curriculum Data ────────────────────────────────────────────────────────

const TASK_TYPES = {
  read:     { label: 'Read',     icon: BookOpen,    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  watch:    { label: 'Watch',    icon: Play,         color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  lab:      { label: 'Lab',      icon: FlaskConical, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  quiz:     { label: 'Quiz',     icon: FileQuestion, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  practice: { label: 'Practice', icon: Zap,          color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
}

const makeTask = (id, title, type, mins, link) => ({ id, title, type, mins, link })

const CURRICULUM = {
  gcp: [
    {
      week: 1, title: 'Cloud & GCP Fundamentals',
      icon: '☁️', color: 'from-sky-500 to-blue-600',
      days: [
        { day: 1, title: 'What is Cloud Computing?', tasks: [
          makeTask('g-1-1-1', 'Cloud computing concepts: IaaS, PaaS, SaaS', 'read', 30, 'https://cloud.google.com/learn/what-is-cloud-computing'),
          makeTask('g-1-1-2', 'Why choose GCP? Key differentiators', 'watch', 20),
          makeTask('g-1-1-3', 'GCP Global Infrastructure: Regions & Zones', 'read', 25),
          makeTask('g-1-1-4', 'Create a free GCP account', 'lab', 15),
        ]},
        { day: 2, title: 'GCP Console & Projects', tasks: [
          makeTask('g-1-2-1', 'Tour the GCP Console UI', 'watch', 20),
          makeTask('g-1-2-2', 'Projects, Folders & Organizations', 'read', 20),
          makeTask('g-1-2-3', 'Create your first GCP Project', 'lab', 15),
          makeTask('g-1-2-4', 'Enable APIs in your project', 'lab', 10),
        ]},
        { day: 3, title: 'IAM — Identity & Access Management', tasks: [
          makeTask('g-1-3-1', 'IAM concepts: Users, Groups, Service Accounts', 'read', 30, 'https://cloud.google.com/iam/docs/overview'),
          makeTask('g-1-3-2', 'Predefined vs Custom Roles', 'read', 20),
          makeTask('g-1-3-3', 'Assign roles to a user in Console', 'lab', 20),
          makeTask('g-1-3-4', 'IAM Policy bindings explained', 'watch', 15),
        ]},
        { day: 4, title: 'Billing & Cost Management', tasks: [
          makeTask('g-1-4-1', 'GCP Pricing model & Free Tier', 'read', 20),
          makeTask('g-1-4-2', 'Set up billing alerts & budgets', 'lab', 20),
          makeTask('g-1-4-3', 'Use the GCP Pricing Calculator', 'practice', 25, 'https://cloud.google.com/products/calculator'),
          makeTask('g-1-4-4', 'Cost optimization best practices', 'read', 15),
        ]},
        { day: 5, title: 'Cloud SDK & gcloud CLI', tasks: [
          makeTask('g-1-5-1', 'Install Google Cloud SDK', 'lab', 20, 'https://cloud.google.com/sdk/docs/install'),
          makeTask('g-1-5-2', 'gcloud init & auth login', 'lab', 15),
          makeTask('g-1-5-3', 'Essential gcloud commands', 'practice', 30),
          makeTask('g-1-5-4', 'Cloud Shell overview', 'watch', 15),
        ]},
        { day: 6, title: 'Hands-on: First Deployment', tasks: [
          makeTask('g-1-6-1', 'Deploy a simple web app to App Engine', 'lab', 45),
          makeTask('g-1-6-2', 'View logs in Cloud Console', 'lab', 15),
          makeTask('g-1-6-3', 'Delete resources & avoid billing', 'lab', 10),
        ]},
        { day: 7, title: 'Week 1 Review & Quiz', tasks: [
          makeTask('g-1-7-1', 'Flashcards: Cloud & IAM terminology', 'practice', 20),
          makeTask('g-1-7-2', 'Week 1 Quiz (10 questions)', 'quiz', 20),
          makeTask('g-1-7-3', 'Explore: GCP Learning Path on Coursera', 'read', 15, 'https://www.coursera.org/google-cloud'),
        ]},
      ],
    },
    {
      week: 2, title: 'Compute Services',
      icon: '🖥️', color: 'from-brand-500 to-violet-600',
      days: [
        { day: 1, title: 'Compute Engine (VMs)', tasks: [
          makeTask('g-2-1-1', 'Compute Engine overview & use cases', 'read', 25, 'https://cloud.google.com/compute/docs/overview'),
          makeTask('g-2-1-2', 'Machine families: General, Compute, Memory', 'read', 20),
          makeTask('g-2-1-3', 'Create a VM instance via Console', 'lab', 25),
          makeTask('g-2-1-4', 'SSH into your VM', 'lab', 15),
        ]},
        { day: 2, title: 'Managed Instance Groups & Autoscaling', tasks: [
          makeTask('g-2-2-1', 'Instance Templates & MIGs', 'read', 25),
          makeTask('g-2-2-2', 'Autoscaling policies explained', 'watch', 20),
          makeTask('g-2-2-3', 'Create a Managed Instance Group', 'lab', 30),
          makeTask('g-2-2-4', 'Preemptible & Spot VMs for cost savings', 'read', 15),
        ]},
        { day: 3, title: 'App Engine (PaaS)', tasks: [
          makeTask('g-2-3-1', 'App Engine Standard vs Flexible', 'read', 20, 'https://cloud.google.com/appengine/docs'),
          makeTask('g-2-3-2', 'Deploy a Python/Node app to App Engine', 'lab', 40),
          makeTask('g-2-3-3', 'Versioning & traffic splitting', 'watch', 20),
        ]},
        { day: 4, title: 'Cloud Run (Serverless Containers)', tasks: [
          makeTask('g-2-4-1', 'Cloud Run architecture & benefits', 'read', 20, 'https://cloud.google.com/run/docs'),
          makeTask('g-2-4-2', 'Containerize an app with Docker', 'lab', 30),
          makeTask('g-2-4-3', 'Deploy container to Cloud Run', 'lab', 25),
          makeTask('g-2-4-4', 'Cloud Run vs App Engine vs Functions', 'read', 15),
        ]},
        { day: 5, title: 'Cloud Functions (Serverless)', tasks: [
          makeTask('g-2-5-1', 'Cloud Functions 1st vs 2nd gen', 'read', 20),
          makeTask('g-2-5-2', 'Write and deploy a HTTP function', 'lab', 30),
          makeTask('g-2-5-3', 'Event-driven functions with Pub/Sub', 'lab', 25),
          makeTask('g-2-5-4', 'Cold starts & concurrency', 'watch', 15),
        ]},
        { day: 6, title: 'GKE — Google Kubernetes Engine', tasks: [
          makeTask('g-2-6-1', 'Kubernetes basics: Pods, Services, Deployments', 'read', 35),
          makeTask('g-2-6-2', 'Create a GKE cluster', 'lab', 30),
          makeTask('g-2-6-3', 'Deploy an app to GKE', 'lab', 30),
          makeTask('g-2-6-4', 'Autopilot vs Standard GKE', 'read', 15),
        ]},
        { day: 7, title: 'Week 2 Review & Quiz', tasks: [
          makeTask('g-2-7-1', 'Comparison: VM vs Container vs Serverless', 'practice', 20),
          makeTask('g-2-7-2', 'Week 2 Quiz (12 questions)', 'quiz', 25),
          makeTask('g-2-7-3', 'Qwiklabs: Compute Engine Basics', 'lab', 45, 'https://www.cloudskillsboost.google'),
        ]},
      ],
    },
    {
      week: 3, title: 'Storage & Databases',
      icon: '🗄️', color: 'from-emerald-500 to-teal-600',
      days: [
        { day: 1, title: 'Cloud Storage (Object Storage)', tasks: [
          makeTask('g-3-1-1', 'Cloud Storage classes: Standard, Nearline, Coldline, Archive', 'read', 25, 'https://cloud.google.com/storage/docs'),
          makeTask('g-3-1-2', 'Create a bucket & upload files', 'lab', 20),
          makeTask('g-3-1-3', 'Lifecycle policies & versioning', 'lab', 20),
          makeTask('g-3-1-4', 'Access control: IAM vs ACLs', 'read', 15),
        ]},
        { day: 2, title: 'Cloud SQL (Relational Database)', tasks: [
          makeTask('g-3-2-1', 'Cloud SQL: MySQL, PostgreSQL, SQL Server', 'read', 20),
          makeTask('g-3-2-2', 'Create a Cloud SQL instance', 'lab', 30),
          makeTask('g-3-2-3', 'Connect from app & run queries', 'lab', 25),
          makeTask('g-3-2-4', 'HA, backups & read replicas', 'read', 15),
        ]},
        { day: 3, title: 'Cloud Spanner & Firestore', tasks: [
          makeTask('g-3-3-1', 'Cloud Spanner: globally distributed SQL', 'read', 25),
          makeTask('g-3-3-2', 'Firestore (NoSQL) data model', 'read', 20, 'https://cloud.google.com/firestore/docs'),
          makeTask('g-3-3-3', 'Create Firestore database & add documents', 'lab', 30),
          makeTask('g-3-3-4', 'Real-time listeners in Firestore', 'watch', 20),
        ]},
        { day: 4, title: 'BigQuery (Data Warehouse)', tasks: [
          makeTask('g-3-4-1', 'BigQuery architecture & columnar storage', 'read', 25, 'https://cloud.google.com/bigquery/docs'),
          makeTask('g-3-4-2', 'Run SQL queries in BigQuery Console', 'lab', 30),
          makeTask('g-3-4-3', 'BigQuery pricing: on-demand vs flat-rate', 'read', 15),
          makeTask('g-3-4-4', 'Load CSV/JSON data into BigQuery', 'lab', 20),
        ]},
        { day: 5, title: 'Bigtable & Memorystore', tasks: [
          makeTask('g-3-5-1', 'Cloud Bigtable: wide-column NoSQL', 'read', 20),
          makeTask('g-3-5-2', 'Use cases: IoT, time series, analytics', 'watch', 20),
          makeTask('g-3-5-3', 'Memorystore (Redis/Memcached) setup', 'lab', 25),
          makeTask('g-3-5-4', 'Choosing the right GCP database', 'read', 20),
        ]},
        { day: 6, title: 'Hands-on: Full Stack App with DB', tasks: [
          makeTask('g-3-6-1', 'Build API connecting to Cloud SQL', 'lab', 50),
          makeTask('g-3-6-2', 'Secure DB with private IP & VPC', 'lab', 20),
          makeTask('g-3-6-3', 'Export & import database', 'practice', 15),
        ]},
        { day: 7, title: 'Week 3 Review & Quiz', tasks: [
          makeTask('g-3-7-1', 'Storage decision chart practice', 'practice', 20),
          makeTask('g-3-7-2', 'Week 3 Quiz (12 questions)', 'quiz', 25),
        ]},
      ],
    },
    {
      week: 4, title: 'Networking',
      icon: '🌐', color: 'from-amber-500 to-orange-600',
      days: [
        { day: 1, title: 'VPC & Subnets', tasks: [
          makeTask('g-4-1-1', 'VPC Networks: auto vs custom mode', 'read', 25, 'https://cloud.google.com/vpc/docs'),
          makeTask('g-4-1-2', 'Create a custom VPC with subnets', 'lab', 30),
          makeTask('g-4-1-3', 'Firewall rules: ingress & egress', 'lab', 20),
          makeTask('g-4-1-4', 'IP addressing: internal vs external', 'read', 15),
        ]},
        { day: 2, title: 'Load Balancers', tasks: [
          makeTask('g-4-2-1', 'GCP Load Balancer types overview', 'read', 25),
          makeTask('g-4-2-2', 'HTTP(S) Load Balancer setup', 'lab', 35),
          makeTask('g-4-2-3', 'Health checks & backend services', 'lab', 20),
          makeTask('g-4-2-4', 'Global vs Regional LB', 'watch', 15),
        ]},
        { day: 3, title: 'Cloud DNS & Cloud CDN', tasks: [
          makeTask('g-4-3-1', 'Configure Cloud DNS zones & records', 'lab', 25),
          makeTask('g-4-3-2', 'Enable Cloud CDN on Load Balancer', 'lab', 20),
          makeTask('g-4-3-3', 'Cache policies & invalidation', 'read', 15),
        ]},
        { day: 4, title: 'VPN & Interconnect', tasks: [
          makeTask('g-4-4-1', 'Cloud VPN: HA VPN setup', 'read', 25),
          makeTask('g-4-4-2', 'Cloud Interconnect vs Direct Peering', 'read', 20),
          makeTask('g-4-4-3', 'VPC Peering & Shared VPC', 'lab', 25),
        ]},
        { day: 5, title: 'Cloud Armor & Network Security', tasks: [
          makeTask('g-4-5-1', 'Cloud Armor WAF rules & DDoS protection', 'read', 25),
          makeTask('g-4-5-2', 'Configure security policies', 'lab', 25),
          makeTask('g-4-5-3', 'Private Google Access explained', 'read', 15),
        ]},
        { day: 6, title: 'Hands-on: Secure VPC Architecture', tasks: [
          makeTask('g-4-6-1', 'Build 3-tier VPC (web/app/db subnets)', 'lab', 50),
          makeTask('g-4-6-2', 'Apply firewall rules per tier', 'lab', 20),
          makeTask('g-4-6-3', 'Test connectivity between tiers', 'practice', 20),
        ]},
        { day: 7, title: 'Week 4 Review & Quiz', tasks: [
          makeTask('g-4-7-1', 'Networking scenario questions', 'practice', 25),
          makeTask('g-4-7-2', 'Week 4 Quiz (10 questions)', 'quiz', 20),
        ]},
      ],
    },
    {
      week: 5, title: 'DevOps & CI/CD on GCP',
      icon: '⚙️', color: 'from-rose-500 to-pink-600',
      days: [
        { day: 1, title: 'Cloud Build (CI)', tasks: [
          makeTask('g-5-1-1', 'Cloud Build concepts & cloudbuild.yaml', 'read', 25, 'https://cloud.google.com/build/docs'),
          makeTask('g-5-1-2', 'Build a Docker image with Cloud Build', 'lab', 30),
          makeTask('g-5-1-3', 'Triggers: push to branch / PR', 'lab', 25),
        ]},
        { day: 2, title: 'Artifact Registry & Container Registry', tasks: [
          makeTask('g-5-2-1', 'Artifact Registry vs Container Registry', 'read', 20),
          makeTask('g-5-2-2', 'Push/pull Docker images to Artifact Registry', 'lab', 25),
          makeTask('g-5-2-3', 'Vulnerability scanning for images', 'read', 15),
        ]},
        { day: 3, title: 'Cloud Deploy (CD)', tasks: [
          makeTask('g-5-3-1', 'Cloud Deploy pipelines: targets & releases', 'read', 25),
          makeTask('g-5-3-2', 'Deploy to GKE with Cloud Deploy', 'lab', 35),
          makeTask('g-5-3-3', 'Canary deployments & rollbacks', 'watch', 20),
        ]},
        { day: 4, title: 'Terraform on GCP', tasks: [
          makeTask('g-5-4-1', 'Infrastructure as Code with Terraform', 'read', 25, 'https://registry.terraform.io/providers/hashicorp/google'),
          makeTask('g-5-4-2', 'Write Terraform for GCP VMs & Storage', 'lab', 40),
          makeTask('g-5-4-3', 'terraform init, plan, apply, destroy', 'practice', 25),
          makeTask('g-5-4-4', 'State files & remote backends (GCS)', 'read', 15),
        ]},
        { day: 5, title: 'Cloud Monitoring & Logging', tasks: [
          makeTask('g-5-5-1', 'Cloud Monitoring dashboards & alerts', 'lab', 30, 'https://cloud.google.com/monitoring'),
          makeTask('g-5-5-2', 'Cloud Logging: log-based metrics', 'lab', 25),
          makeTask('g-5-5-3', 'Error Reporting & Cloud Trace', 'watch', 20),
        ]},
        { day: 6, title: 'Hands-on: Full CI/CD Pipeline', tasks: [
          makeTask('g-5-6-1', 'Source → Cloud Build → Artifact Registry → Cloud Run pipeline', 'lab', 60),
          makeTask('g-5-6-2', 'Add monitoring & alerts to deployed app', 'lab', 20),
        ]},
        { day: 7, title: 'Week 5 Review & Quiz', tasks: [
          makeTask('g-5-7-1', 'DevOps scenario practice', 'practice', 25),
          makeTask('g-5-7-2', 'Week 5 Quiz (10 questions)', 'quiz', 20),
        ]},
      ],
    },
    {
      week: 6, title: 'Security & IAM Advanced',
      icon: '🔒', color: 'from-slate-500 to-slate-700',
      days: [
        { day: 1, title: 'IAM Best Practices', tasks: [
          makeTask('g-6-1-1', 'Principle of least privilege on GCP', 'read', 20),
          makeTask('g-6-1-2', 'Service accounts: creation & key management', 'lab', 25),
          makeTask('g-6-1-3', 'Workload Identity Federation', 'read', 20),
        ]},
        { day: 2, title: 'Secret Manager & KMS', tasks: [
          makeTask('g-6-2-1', 'Store secrets in Secret Manager', 'lab', 25, 'https://cloud.google.com/secret-manager'),
          makeTask('g-6-2-2', 'Cloud KMS: encryption keys & key rings', 'read', 25),
          makeTask('g-6-2-3', 'CMEK (Customer Managed Encryption Keys)', 'lab', 20),
        ]},
        { day: 3, title: 'Security Command Center', tasks: [
          makeTask('g-6-3-1', 'SCC findings, assets & threats', 'read', 25),
          makeTask('g-6-3-2', 'Enable & configure Security Command Center', 'lab', 20),
          makeTask('g-6-3-3', 'Threat detection with Event Threat Detection', 'watch', 20),
        ]},
        { day: 4, title: 'VPC Service Controls', tasks: [
          makeTask('g-6-4-1', 'VPC Service Controls & Access Policies', 'read', 25),
          makeTask('g-6-4-2', 'Create a service perimeter', 'lab', 25),
          makeTask('g-6-4-3', 'Data exfiltration prevention', 'watch', 15),
        ]},
        { day: 5, title: 'Compliance & Audit', tasks: [
          makeTask('g-6-5-1', 'Cloud Audit Logs: admin, data, system', 'read', 20),
          makeTask('g-6-5-2', 'Compliance reports: HIPAA, SOC, ISO', 'read', 20),
          makeTask('g-6-5-3', 'Organization policies', 'lab', 25),
        ]},
        { day: 6, title: 'Hands-on: Secure Architecture Review', tasks: [
          makeTask('g-6-6-1', 'Audit existing GCP project for security issues', 'practice', 40),
          makeTask('g-6-6-2', 'Implement security hardening checklist', 'lab', 30),
        ]},
        { day: 7, title: 'Week 6 Review & Quiz', tasks: [
          makeTask('g-6-7-1', 'Security scenario questions', 'practice', 25),
          makeTask('g-6-7-2', 'Week 6 Quiz (10 questions)', 'quiz', 20),
        ]},
      ],
    },
    {
      week: 7, title: 'Data & AI Services',
      icon: '🤖', color: 'from-teal-500 to-cyan-600',
      days: [
        { day: 1, title: 'Pub/Sub (Messaging)', tasks: [
          makeTask('g-7-1-1', 'Pub/Sub architecture: topics & subscriptions', 'read', 25, 'https://cloud.google.com/pubsub/docs'),
          makeTask('g-7-1-2', 'Publish & consume messages with gcloud', 'lab', 30),
          makeTask('g-7-1-3', 'Push vs Pull subscriptions', 'watch', 15),
        ]},
        { day: 2, title: 'Dataflow (Stream & Batch)', tasks: [
          makeTask('g-7-2-1', 'Apache Beam & Dataflow concepts', 'read', 25),
          makeTask('g-7-2-2', 'Run a Dataflow template job', 'lab', 30),
          makeTask('g-7-2-3', 'Streaming pipeline: Pub/Sub → Dataflow → BigQuery', 'watch', 25),
        ]},
        { day: 3, title: 'Vertex AI', tasks: [
          makeTask('g-7-3-1', 'Vertex AI platform overview', 'read', 25, 'https://cloud.google.com/vertex-ai'),
          makeTask('g-7-3-2', 'AutoML: train a model without code', 'lab', 40),
          makeTask('g-7-3-3', 'Vertex AI Workbench (Jupyter)', 'lab', 20),
        ]},
        { day: 4, title: 'Pre-built AI APIs', tasks: [
          makeTask('g-7-4-1', 'Vision API, Natural Language API, Speech-to-Text', 'read', 20),
          makeTask('g-7-4-2', 'Call Vision API to analyze an image', 'lab', 25),
          makeTask('g-7-4-3', 'Translation API & Document AI', 'watch', 20),
        ]},
        { day: 5, title: 'Looker & Data Studio', tasks: [
          makeTask('g-7-5-1', 'BigQuery + Looker Studio (Data Studio)', 'lab', 30, 'https://lookerstudio.google.com'),
          makeTask('g-7-5-2', 'Build a dashboard from BigQuery data', 'lab', 35),
          makeTask('g-7-5-3', 'Scheduled queries & data exports', 'practice', 15),
        ]},
        { day: 6, title: 'Hands-on: ML Pipeline', tasks: [
          makeTask('g-7-6-1', 'End-to-end: Pub/Sub → Dataflow → BQ → Looker', 'lab', 60),
          makeTask('g-7-6-2', 'Train AutoML image classification model', 'lab', 40),
        ]},
        { day: 7, title: 'Week 7 Review & Quiz', tasks: [
          makeTask('g-7-7-1', 'Data & AI service selection practice', 'practice', 20),
          makeTask('g-7-7-2', 'Week 7 Quiz (10 questions)', 'quiz', 20),
        ]},
      ],
    },
    {
      week: 8, title: 'ACE Certification Prep',
      icon: '🏆', color: 'from-yellow-500 to-amber-500',
      days: [
        { day: 1, title: 'Exam Overview & Study Strategy', tasks: [
          makeTask('g-8-1-1', 'ACE exam guide & domains', 'read', 25, 'https://cloud.google.com/certification/cloud-engineer'),
          makeTask('g-8-1-2', 'Register for Google Cloud certification', 'practice', 10),
          makeTask('g-8-1-3', 'Set up Anki flashcards for GCP services', 'practice', 30),
        ]},
        { day: 2, title: 'Practice: Compute & Storage', tasks: [
          makeTask('g-8-2-1', '20 practice questions: Compute Engine, GKE, Cloud Run', 'quiz', 30),
          makeTask('g-8-2-2', '20 practice questions: Storage, SQL, BigQuery', 'quiz', 30),
          makeTask('g-8-2-3', 'Review weak areas from practice', 'read', 20),
        ]},
        { day: 3, title: 'Practice: Networking & Security', tasks: [
          makeTask('g-8-3-1', '20 practice questions: VPC, Load Balancers, DNS', 'quiz', 30),
          makeTask('g-8-3-2', '20 practice questions: IAM, Security, KMS', 'quiz', 30),
          makeTask('g-8-3-3', 'Review networking diagrams', 'practice', 20),
        ]},
        { day: 4, title: 'Practice: DevOps & Operations', tasks: [
          makeTask('g-8-4-1', '20 practice questions: Cloud Build, Deploy, Terraform', 'quiz', 30),
          makeTask('g-8-4-2', '20 practice questions: Monitoring, Logging, Ops', 'quiz', 30),
          makeTask('g-8-4-3', 'Hands-on: troubleshoot a broken deployment', 'lab', 30),
        ]},
        { day: 5, title: 'Full Mock Exam #1', tasks: [
          makeTask('g-8-5-1', '50-question timed mock exam (90 min)', 'quiz', 90, 'https://www.whizlabs.com/google-cloud-certified-associate-cloud-engineer/'),
          makeTask('g-8-5-2', 'Review every wrong answer in detail', 'practice', 45),
        ]},
        { day: 6, title: 'Full Mock Exam #2 & Final Review', tasks: [
          makeTask('g-8-6-1', '50-question timed mock exam #2', 'quiz', 90),
          makeTask('g-8-6-2', 'Final weak-area review', 'read', 30),
          makeTask('g-8-6-3', 'Speed run: 100 service definitions in 20 min', 'practice', 20),
        ]},
        { day: 7, title: 'Exam Day Prep', tasks: [
          makeTask('g-8-7-1', 'Light review: skim all flashcards', 'practice', 30),
          makeTask('g-8-7-2', 'Verify exam appointment & logistics', 'practice', 10),
          makeTask('g-8-7-3', 'Rest well — you are ready!', 'read', 5),
        ]},
      ],
    },
  ],

  aws: [
    {
      week: 1, title: 'AWS Fundamentals',
      icon: '☁️', color: 'from-orange-500 to-amber-600',
      days: [
        { day: 1, title: 'AWS Global Infrastructure', tasks: [
          makeTask('a-1-1-1', 'Regions, Availability Zones & Edge Locations', 'read', 25, 'https://aws.amazon.com/about-aws/global-infrastructure/'),
          makeTask('a-1-1-2', 'AWS Shared Responsibility Model', 'read', 20),
          makeTask('a-1-1-3', 'Create a free AWS account', 'lab', 15, 'https://aws.amazon.com/free/'),
          makeTask('a-1-1-4', 'Tour AWS Management Console', 'watch', 20),
        ]},
        { day: 2, title: 'IAM — Identity & Access Management', tasks: [
          makeTask('a-1-2-1', 'IAM Users, Groups, Roles & Policies', 'read', 30, 'https://docs.aws.amazon.com/iam/'),
          makeTask('a-1-2-2', 'Create IAM user with least privilege', 'lab', 25),
          makeTask('a-1-2-3', 'Inline vs Managed vs Customer policies', 'read', 20),
          makeTask('a-1-2-4', 'Enable MFA on root & IAM accounts', 'lab', 15),
        ]},
        { day: 3, title: 'AWS CLI & SDKs', tasks: [
          makeTask('a-1-3-1', 'Install & configure AWS CLI', 'lab', 20, 'https://docs.aws.amazon.com/cli/'),
          makeTask('a-1-3-2', 'aws configure: access keys & regions', 'lab', 15),
          makeTask('a-1-3-3', 'Essential CLI commands (s3, ec2, iam)', 'practice', 30),
          makeTask('a-1-3-4', 'AWS CloudShell overview', 'watch', 10),
        ]},
        { day: 4, title: 'Billing & Cost Management', tasks: [
          makeTask('a-1-4-1', 'AWS Pricing models: On-Demand, Reserved, Spot', 'read', 25),
          makeTask('a-1-4-2', 'Set billing alerts & AWS Budgets', 'lab', 20),
          makeTask('a-1-4-3', 'AWS Cost Explorer & Cost Allocation Tags', 'lab', 20),
          makeTask('a-1-4-4', 'AWS Pricing Calculator', 'practice', 15, 'https://calculator.aws/'),
        ]},
        { day: 5, title: 'AWS Support & Well-Architected', tasks: [
          makeTask('a-1-5-1', 'AWS Well-Architected Framework (6 pillars)', 'read', 30, 'https://docs.aws.amazon.com/wellarchitected/'),
          makeTask('a-1-5-2', 'AWS Support plans overview', 'read', 15),
          makeTask('a-1-5-3', 'Trusted Advisor categories', 'watch', 20),
        ]},
        { day: 6, title: 'First Hands-on Lab', tasks: [
          makeTask('a-1-6-1', 'Launch an EC2 instance & connect via SSH', 'lab', 40),
          makeTask('a-1-6-2', 'Create an S3 bucket & host static website', 'lab', 30),
          makeTask('a-1-6-3', 'Terminate all resources to avoid charges', 'lab', 10),
        ]},
        { day: 7, title: 'Week 1 Review & Quiz', tasks: [
          makeTask('a-1-7-1', 'AWS fundamentals flashcards', 'practice', 20),
          makeTask('a-1-7-2', 'Week 1 Quiz (10 questions)', 'quiz', 20),
          makeTask('a-1-7-3', 'Explore AWS Skill Builder free content', 'read', 15, 'https://skillbuilder.aws/'),
        ]},
      ],
    },
    {
      week: 2, title: 'Compute Services',
      icon: '🖥️', color: 'from-blue-500 to-indigo-600',
      days: [
        { day: 1, title: 'EC2 — Elastic Compute Cloud', tasks: [
          makeTask('a-2-1-1', 'EC2 instance types & families (t3, m5, c5, r5)', 'read', 25, 'https://docs.aws.amazon.com/ec2/'),
          makeTask('a-2-1-2', 'AMIs, Security Groups & Key Pairs', 'read', 20),
          makeTask('a-2-1-3', 'Launch EC2 in custom VPC subnet', 'lab', 30),
          makeTask('a-2-1-4', 'User Data scripts for bootstrapping', 'lab', 20),
        ]},
        { day: 2, title: 'Auto Scaling & Load Balancing', tasks: [
          makeTask('a-2-2-1', 'Auto Scaling Groups: launch templates & policies', 'read', 25),
          makeTask('a-2-2-2', 'Create an ALB (Application Load Balancer)', 'lab', 35),
          makeTask('a-2-2-3', 'Target Groups & health checks', 'lab', 20),
          makeTask('a-2-2-4', 'ALB vs NLB vs CLB', 'read', 15),
        ]},
        { day: 3, title: 'Lambda (Serverless)', tasks: [
          makeTask('a-2-3-1', 'Lambda architecture, runtimes & limits', 'read', 25, 'https://docs.aws.amazon.com/lambda/'),
          makeTask('a-2-3-2', 'Create a Lambda function (Python/Node)', 'lab', 30),
          makeTask('a-2-3-3', 'API Gateway + Lambda REST API', 'lab', 35),
          makeTask('a-2-3-4', 'Lambda layers & environment variables', 'watch', 15),
        ]},
        { day: 4, title: 'ECS & EKS (Containers)', tasks: [
          makeTask('a-2-4-1', 'ECS launch types: Fargate vs EC2', 'read', 25, 'https://docs.aws.amazon.com/ecs/'),
          makeTask('a-2-4-2', 'Deploy a Docker container with ECS Fargate', 'lab', 40),
          makeTask('a-2-4-3', 'EKS cluster creation & kubectl setup', 'lab', 30),
          makeTask('a-2-4-4', 'ECR: Elastic Container Registry', 'lab', 20),
        ]},
        { day: 5, title: 'Elastic Beanstalk', tasks: [
          makeTask('a-2-5-1', 'Beanstalk: PaaS for web apps', 'read', 20),
          makeTask('a-2-5-2', 'Deploy a web app with Beanstalk', 'lab', 30),
          makeTask('a-2-5-3', 'Environment configurations & rolling updates', 'watch', 20),
        ]},
        { day: 6, title: 'Hands-on: Compute Architecture', tasks: [
          makeTask('a-2-6-1', 'Build: ALB → Auto Scaling Group → EC2', 'lab', 50),
          makeTask('a-2-6-2', 'Serverless: API Gateway → Lambda → DynamoDB', 'lab', 40),
        ]},
        { day: 7, title: 'Week 2 Review & Quiz', tasks: [
          makeTask('a-2-7-1', 'Compute service comparison scenarios', 'practice', 25),
          makeTask('a-2-7-2', 'Week 2 Quiz (12 questions)', 'quiz', 25),
        ]},
      ],
    },
    {
      week: 3, title: 'Storage Services',
      icon: '🗄️', color: 'from-emerald-500 to-green-600',
      days: [
        { day: 1, title: 'S3 — Simple Storage Service', tasks: [
          makeTask('a-3-1-1', 'S3 storage classes: Standard, IA, Glacier', 'read', 25, 'https://docs.aws.amazon.com/s3/'),
          makeTask('a-3-1-2', 'S3 bucket policies & ACLs', 'lab', 25),
          makeTask('a-3-1-3', 'Versioning, lifecycle policies & replication', 'lab', 25),
          makeTask('a-3-1-4', 'S3 static website & CloudFront CDN', 'lab', 20),
        ]},
        { day: 2, title: 'EBS & EFS', tasks: [
          makeTask('a-3-2-1', 'EBS volume types: gp3, io2, st1, sc1', 'read', 20),
          makeTask('a-3-2-2', 'Attach EBS to EC2 & create filesystem', 'lab', 25),
          makeTask('a-3-2-3', 'EFS: managed NFS for multiple EC2s', 'lab', 30),
          makeTask('a-3-2-4', 'EBS snapshots & AMI creation', 'lab', 20),
        ]},
        { day: 3, title: 'Storage Gateway & Snow Family', tasks: [
          makeTask('a-3-3-1', 'Storage Gateway types: File, Volume, Tape', 'read', 20),
          makeTask('a-3-3-2', 'AWS Snow Family: Snowball, Snowmobile', 'read', 15),
          makeTask('a-3-3-3', 'DataSync for automated data transfer', 'watch', 15),
        ]},
        { day: 4, title: 'CloudFront (CDN)', tasks: [
          makeTask('a-3-4-1', 'CloudFront distributions & origins', 'read', 20, 'https://docs.aws.amazon.com/cloudfront/'),
          makeTask('a-3-4-2', 'Create CloudFront distribution for S3', 'lab', 30),
          makeTask('a-3-4-3', 'Cache behaviors & TTL settings', 'lab', 20),
          makeTask('a-3-4-4', 'Lambda@Edge & CloudFront Functions', 'watch', 20),
        ]},
        { day: 5, title: 'Glacier & Archive', tasks: [
          makeTask('a-3-5-1', 'S3 Glacier retrieval options', 'read', 20),
          makeTask('a-3-5-2', 'Set up S3 lifecycle to archive to Glacier', 'lab', 20),
          makeTask('a-3-5-3', 'Cost comparison: storage classes', 'practice', 20),
        ]},
        { day: 6, title: 'Hands-on: Multi-tier Storage', tasks: [
          makeTask('a-3-6-1', 'S3 + CloudFront + Route 53 static site', 'lab', 45),
          makeTask('a-3-6-2', 'EC2 with EBS + S3 backup with lifecycle', 'lab', 30),
        ]},
        { day: 7, title: 'Week 3 Review & Quiz', tasks: [
          makeTask('a-3-7-1', 'Storage scenario questions', 'practice', 25),
          makeTask('a-3-7-2', 'Week 3 Quiz (12 questions)', 'quiz', 25),
        ]},
      ],
    },
    {
      week: 4, title: 'Databases',
      icon: '💾', color: 'from-violet-500 to-purple-600',
      days: [
        { day: 1, title: 'RDS & Aurora', tasks: [
          makeTask('a-4-1-1', 'RDS engines: MySQL, PostgreSQL, MariaDB, Oracle', 'read', 25, 'https://docs.aws.amazon.com/rds/'),
          makeTask('a-4-1-2', 'Create a Multi-AZ RDS instance', 'lab', 30),
          makeTask('a-4-1-3', 'Aurora: MySQL & PostgreSQL compatible', 'read', 20),
          makeTask('a-4-1-4', 'RDS Read Replicas & automated backups', 'lab', 20),
        ]},
        { day: 2, title: 'DynamoDB (NoSQL)', tasks: [
          makeTask('a-4-2-1', 'DynamoDB: tables, items, attributes', 'read', 25, 'https://docs.aws.amazon.com/dynamodb/'),
          makeTask('a-4-2-2', 'Partition keys, sort keys & GSIs', 'read', 20),
          makeTask('a-4-2-3', 'CRUD operations with AWS CLI & Console', 'lab', 30),
          makeTask('a-4-2-4', 'DynamoDB Streams & TTL', 'watch', 20),
        ]},
        { day: 3, title: 'ElastiCache & MemoryDB', tasks: [
          makeTask('a-4-3-1', 'ElastiCache Redis vs Memcached', 'read', 20),
          makeTask('a-4-3-2', 'Set up ElastiCache Redis cluster', 'lab', 30),
          makeTask('a-4-3-3', 'Caching patterns: cache-aside, write-through', 'read', 20),
        ]},
        { day: 4, title: 'Redshift (Data Warehouse)', tasks: [
          makeTask('a-4-4-1', 'Redshift architecture & columnar storage', 'read', 25, 'https://docs.aws.amazon.com/redshift/'),
          makeTask('a-4-4-2', 'Create a Redshift cluster', 'lab', 25),
          makeTask('a-4-4-3', 'Load data from S3 & run queries', 'lab', 30),
          makeTask('a-4-4-4', 'Redshift Spectrum: query S3 data', 'watch', 15),
        ]},
        { day: 5, title: 'DocumentDB, Neptune & Timestream', tasks: [
          makeTask('a-4-5-1', 'DocumentDB: MongoDB-compatible', 'read', 15),
          makeTask('a-4-5-2', 'Neptune: graph database use cases', 'read', 15),
          makeTask('a-4-5-3', 'Timestream: time-series data', 'read', 15),
          makeTask('a-4-5-4', 'Choosing the right AWS database', 'practice', 25),
        ]},
        { day: 6, title: 'Hands-on: Database Architecture', tasks: [
          makeTask('a-4-6-1', 'Lambda → DynamoDB serverless app', 'lab', 45),
          makeTask('a-4-6-2', 'RDS in private subnet with Bastion host', 'lab', 35),
        ]},
        { day: 7, title: 'Week 4 Review & Quiz', tasks: [
          makeTask('a-4-7-1', 'Database selection scenarios', 'practice', 25),
          makeTask('a-4-7-2', 'Week 4 Quiz (12 questions)', 'quiz', 25),
        ]},
      ],
    },
    {
      week: 5, title: 'Networking & VPC',
      icon: '🌐', color: 'from-cyan-500 to-sky-600',
      days: [
        { day: 1, title: 'VPC Deep Dive', tasks: [
          makeTask('a-5-1-1', 'VPC components: CIDR, subnets, IGW, NAT', 'read', 30, 'https://docs.aws.amazon.com/vpc/'),
          makeTask('a-5-1-2', 'Create custom VPC from scratch', 'lab', 40),
          makeTask('a-5-1-3', 'Public vs Private subnets & routing', 'lab', 20),
        ]},
        { day: 2, title: 'Security Groups & NACLs', tasks: [
          makeTask('a-5-2-1', 'Security Groups: stateful rules', 'read', 20),
          makeTask('a-5-2-2', 'NACLs: stateless rules at subnet level', 'read', 20),
          makeTask('a-5-2-3', 'SG vs NACL comparison lab', 'lab', 25),
          makeTask('a-5-2-4', 'VPC Flow Logs for troubleshooting', 'lab', 15),
        ]},
        { day: 3, title: 'VPC Peering & Transit Gateway', tasks: [
          makeTask('a-5-3-1', 'VPC Peering: connect two VPCs', 'lab', 30),
          makeTask('a-5-3-2', 'Transit Gateway: hub-and-spoke topology', 'read', 25),
          makeTask('a-5-3-3', 'PrivateLink for service access', 'watch', 20),
        ]},
        { day: 4, title: 'Route 53 (DNS)', tasks: [
          makeTask('a-5-4-1', 'Route 53 record types & hosted zones', 'read', 25, 'https://docs.aws.amazon.com/route53/'),
          makeTask('a-5-4-2', 'Create hosted zone & DNS records', 'lab', 25),
          makeTask('a-5-4-3', 'Routing policies: failover, latency, geolocation', 'read', 20),
          makeTask('a-5-4-4', 'Route 53 health checks', 'lab', 15),
        ]},
        { day: 5, title: 'Direct Connect & VPN', tasks: [
          makeTask('a-5-5-1', 'AWS Site-to-Site VPN setup', 'read', 25),
          makeTask('a-5-5-2', 'Direct Connect: dedicated line to AWS', 'read', 20),
          makeTask('a-5-5-3', 'Client VPN for remote access', 'watch', 15),
        ]},
        { day: 6, title: 'Hands-on: Production VPC', tasks: [
          makeTask('a-5-6-1', '3-tier VPC: public/app/db subnets with NAT', 'lab', 50),
          makeTask('a-5-6-2', 'Deploy ALB in public + app in private subnet', 'lab', 35),
        ]},
        { day: 7, title: 'Week 5 Review & Quiz', tasks: [
          makeTask('a-5-7-1', 'VPC networking scenarios', 'practice', 25),
          makeTask('a-5-7-2', 'Week 5 Quiz (12 questions)', 'quiz', 25),
        ]},
      ],
    },
    {
      week: 6, title: 'DevOps & CI/CD',
      icon: '⚙️', color: 'from-rose-500 to-red-600',
      days: [
        { day: 1, title: 'CodeCommit & CodeBuild', tasks: [
          makeTask('a-6-1-1', 'CodeCommit: Git repository on AWS', 'lab', 25),
          makeTask('a-6-1-2', 'CodeBuild: buildspec.yml configuration', 'lab', 30, 'https://docs.aws.amazon.com/codebuild/'),
          makeTask('a-6-1-3', 'Build a Docker image with CodeBuild', 'lab', 30),
        ]},
        { day: 2, title: 'CodeDeploy & CodePipeline', tasks: [
          makeTask('a-6-2-1', 'CodeDeploy: appspec.yml & deployment groups', 'read', 25),
          makeTask('a-6-2-2', 'CodePipeline: full CI/CD pipeline', 'lab', 40),
          makeTask('a-6-2-3', 'Blue/green & canary deployments', 'watch', 20),
        ]},
        { day: 3, title: 'CloudFormation (IaC)', tasks: [
          makeTask('a-6-3-1', 'CloudFormation templates: Resources, Parameters, Outputs', 'read', 30, 'https://docs.aws.amazon.com/cloudformation/'),
          makeTask('a-6-3-2', 'Deploy a VPC + EC2 with CloudFormation', 'lab', 40),
          makeTask('a-6-3-3', 'Stacks, change sets & rollbacks', 'lab', 20),
          makeTask('a-6-3-4', 'CDK vs CloudFormation vs Terraform', 'read', 15),
        ]},
        { day: 4, title: 'Terraform on AWS', tasks: [
          makeTask('a-6-4-1', 'Terraform AWS provider setup', 'lab', 25, 'https://registry.terraform.io/providers/hashicorp/aws'),
          makeTask('a-6-4-2', 'Write Terraform for EC2, S3, VPC', 'lab', 40),
          makeTask('a-6-4-3', 'Remote state in S3 + DynamoDB locking', 'lab', 25),
        ]},
        { day: 5, title: 'CloudWatch & CloudTrail', tasks: [
          makeTask('a-6-5-1', 'CloudWatch metrics, dashboards & alarms', 'lab', 30, 'https://docs.aws.amazon.com/cloudwatch/'),
          makeTask('a-6-5-2', 'CloudWatch Logs & Log Insights queries', 'lab', 25),
          makeTask('a-6-5-3', 'CloudTrail: audit all API calls', 'lab', 20),
          makeTask('a-6-5-4', 'AWS Config for compliance', 'watch', 15),
        ]},
        { day: 6, title: 'Hands-on: Full CI/CD Pipeline', tasks: [
          makeTask('a-6-6-1', 'CodeCommit → CodeBuild → ECR → ECS pipeline', 'lab', 60),
          makeTask('a-6-6-2', 'Add CloudWatch alarms for deployment', 'lab', 20),
        ]},
        { day: 7, title: 'Week 6 Review & Quiz', tasks: [
          makeTask('a-6-7-1', 'DevOps scenario practice', 'practice', 25),
          makeTask('a-6-7-2', 'Week 6 Quiz (10 questions)', 'quiz', 20),
        ]},
      ],
    },
    {
      week: 7, title: 'Security & Compliance',
      icon: '🔒', color: 'from-slate-500 to-slate-700',
      days: [
        { day: 1, title: 'IAM Advanced', tasks: [
          makeTask('a-7-1-1', 'IAM Permission boundaries', 'read', 20),
          makeTask('a-7-1-2', 'SCP (Service Control Policies) in AWS Organizations', 'read', 25),
          makeTask('a-7-1-3', 'Cross-account roles & assume role', 'lab', 30),
        ]},
        { day: 2, title: 'KMS & Secrets Manager', tasks: [
          makeTask('a-7-2-1', 'KMS keys: CMK, AWS managed, customer managed', 'read', 25, 'https://docs.aws.amazon.com/kms/'),
          makeTask('a-7-2-2', 'Encrypt EBS & S3 with KMS', 'lab', 25),
          makeTask('a-7-2-3', 'Secrets Manager: rotate DB passwords', 'lab', 25),
          makeTask('a-7-2-4', 'Parameter Store vs Secrets Manager', 'read', 15),
        ]},
        { day: 3, title: 'WAF, Shield & Inspector', tasks: [
          makeTask('a-7-3-1', 'AWS WAF rules & web ACLs', 'lab', 25, 'https://docs.aws.amazon.com/waf/'),
          makeTask('a-7-3-2', 'Shield Standard vs Shield Advanced', 'read', 15),
          makeTask('a-7-3-3', 'Inspector v2 for vulnerability scanning', 'lab', 20),
          makeTask('a-7-3-4', 'Macie: S3 data classification', 'watch', 15),
        ]},
        { day: 4, title: 'GuardDuty & Security Hub', tasks: [
          makeTask('a-7-4-1', 'Enable GuardDuty threat detection', 'lab', 20),
          makeTask('a-7-4-2', 'Security Hub findings & standards', 'lab', 20),
          makeTask('a-7-4-3', 'Detective for incident investigation', 'read', 15),
          makeTask('a-7-4-4', 'AWS Security best practices checklist', 'practice', 25),
        ]},
        { day: 5, title: 'Compliance & Governance', tasks: [
          makeTask('a-7-5-1', 'AWS Artifact: compliance reports', 'read', 15),
          makeTask('a-7-5-2', 'AWS Config rules & conformance packs', 'lab', 25),
          makeTask('a-7-5-3', 'Organizations: SCPs & consolidated billing', 'read', 20),
        ]},
        { day: 6, title: 'Hands-on: Secure Architecture', tasks: [
          makeTask('a-7-6-1', 'Encrypt at rest & in transit end-to-end', 'lab', 35),
          makeTask('a-7-6-2', 'Security audit with Trusted Advisor', 'practice', 25),
          makeTask('a-7-6-3', 'Set up multi-account with AWS Organizations', 'lab', 25),
        ]},
        { day: 7, title: 'Week 7 Review & Quiz', tasks: [
          makeTask('a-7-7-1', 'Security scenario questions', 'practice', 25),
          makeTask('a-7-7-2', 'Week 7 Quiz (10 questions)', 'quiz', 20),
        ]},
      ],
    },
    {
      week: 8, title: 'SAA-C03 Certification Prep',
      icon: '🏆', color: 'from-yellow-500 to-amber-500',
      days: [
        { day: 1, title: 'Exam Overview & Study Plan', tasks: [
          makeTask('a-8-1-1', 'SAA-C03 exam guide & domains', 'read', 25, 'https://aws.amazon.com/certification/certified-solutions-architect-associate/'),
          makeTask('a-8-1-2', 'Register for AWS certification exam', 'practice', 10),
          makeTask('a-8-1-3', 'Build Anki flashcards for all AWS services', 'practice', 30),
        ]},
        { day: 2, title: 'Practice: Design Resilient Architectures', tasks: [
          makeTask('a-8-2-1', '25 questions: multi-tier, HA, multi-AZ', 'quiz', 35),
          makeTask('a-8-2-2', '25 questions: EC2, Auto Scaling, LB', 'quiz', 35),
          makeTask('a-8-2-3', 'Review incorrect answers', 'practice', 20),
        ]},
        { day: 3, title: 'Practice: High Performing Architecture', tasks: [
          makeTask('a-8-3-1', '25 questions: S3, databases, caching', 'quiz', 35),
          makeTask('a-8-3-2', '25 questions: CloudFront, SQS, SNS', 'quiz', 35),
          makeTask('a-8-3-3', 'Study AWS Architecture Center examples', 'read', 20, 'https://aws.amazon.com/architecture/'),
        ]},
        { day: 4, title: 'Practice: Secure Applications', tasks: [
          makeTask('a-8-4-1', '25 questions: IAM, KMS, WAF, Shield', 'quiz', 35),
          makeTask('a-8-4-2', '25 questions: VPC, Security Groups, NACLs', 'quiz', 35),
          makeTask('a-8-4-3', 'Review networking architecture diagrams', 'practice', 20),
        ]},
        { day: 5, title: 'Full Mock Exam #1', tasks: [
          makeTask('a-8-5-1', '65-question timed mock exam (130 min)', 'quiz', 130, 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/'),
          makeTask('a-8-5-2', 'Review all wrong answers in detail', 'practice', 50),
        ]},
        { day: 6, title: 'Full Mock Exam #2 & Final Review', tasks: [
          makeTask('a-8-6-1', '65-question timed mock exam #2', 'quiz', 130),
          makeTask('a-8-6-2', 'Speed review: all major services', 'practice', 30),
          makeTask('a-8-6-3', 'Top 50 SAA-C03 topics checklist', 'read', 20),
        ]},
        { day: 7, title: 'Exam Day', tasks: [
          makeTask('a-8-7-1', 'Light flashcard review', 'practice', 30),
          makeTask('a-8-7-2', 'Confirm exam logistics & timing', 'practice', 10),
          makeTask('a-8-7-3', 'You\'re ready — go ace it! 🎉', 'read', 5),
        ]},
      ],
    },
  ],
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = (provider) => `taskflow_learn_${provider}`

function loadDone(provider) {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY(provider)) || '{}') } catch { return {} }
}
function saveDone(provider, done) {
  localStorage.setItem(STORAGE_KEY(provider), JSON.stringify(done))
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Learning() {
  const [provider, setProvider] = useState('gcp')
  const [done, setDone] = useState({})
  const [openWeek, setOpenWeek] = useState(0)
  const [openDay, setOpenDay] = useState(null)

  useEffect(() => {
    setDone(loadDone(provider))
  }, [provider])

  const toggle = (taskId) => {
    const next = { ...done, [taskId]: !done[taskId] }
    setDone(next)
    saveDone(provider, next)
  }

  const curriculum = CURRICULUM[provider]

  // Stats
  const allTasks = useMemo(() => curriculum.flatMap(w => w.days.flatMap(d => d.tasks)), [curriculum])
  const totalTasks = allTasks.length
  const doneTasks = allTasks.filter(t => done[t.id]).length
  const totalMins = allTasks.reduce((a, t) => a + t.mins, 0)
  const doneMins = allTasks.filter(t => done[t.id]).reduce((a, t) => a + t.mins, 0)
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0

  // Weeks progress
  const weekStats = curriculum.map(w => {
    const wTasks = w.days.flatMap(d => d.tasks)
    const wDone = wTasks.filter(t => done[t.id]).length
    return { total: wTasks.length, done: wDone }
  })

  // Current week = first incomplete week
  const currentWeekIdx = weekStats.findIndex(ws => ws.done < ws.total)
  const currentWeek = curriculum[currentWeekIdx === -1 ? curriculum.length - 1 : currentWeekIdx]
  const todayDay = currentWeek?.days.find(d => d.tasks.some(t => !done[t.id]))

  const resetAll = () => {
    saveDone(provider, {})
    setDone({})
  }

  const card = 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap size={22} className="text-brand-600 dark:text-brand-400" />
            Cloud Learning Path
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Structured daily curriculum — {provider === 'gcp' ? 'ACE Certification' : 'SAA-C03 Certification'}
          </p>
        </div>
        <button onClick={resetAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <RotateCcw size={12} /> Reset Progress
        </button>
      </div>

      {/* Provider toggle */}
      <div className="flex gap-3 mb-6">
        {[
          { id: 'gcp', label: 'Google Cloud (GCP)', emoji: '🔵', cert: 'ACE Exam', color: 'from-blue-500 to-sky-600' },
          { id: 'aws', label: 'Amazon AWS', emoji: '🟠', cert: 'SAA-C03 Exam', color: 'from-orange-500 to-amber-600' },
        ].map(p => (
          <button key={p.id} onClick={() => setProvider(p.id)}
            className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
              provider === p.id
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
            }`}>
            <span className="text-2xl">{p.emoji}</span>
            <div className="text-left">
              <p className={`font-bold text-sm ${provider === p.id ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>{p.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{p.cert} · 8 weeks</p>
            </div>
            {provider === p.id && <CheckCircle2 size={18} className="text-brand-600 dark:text-brand-400 ml-auto" />}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Overall Progress', value: `${pct}%`, icon: TrendingUp, color: 'from-brand-500 to-violet-600' },
          { label: 'Tasks Done', value: `${doneTasks}/${totalTasks}`, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
          { label: 'Hours Studied', value: `${Math.round(doneMins / 60)}h`, icon: Clock, color: 'from-amber-500 to-orange-600' },
          { label: 'Weeks Active', value: `${weekStats.filter(ws => ws.done > 0).length}/8`, icon: Trophy, color: 'from-rose-500 to-pink-600' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={card + ' p-4'}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</span>
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon size={13} className="text-white" />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Overall progress bar */}
      <div className={card + ' p-4 mb-6'}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Certification Progress</span>
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full"
          />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-slate-400 dark:text-slate-500">
          <span><strong className="text-slate-700 dark:text-slate-300">{doneTasks}</strong> tasks done</span>
          <span><strong className="text-slate-700 dark:text-slate-300">{totalTasks - doneTasks}</strong> remaining</span>
          <span><strong className="text-slate-700 dark:text-slate-300">~{Math.round((totalMins - doneMins) / 60)}h</strong> left</span>
        </div>
      </div>

      {/* Today's plan */}
      {todayDay && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Flame size={14} className="text-orange-500" /> Today's Study Plan
          </h2>
          <div className={card + ' p-5'}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{currentWeek.icon}</span>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Week {currentWeek.week} · {currentWeek.title}</p>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Day {todayDay.day}: {todayDay.title}</h3>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-400 dark:text-slate-500">Est. time</p>
                <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                  {Math.round(todayDay.tasks.reduce((a, t) => a + t.mins, 0) / 60 * 10) / 10}h
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {todayDay.tasks.map(task => {
                const typeInfo = TASK_TYPES[task.type]
                const Icon = typeInfo.icon
                const isDone = done[task.id]
                return (
                  <div key={task.id}
                    onClick={() => toggle(task.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      isDone ? 'opacity-60 bg-slate-50 dark:bg-slate-700/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                    }`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isDone && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                        {task.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${typeInfo.color}`}>
                        <Icon size={9} /> {typeInfo.label}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock size={10} /> {task.mins}m
                      </span>
                      {task.link && (
                        <a href={task.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                          className="text-slate-400 hover:text-brand-500 transition-colors">
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Week overview strip */}
      <div className="grid grid-cols-8 gap-1.5 mb-6">
        {curriculum.map((w, wi) => {
          const ws = weekStats[wi]
          const wPct = ws.total ? Math.round((ws.done / ws.total) * 100) : 0
          return (
            <button key={wi}
              onClick={() => setOpenWeek(wi === openWeek ? null : wi)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                openWeek === wi
                  ? 'bg-brand-600 text-white'
                  : ws.done === ws.total && ws.total > 0
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300'
              }`}>
              <span className="text-base">{w.icon}</span>
              <span className="text-[10px] font-bold">W{w.week}</span>
              <span className="text-[9px] opacity-70">{wPct}%</span>
            </button>
          )
        })}
      </div>

      {/* Full Curriculum */}
      <div className="space-y-3">
        {curriculum.map((week, wi) => {
          const ws = weekStats[wi]
          const wPct = ws.total ? Math.round((ws.done / ws.total) * 100) : 0
          const isOpen = openWeek === wi

          return (
            <div key={wi} className={card + ' overflow-hidden'}>
              {/* Week header */}
              <button
                onClick={() => setOpenWeek(isOpen ? null : wi)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${week.color} flex items-center justify-center text-xl flex-shrink-0 shadow-sm`}>
                  {week.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">WEEK {week.week}</span>
                    {ws.done === ws.total && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 size={9} /> Done
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{week.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden max-w-[120px]">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${wPct}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{ws.done}/{ws.total} tasks · {wPct}%</span>
                  </div>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={16} className="text-slate-400" />
                </motion.div>
              </button>

              {/* Days */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 space-y-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                      {week.days.map((day, di) => {
                        const dayDone = day.tasks.filter(t => done[t.id]).length
                        const dayPct = day.tasks.length ? Math.round((dayDone / day.tasks.length) * 100) : 0
                        const dayKey = `${wi}-${di}`
                        const isDayOpen = openDay === dayKey

                        return (
                          <div key={di} className="border border-slate-100 dark:border-slate-700/60 rounded-xl overflow-hidden">
                            <button
                              onClick={() => setOpenDay(isDayOpen ? null : dayKey)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                dayDone === day.tasks.length
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                              }`}>
                                {dayDone === day.tasks.length ? <CheckCircle2 size={14} /> : `D${day.day}`}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{day.title}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                  {day.tasks.length} tasks · ~{Math.round(day.tasks.reduce((a, t) => a + t.mins, 0) / 60 * 10) / 10}h
                                  {dayDone > 0 && ` · ${dayPct}% done`}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-brand-500 rounded-full transition-all"
                                    style={{ width: `${dayPct}%` }} />
                                </div>
                                <ChevronRight size={13} className={`text-slate-400 transition-transform ${isDayOpen ? 'rotate-90' : ''}`} />
                              </div>
                            </button>

                            <AnimatePresence>
                              {isDayOpen && (
                                <motion.div
                                  initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden border-t border-slate-100 dark:border-slate-700/60"
                                >
                                  <div className="px-4 py-3 space-y-1.5 bg-slate-50/50 dark:bg-slate-800/50">
                                    {day.tasks.map(task => {
                                      const typeInfo = TASK_TYPES[task.type]
                                      const Icon = typeInfo.icon
                                      const isDone = done[task.id]
                                      return (
                                        <div key={task.id}
                                          onClick={() => toggle(task.id)}
                                          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                                            isDone
                                              ? 'opacity-55'
                                              : 'hover:bg-white dark:hover:bg-slate-700/50'
                                          }`}>
                                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                            isDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'
                                          }`}>
                                            {isDone && <CheckCircle2 size={11} className="text-white" />}
                                          </div>
                                          <p className={`flex-1 text-sm ${
                                            isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'
                                          }`}>{task.title}</p>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${typeInfo.color}`}>
                                              <Icon size={8} /> {typeInfo.label}
                                            </span>
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500 w-8 text-right">{task.mins}m</span>
                                            {task.link && (
                                              <a href={task.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                                className="text-slate-400 hover:text-brand-500 transition-colors">
                                                <ExternalLink size={11} />
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {pct === 100 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center bg-gradient-to-r from-brand-600 to-violet-600 rounded-2xl p-8 text-white shadow-xl">
          <p className="text-4xl mb-2">🎉</p>
          <h3 className="text-xl font-bold mb-1">Curriculum Complete!</h3>
          <p className="text-white/80 text-sm">You've finished all {totalTasks} tasks. Time to schedule your certification exam!</p>
        </motion.div>
      )}
    </div>
  )
}
