import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());


// Database Store File Configuration
const DB_FILE = path.join(process.cwd(), "db_store.json");

interface DBStore {
  users: any[];
  reports: any[];
  evidence: any[];
  status_history: any[];
  audit_logs: any[];
}

const DEFAULT_USERS = [
  { id: "u1", name: "Admin SecOps", email: "admin@trace.org", role: "Admin", created_at: "2026-07-11T08:00:00.000Z" },
  { id: "u2", name: "Investigator Dave", email: "dave@trace.org", role: "Investigator", created_at: "2026-07-11T08:30:00.000Z" }
];

const INITIAL_REPORTS = [
  {
    id: "rep-001",
    tracking_ref: "REF-8231-A42F",
    reporter_id: null,
    reporter_name: "Anonymous Enterprise Client",
    reporter_contact: "secured-anonymous@client.io",
    attack_type: "DDoS HTTP Flood on Main Gateway",
    description: "Coordinated botnet-orchestrated concurrent connections flooding the primary application load balancer, causing severe CPU exhaustion and latency spikes.",
    affected_system: "Main API Gateway Load Balancer",
    severity: "Critical",
    status: "Investigating",
    created_at: "2026-07-11T08:50:01.000Z",
    assigned_to: "u2",
    assigned_to_name: "Investigator Dave"
  },
  {
    id: "rep-002",
    tracking_ref: "REF-4412-B90A",
    reporter_id: null,
    reporter_name: "Fintech Systems Inc.",
    reporter_contact: "ciso@fintechsys.io",
    attack_type: "SQL Injection Probe on Users API",
    description: "Malicious query payload injections attempting to bypass authentication, expose password hashes, and leak system tables.",
    affected_system: "Users Identity Platform SSO",
    severity: "High",
    status: "Resolved",
    created_at: "2026-07-11T08:51:14.000Z",
    assigned_to: "u2",
    assigned_to_name: "Investigator Dave"
  },
  {
    id: "rep-003",
    tracking_ref: "REF-1190-C22E",
    reporter_id: null,
    reporter_name: "Anonymous System Watcher",
    reporter_contact: "watcher@internal.net",
    attack_type: "SSH Root Brute-Force Scanning",
    description: "Automated dictionary attacks hammering SSH port 22 in rapid succession trying common credentials like 'admin', 'root', and 'support'.",
    affected_system: "Bastion Gate SSH Portal",
    severity: "High",
    status: "Under Review",
    created_at: "2026-07-11T08:52:10.000Z",
    assigned_to: null,
    assigned_to_name: null
  }
];

const INITIAL_EVIDENCE = [
  {
    id: "ev-001",
    report_id: "rep-001",
    file_name: "gateway_cpu_spike.log",
    file_type: "log",
    content_summary: "[2026-07-11 08:50:01] INFO: TCP Handshake initiated from bot-node-185-220-101-99.net (185.220.101.99:54231)\n[2026-07-11 08:50:01] WARNING: Rate limit exceeded for IP 185.220.101.99. Current count: 1250 req/sec. Limit: 100 req/sec.\n[2026-07-11 08:50:02] ALERT: High load on /api/v1/auth/session - CPU 98%, Mem 91%\n[2026-07-11 08:50:02] ERROR: Gateway Timeout 504 on upstream application-node-03",
    uploaded_at: "2026-07-11T08:50:02.000Z"
  },
  {
    id: "ev-002",
    report_id: "rep-002",
    file_name: "sqli_probe_payload.log",
    file_type: "log",
    content_summary: "[2026-07-11 08:51:14] INFO: Connection accepted from tor-exit-node.nl (103.45.201.12:43110) to https://api.enterprise.com/v1/users/login\n[2026-07-11 08:51:14] INFO: Request payload: {\"email\": \"admin@enterprise.com\", \"password\": \"' OR '1'='1 --\"}\n[2026-07-11 08:51:15] WARN: Postgres SQL Exception generated: \"terminated by quote mismatch\" near column 'password'",
    uploaded_at: "2026-07-11T08:51:15.000Z"
  },
  {
    id: "ev-003",
    report_id: "rep-003",
    file_name: "bastion_ssh_fail.log",
    file_type: "log",
    content_summary: "Jul 11 08:52:10 enterprise-bastion sshd[23120]: Invalid user admin from 45.14.220.67 port 59003\nJul 11 08:52:11 enterprise-bastion sshd[23120]: Connection closed by authenticating user admin 45.14.220.67 port 59003 [preauth]\nJul 11 08:52:12 enterprise-bastion sshd[23128]: Invalid user root from 45.14.220.67 port 59012\nJul 11 08:52:12 enterprise-bastion sshd[23128]: Failed password for invalid user root from 45.14.220.67 port 59012 ssh2",
    uploaded_at: "2026-07-11T08:52:12.000Z"
  }
];

const INITIAL_STATUS_HISTORY = [
  {
    id: "sh-001",
    report_id: "rep-001",
    old_status: "Submitted",
    new_status: "Under Review",
    changed_by: "u1",
    changed_by_name: "Admin SecOps",
    changed_at: "2026-07-11T09:00:00.000Z",
    note: "Initial triage complete. Report contains valid threat vectors."
  },
  {
    id: "sh-002",
    report_id: "rep-001",
    old_status: "Under Review",
    new_status: "Investigating",
    changed_by: "u1",
    changed_by_name: "Admin SecOps",
    changed_at: "2026-07-11T09:15:00.000Z",
    note: "Assigned to Dave. Log payload suggests coordinated Botnet activity from Frankfurt transit nodes."
  },
  {
    id: "sh-003",
    report_id: "rep-002",
    old_status: "Submitted",
    new_status: "Under Review",
    changed_by: "u1",
    changed_by_name: "Admin SecOps",
    changed_at: "2026-07-11T09:05:00.000Z",
    note: "WAF logs received. Validating WAF rules database block parameters."
  },
  {
    id: "sh-004",
    report_id: "rep-002",
    old_status: "Under Review",
    new_status: "Investigating",
    changed_by: "u2",
    changed_by_name: "Investigator Dave",
    changed_at: "2026-07-11T09:30:00.000Z",
    note: "Analyzing Users table indices. No signs of earlier SQL execution success. Confirming payload was drop-filtered."
  },
  {
    id: "sh-005",
    report_id: "rep-002",
    old_status: "Investigating",
    new_status: "Resolved",
    changed_by: "u2",
    changed_by_name: "Investigator Dave",
    changed_at: "2026-07-11T10:45:00.000Z",
    note: "WAF rate limit rules tightened. Target User session isolated and credential logs rotated. Attack fully mitigated."
  },
  {
    id: "sh-006",
    report_id: "rep-003",
    old_status: "Submitted",
    new_status: "Under Review",
    changed_by: "u1",
    changed_by_name: "Admin SecOps",
    changed_at: "2026-07-11T09:40:00.000Z",
    note: "Automated Fail2Ban ban active. SSH root dictionary attack contained on Bastion. Key rotations planned."
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    id: "aud-001",
    actor_id: "u1",
    actor_name: "Admin SecOps",
    action: "LOGIN",
    target_table: "users",
    target_id: "u1",
    timestamp: "2026-07-11T08:00:00.000Z",
    details: "Admin SecOps successfully logged into SecOps control panel."
  },
  {
    id: "aud-002",
    actor_id: "anonymous",
    actor_name: "Public Reporter",
    action: "SUBMIT_REPORT",
    target_table: "reports",
    target_id: "rep-001",
    timestamp: "2026-07-11T08:50:01.000Z",
    details: "Anonymous public report submitted for DDoS attack vectors. Reference generated: REF-8231-A42F."
  },
  {
    id: "aud-003",
    actor_id: "u1",
    actor_name: "Admin SecOps",
    action: "UPDATE_STATUS",
    target_table: "reports",
    target_id: "rep-001",
    timestamp: "2026-07-11T09:00:00.000Z",
    details: "Admin changed report status from Submitted to Under Review. Note: Triage complete."
  },
  {
    id: "aud-004",
    actor_id: "u1",
    actor_name: "Admin SecOps",
    action: "ASSIGN_REPORT",
    target_table: "reports",
    target_id: "rep-001",
    timestamp: "2026-07-11T09:15:00.000Z",
    details: "Admin assigned report to investigator Dave."
  }
];

// Read DB Store from disk or return default
function getDBStore(): DBStore {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read DB_STORE file, using initial data.", err);
  }
  
  const initialStore: DBStore = {
    users: DEFAULT_USERS,
    reports: INITIAL_REPORTS,
    evidence: INITIAL_EVIDENCE,
    status_history: INITIAL_STATUS_HISTORY,
    audit_logs: INITIAL_AUDIT_LOGS
  };
  saveDBStore(initialStore);
  return initialStore;
}

// Save DB Store to disk
function saveDBStore(store: DBStore) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save DB_STORE file.", err);
  }
}

// SECURE AUDIT LOG HELPER
function logAudit(actorId: string, actorName: string, action: string, targetTable: string, targetId: string, details: string) {
  const store = getDBStore();
  const newAudit = {
    id: "aud-" + Math.random().toString(36).substring(2, 11),
    actor_id: actorId || "anonymous",
    actor_name: actorName || "Public Reporter",
    action,
    target_table: targetTable,
    target_id: targetId,
    timestamp: new Date().toISOString(),
    details
  };
  store.audit_logs.unshift(newAudit);
  saveDBStore(store);
}

// ---------------------- CYBER ATTACK TRACING SYSTEM API ROUTES ----------------------

// API 1. AUTH LOGIN
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const store = getDBStore();
  // Simulated login check: support standard accounts with "admin123" / "dave123" or generic pass
  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user || (user.role === "Admin" && password !== "admin123") || (user.role === "Investigator" && password !== "dave123")) {
    logAudit("anonymous", "Anonymous User", "LOGIN_FAILURE", "users", "none", `Failed login attempt for email: ${email}`);
    return res.status(401).json({ error: "Invalid credentials. Password must match standard credentials ('admin123' or 'dave123')." });
  }

  logAudit(user.id, user.name, "LOGIN", "users", user.id, `${user.name} logged in successfully as ${user.role}.`);
  res.json({ user });
});

// API 2. GET ALL INCIDENT REPORTS (ADMIN / INVESTIGATOR)
app.get("/api/reports", (req, res) => {
  const actorId = (req.query.actorId as string) || "anonymous";
  const actorName = (req.query.actorName as string) || "Public Reporter";
  const { severity, status, search } = req.query;

  const store = getDBStore();
  let filtered = [...store.reports];

  if (severity && severity !== "All") {
    filtered = filtered.filter(r => r.severity.toLowerCase() === (severity as string).toLowerCase());
  }
  if (status && status !== "All") {
    filtered = filtered.filter(r => r.status.toLowerCase() === (status as string).toLowerCase());
  }
  if (search && (search as string).trim() !== "") {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(r => 
      r.tracking_ref.toLowerCase().includes(q) ||
      r.attack_type.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.affected_system.toLowerCase().includes(q) ||
      r.reporter_name.toLowerCase().includes(q)
    );
  }

  // Audit this read operation (Mandatory: Every read/write on a report is logged!)
  logAudit(
    actorId, 
    actorName, 
    "READ_REPORTS_LIST", 
    "reports", 
    "multiple", 
    `${actorName} retrieved the list of incident reports (count: ${filtered.length}) with parameters: status=${status || "all"}, severity=${severity || "all"}`
  );

  res.json(filtered);
});

// API 3. SUBMIT A NEW REPORT (PUBLIC FORM)
app.post("/api/reports", (req, res) => {
  const { 
    reporter_name, 
    reporter_contact, 
    attack_type, 
    description, 
    affected_system, 
    severity,
    evidence_text,
    evidence_type 
  } = req.body;

  if (!attack_type || !description || !affected_system || !severity) {
    return res.status(400).json({ error: "Required fields missing: attack_type, description, affected_system, severity are required." });
  }

  const store = getDBStore();
  const reportId = "rep-" + Math.random().toString(36).substring(2, 11);
  
  // Create randomized Tracking Reference: REF-XXXX-XXXX
  const randPart1 = Math.floor(1000 + Math.random() * 9000);
  const randPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const trackingRef = `REF-${randPart1}-${randPart2}`;

  const newReport = {
    id: reportId,
    tracking_ref: trackingRef,
    reporter_id: null,
    reporter_name: reporter_name || "Anonymous Client",
    reporter_contact: reporter_contact || "unspecified@contact.org",
    attack_type,
    description,
    affected_system,
    severity,
    status: "Submitted",
    created_at: new Date().toISOString(),
    assigned_to: null,
    assigned_to_name: null
  };

  store.reports.unshift(newReport);

  // Set initial status history log entry
  const historyId = "sh-" + Math.random().toString(36).substring(2, 11);
  const initialHistory = {
    id: historyId,
    report_id: reportId,
    old_status: "-",
    new_status: "Submitted",
    changed_by: "anonymous",
    changed_by_name: "Public Reporter",
    changed_at: new Date().toISOString(),
    note: "Incident reported publicly via secure intake portal."
  };
  store.status_history.unshift(initialHistory);

  // Optional evidence attachments
  if (evidence_text && evidence_text.trim() !== "") {
    const evidenceId = "ev-" + Math.random().toString(36).substring(2, 11);
    const newEvidence = {
      id: evidenceId,
      report_id: reportId,
      file_name: evidence_type === "log" ? "injected_syslog.log" : "evidence_snapshot.png",
      file_type: evidence_type || "log",
      content_summary: evidence_text,
      uploaded_at: new Date().toISOString()
    };
    store.evidence.unshift(newEvidence);
  }

  saveDBStore(store);

  // Secure Audit log
  logAudit(
    "anonymous", 
    "Public Reporter", 
    "SUBMIT_REPORT", 
    "reports", 
    reportId, 
    `Submitted new report for ${attack_type}. Reference Generated: ${trackingRef}`
  );

  res.status(201).json({
    message: "Report submitted successfully.",
    report: newReport
  });
});

// API 4. TRACK INCIDENT BY REFERENCE (NO AUTH REQUIRED)
app.get("/api/reports/track/:ref", (req, res) => {
  const ref = req.params.ref.trim().toUpperCase();
  const store = getDBStore();

  const report = store.reports.find(r => r.tracking_ref === ref);
  if (!report) {
    logAudit("anonymous", "Anonymous User", "FAILED_TRACK", "reports", ref, `Failed trace attempt for tracking reference: ${ref}`);
    return res.status(404).json({ error: `Incident report with reference ${ref} was not found. Verify format (e.g. REF-8231-A42F).` });
  }

  // Retrieve matching evidence and timeline logs
  const evidenceList = store.evidence.filter(e => e.report_id === report.id);
  const history = store.status_history.filter(sh => sh.report_id === report.id);

  // Log audit of read
  logAudit(
    "anonymous", 
    "Public Reporter", 
    "TRACK_REPORT", 
    "reports", 
    report.id, 
    `Public tracking reference looked up successfully for ref: ${ref}`
  );

  res.json({
    report,
    evidence: evidenceList,
    history
  });
});

// API 5. UPDATE REPORT STATUS (AUTHENTICATED STAFF)
app.put("/api/reports/:id/status", (req, res) => {
  const reportId = req.params.id;
  const { new_status, note, actorId, actorName } = req.body;

  if (!new_status || !actorId || !actorName) {
    return res.status(400).json({ error: "new_status, actorId, and actorName are required." });
  }

  const store = getDBStore();
  const reportIndex = store.reports.findIndex(r => r.id === reportId);
  if (reportIndex === -1) {
    return res.status(404).json({ error: "Report not found." });
  }

  const report = store.reports[reportIndex];
  const old_status = report.status;
  report.status = new_status;

  // Append to status history
  const historyId = "sh-" + Math.random().toString(36).substring(2, 11);
  const statusLog = {
    id: historyId,
    report_id: reportId,
    old_status,
    new_status,
    changed_by: actorId,
    changed_by_name: actorName,
    changed_at: new Date().toISOString(),
    note: note || `Status updated from ${old_status} to ${new_status}.`
  };
  store.status_history.unshift(statusLog);
  saveDBStore(store);

  // Log secure audit trail
  logAudit(
    actorId,
    actorName,
    "UPDATE_STATUS",
    "reports",
    reportId,
    `Status updated from ${old_status} to ${new_status}. Action Note: ${note || "None"}`
  );

  res.json({
    message: "Status updated successfully.",
    report,
    history: statusLog
  });
});

// API 6. ASSIGN INVESTIGATOR TO REPORT (ADMIN ONLY)
app.put("/api/reports/:id/assign", (req, res) => {
  const reportId = req.params.id;
  const { assigned_to, actorId, actorName } = req.body;

  if (!actorId || !actorName) {
    return res.status(400).json({ error: "actorId and actorName are required." });
  }

  const store = getDBStore();
  const reportIndex = store.reports.findIndex(r => r.id === reportId);
  if (reportIndex === -1) {
    return res.status(404).json({ error: "Report not found." });
  }

  const report = store.reports[reportIndex];
  let investigatorName = null;

  if (assigned_to) {
    const investigator = store.users.find(u => u.id === assigned_to);
    if (!investigator) {
      return res.status(404).json({ error: "Investigator not found." });
    }
    investigatorName = investigator.name;
    report.assigned_to = assigned_to;
    report.assigned_to_name = investigatorName;
  } else {
    report.assigned_to = null;
    report.assigned_to_name = null;
  }

  saveDBStore(store);

  // Log secure audit trail
  logAudit(
    actorId,
    actorName,
    "ASSIGN_REPORT",
    "reports",
    reportId,
    investigatorName 
      ? `Assigned report to investigator ${investigatorName}.` 
      : "Removed investigator assignment from report."
  );

  res.json({
    message: "Assignment updated successfully.",
    report
  });
});

// API 7. GET USERS LIST (FOR ASSIGNMENT SELECTION)
app.get("/api/users", (req, res) => {
  const store = getDBStore();
  res.json(store.users);
});

// API 8. GET SECURE AUDIT LOGS (ADMIN VIEW)
app.get("/api/audit-logs", (req, res) => {
  const store = getDBStore();
  // Return the complete list, sorted latest first
  res.json(store.audit_logs);
});

// API 9. SEED DATABASE TO INITIAL STATE
app.post("/api/reports/seed", (req, res) => {
  const { actorId, actorName } = req.body;
  const initialStore = {
    users: DEFAULT_USERS,
    reports: INITIAL_REPORTS,
    evidence: INITIAL_EVIDENCE,
    status_history: INITIAL_STATUS_HISTORY,
    audit_logs: INITIAL_AUDIT_LOGS
  };
  saveDBStore(initialStore);
  
  logAudit(
    actorId || "u1", 
    actorName || "Admin SecOps", 
    "SEED_DB", 
    "reports", 
    "multiple", 
    "Incident database reset and pre-seeded with 3 mock records for academic demonstration."
  );

  res.json({ message: "Database successfully pre-seeded with academic defense test data." });
});

// API 10. EXPORT REPORT CASE FILE
app.post("/api/reports/export", (req, res) => {
  const { reportId, format, actorId, actorName } = req.body;
  if (!reportId || !format) {
    return res.status(400).json({ error: "reportId and format are required." });
  }

  const store = getDBStore();
  const report = store.reports.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: "Report not found." });
  }

  const history = store.status_history.filter(sh => sh.report_id === reportId);
  const evidenceList = store.evidence.filter(e => e.report_id === reportId);

  logAudit(
    actorId || "anonymous",
    actorName || "Public Reporter",
    "EXPORT_CASE_FILE",
    "reports",
    reportId,
    `Exported case file for report ${report.tracking_ref} in ${format.toUpperCase()} format.`
  );

  if (format === "csv") {
    // Generate CSV content
    let csv = "KEY,VALUE\n";
    csv += `Tracking Ref,${report.tracking_ref}\n`;
    csv += `Attack Type,${report.attack_type}\n`;
    csv += `Severity,${report.severity}\n`;
    csv += `Status,${report.status}\n`;
    csv += `Affected System,${report.affected_system}\n`;
    csv += `Reporter Name,${report.reporter_name}\n`;
    csv += `Created At,${report.created_at}\n`;
    csv += `Assigned To,${report.assigned_to_name || "Unassigned"}\n\n`;

    csv += "STATUS TIMELINE HISTORY\n";
    csv += "Timestamp,Old Status,New Status,Changed By,Note\n";
    for (const h of history) {
      csv += `"${h.changed_at}","${h.old_status}","${h.new_status}","${h.changed_by_name}","${h.note.replace(/"/g, '""')}"\n`;
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=case_${report.tracking_ref}.csv`);
    return res.send(csv);
  }

  // Fallback default JSON representation for document overview
  res.json({
    exported_at: new Date().toISOString(),
    case_reference: report.tracking_ref,
    report,
    evidenceList,
    history
  });
});

// Lazy-loaded Gemini AI client to prevent crash if key is temporarily missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment. Please add it via Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}


// 1. HEALTHCHECK API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    apiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 2. SIMULATED IP ROUTE TRACE GENERATOR
// Given an IP, DNS host, or pre-configured simulation template, return detailed traceroute hops
app.post("/api/trace/hops", (req, res) => {
  try {
    const { target, profile } = req.body;
    const ipTarget = target || "8.8.8.8";

    // Set up some realistic traceroute hops based on profiles
    const locationPool = [
      { city: "San Jose", country: "United States", lat: 37.3382, lng: -121.8863 },
      { city: "New York", country: "United States", lat: 40.7128, lng: -74.0060 },
      { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
      { city: "Frankfurt", country: "Germany", lat: 50.1109, lng: 8.6821 },
      { city: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
      { city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
      { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
      { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
      { city: "Beijing", country: "China", lat: 39.9042, lng: 116.4074 },
      { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 }
    ];

    // Determine target location & category based on target name or profile
    let isSuspicious = false;
    let threatCategory = "Clean";
    let country = "United States";
    let city = "Ashburn";
    let lat = 39.0438;
    let lng = -77.4874;
    let isp = "Amazon Web Services, Inc.";
    let asn = "AS16509";

    const p = (profile || "").toLowerCase();
    if (p === "ddos" || ipTarget.startsWith("185.") || ipTarget.includes("botnet")) {
      isSuspicious = true;
      threatCategory = "Botnet Command Node";
      country = "Russia";
      city = "St Petersburg";
      lat = 59.9343;
      lng = 30.3351;
      isp = "Neva Network Telecom";
      asn = "AS49231";
    } else if (p === "sqli" || ipTarget.startsWith("103.") || ipTarget.includes("exploit")) {
      isSuspicious = true;
      threatCategory = "SQL Injection Intruder (Tor Exit Node)";
      country = "Netherlands";
      city = "Amsterdam";
      lat = 52.3676;
      lng = 4.9041;
      isp = "Tor-Leased Infrastructure NL";
      asn = "AS19551";
    } else if (p === "bruteforce" || ipTarget.startsWith("45.") || ipTarget.includes("brute")) {
      isSuspicious = true;
      threatCategory = "Brute Force Scanner";
      country = "China";
      city = "Shenzhen";
      lat = 22.5431;
      lng = 114.0579;
      isp = "Chinanet Guangdong Province Network";
      asn = "AS4134";
    } else if (p === "ransomware" || ipTarget.startsWith("91.") || ipTarget.includes("ransom")) {
      isSuspicious = true;
      threatCategory = "Ransomware Command & Control";
      country = "Ukraine";
      city = "Kyiv";
      lat = 50.4501;
      lng = 30.5234;
      isp = "UkrNet ISP Backbone";
      asn = "AS21219";
    } else if (p === "phishing" || ipTarget.startsWith("198.") || ipTarget.includes("phish")) {
      isSuspicious = true;
      threatCategory = "Phishing Campaign Host";
      country = "Brazil";
      city = "Sao Paulo";
      lat = -23.5505;
      lng = -46.6333;
      isp = "Telefônica Brasil S.A.";
      asn = "AS27699";
    }

    // Generate beautiful 6-hop path tracing leading to target
    const hops = [
      {
        hop: 1,
        ip: "192.168.1.1",
        host: "local.gateway.internal",
        latency: 1.2,
        location: "Internal Security Gateway",
        lat: 37.7749, // Starting relative SF/US locale
        lng: -122.4194,
        isp: "Local LAN",
        status: "Clean",
        info: "Default Gateway / Intrusion Detection System active.",
      },
      {
        hop: 2,
        ip: "10.0.4.21",
        host: "edge.dmz.firewall",
        latency: 2.8,
        location: "DMZ Edge Proxy",
        lat: 37.7833,
        lng: -122.4167,
        isp: "Enterprise Boundary",
        status: "Clean",
        info: "Palo Alto Networks Next-Gen Firewall. No packet anomalies.",
      },
      {
        hop: 3,
        ip: "172.56.24.110",
        host: "cr01.sfo.ca.local-isp.net",
        latency: 12.4,
        location: "San Francisco, CA, USA",
        lat: 37.7749,
        lng: -122.4194,
        isp: "Comcast Enterprise Backbone",
        status: "Clean",
        info: "Tier-1 Regional Routing ISP Gateway.",
      },
      {
        hop: 4,
        ip: "64.233.174.45",
        host: "core.sea-edge-backbone.net",
        latency: 24.1,
        location: "Seattle, WA, USA",
        lat: 47.6062,
        lng: -122.3321,
        isp: "Global Transit Edge",
        status: "Clean",
        info: "Transit node reporting standard latency profiles.",
      },
      {
        hop: 5,
        ip: isSuspicious ? "109.201.133.12" : "151.101.12.14",
        host: isSuspicious ? "proxy.transit.node-ocean.net" : "cdn-edge-fastly.net",
        latency: isSuspicious ? 112.5 : 45.3,
        location: isSuspicious ? "Frankfurt, Germany" : "New York, NY, USA",
        lat: isSuspicious ? 50.1109 : 40.7128,
        lng: isSuspicious ? 8.6821 : -74.0060,
        isp: isSuspicious ? "Oceanic Transit Corp" : "Fastly CDN Network",
        status: isSuspicious ? "Suspicious" : "Clean",
        info: isSuspicious 
          ? "Flagged transit node. Frequent routing for encapsulated SSH tunnels." 
          : "Enterprise Edge Cache CDN Layer. Low latency hops.",
      },
      {
        hop: 6,
        ip: ipTarget,
        host: `host-${ipTarget.replace(/\./g, "-")}.node-target.com`,
        latency: isSuspicious ? 218.4 : 64.9,
        location: `${city}, ${country}`,
        lat: lat,
        lng: lng,
        isp: isp,
        status: isSuspicious ? "Flagged" : "Clean",
        info: isSuspicious 
          ? `WARNING: High threat risk node classified as ${threatCategory}.`
          : "Target Node responding normally within expected margins.",
      }
    ];

    res.json({
      target: ipTarget,
      profile,
      severity: isSuspicious ? "High Risk" : "Low Risk",
      hops,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. AI LOG ANALYSIS & FORENSICS API
app.post("/api/trace/analyze", async (req, res) => {
  try {
    const { logData, selectedAttackType } = req.body;
    if (!logData || logData.trim().length === 0) {
      return res.status(400).json({ error: "Log data content is required." });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are an elite Incident Response Lead and SOC Level 3 Analyst specializing in forensic log trace analysis. 
Analyze the provided log dump or packet description, detect cyberattack vector patterns, identify suspicious nodes, outline the timeline, and generate actionable mitigations.

You MUST respond strictly in valid JSON matching this schema:
{
  "attackType": "String (e.g. DDoS Flood Attack, SQL Injection Intrusion, SSH Brute Force, etc.)",
  "severity": "String (CRITICAL, HIGH, MEDIUM, or LOW)",
  "confidenceScore": Number (0-100),
  "summary": "String (1-2 paragraph professional CISO summary of the threat and business risk)",
  "attackerInfo": {
    "ip": "String (Detected Source IP)",
    "country": "String (Geographic Source)",
    "isp": "String (ISP/Network Name)",
    "asn": "String (e.g. AS12345)",
    "threatLevel": "String (Critical, Suspicious, Safe)"
  },
  "compromisedTarget": "String (Primary targeted system, service, or port)",
  "anomaliesFound": ["String describing anomalous logs/behaviors found"],
  "timeline": [
    {
      "timestamp": "ISO Date or Relative log timestamp",
      "event": "Description of attack phase",
      "level": "String (Info, Warning, Critical)"
    }
  ],
  "mitigationSteps": [
    {
      "action": "Remediation Action Title",
      "details": "Clear technical deployment steps",
      "priority": "String (Immediate, High, Medium, or Low)"
    }
  ]
}`;

    const prompt = `Please analyze the following cyber threat logs/trace:
Attack Context Profile: ${selectedAttackType || "Unknown Trace Profile"}
Log Payload:
"""
${logData}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["attackType", "severity", "confidenceScore", "summary", "attackerInfo", "compromisedTarget", "anomaliesFound", "timeline", "mitigationSteps"],
          properties: {
            attackType: { type: Type.STRING },
            severity: { type: Type.STRING },
            confidenceScore: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            attackerInfo: {
              type: Type.OBJECT,
              required: ["ip", "country", "isp", "asn", "threatLevel"],
              properties: {
                ip: { type: Type.STRING },
                country: { type: Type.STRING },
                isp: { type: Type.STRING },
                asn: { type: Type.STRING },
                threatLevel: { type: Type.STRING }
              }
            },
            compromisedTarget: { type: Type.STRING },
            anomaliesFound: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["timestamp", "event", "level"],
                properties: {
                  timestamp: { type: Type.STRING },
                  event: { type: Type.STRING },
                  level: { type: Type.STRING }
                }
              }
            },
            mitigationSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["action", "details", "priority"],
                properties: {
                  action: { type: Type.STRING },
                  details: { type: Type.STRING },
                  priority: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty analysis generated by AI model.");
    }

    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. INTERACTIVE THREAT PLAYBOOK GENERATOR
app.post("/api/trace/playbook", async (req, res) => {
  try {
    const { threatType, environment } = req.body;
    if (!threatType) {
      return res.status(400).json({ error: "Threat type is required to generate playbook." });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are a certified cyber intelligence incident responder (GCIH / CISSP).
Given a cyber threat vector and user's technical environment, generate a highly detailed, professional, incident-response action plan (Playbook).
Format the response strictly as valid JSON using the following structure:
{
  "title": "Incident Response Playbook: SSH Brute Force Mitigation",
  "phase_identification": ["Detection strategies and alert rules"],
  "phase_containment": ["Immediate short-term network containment controls"],
  "phase_eradication": ["Permanent cleanup and threat removal steps"],
  "phase_recovery": ["Restoration and service validation checks"],
  "firewall_rules_snippet": "CLI command / rule configuration sample (e.g. iptables, pfSense, nginx, AWS SG)",
  "post_incident_review": "Proactive hardening actions to prevent re-occurrence"
}`;

    const prompt = `Generate a comprehensive incident playbook for:
Threat Type: ${threatType}
Environment Host: ${environment || "Enterprise Linux & Web Server Behind Reverse Proxy (Nginx / Cloudflare)"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "phase_identification", "phase_containment", "phase_eradication", "phase_recovery", "firewall_rules_snippet", "post_incident_review"],
          properties: {
            title: { type: Type.STRING },
            phase_identification: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            phase_containment: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            phase_eradication: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            phase_recovery: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            firewall_rules_snippet: { type: Type.STRING },
            post_incident_review: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty playbook response from Gemini API.");
    }

    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("Playbook generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5. INTERACTIVE SECOPS CHATBOT API
app.post("/api/trace/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: "Message content is required." });
  }

  try {
    let ai;
    try {
      ai = getGeminiClient();
    } catch (e) {
      // Throw error to trigger our rich fallback response
      throw new Error("No API key");
    }

    const systemPrompt = `You are a helpful, expert SecOps AI assistant. You help SOC analysts investigate threats, understand security logs, write firewall rules, and follow compliance policies. Provide concise, highly professional responses with clear formatting, bullet points, and code/CLI commands where useful. Keep answers highly relevant to security analysts.`;

    const chatContents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        chatContents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      }
    }
    chatContents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    const text = response.text;
    res.json({ response: text });
  } catch (error: any) {
    // Robust fallback response for offline sandbox mode
    const fallbackAnswers: Record<string, string> = {
      "lockbit": `LockBit is one of the most prolific ransomware-as-a-service (RaaS) families globally. To contain it:
1. **Network Isolation**: Instantly isolate the infected machine from the subnet to prevent lateral movement (via SMB, PsExec, or WMI).
2. **Disable SMB v1/v2**: If not required, disable older SMB versions which are prone to exploitation.
3. **Check Task Scheduler**: Look for persistent tasks running unrecognized scripts or executables in \`C:\\Users\\Public\` or \`C:\\ProgramData\`.`,
      "ddos": `In the event of an active Layer 7 DDoS flood:
1. **Web Application Firewall (WAF)**: Activate rate-limiting rules at the CDN tier. Drop connections exceeding 20 requests/sec per IP.
2. **IP Reputation**: Challenge traffic originating from hosting providers or known Tor/Proxy networks using JS challenges.
3. **Horizontal Scaling**: Ensure your upstream load balancers have auto-scaling rules triggered when CPU usage crosses 75%.`,
      "sqli": `SQL Injection remains a critical database risk. Fix steps:
1. **Parameterized Queries**: Convert all concatenated string statements into parameterized queries or use a secure ORM.
2. **Input Validation**: Enforce strict alphanumeric character-whitelists on fields like username, email, and password.
3. **Least Privilege**: Ensure the database user has only read/write access to specific tables rather than full \`superuser\` or administrative privileges.`
    };

    const msgLower = message.toLowerCase();
    let reply = `[Offline Sandbox Mode] I received your inquiry: "${message}". Connect your Gemini API Key in Settings to get real-time AI assessments.\n\nHere is a SecOps guidance outline for this scenario:\n\n`;

    if (msgLower.includes("lockbit") || msgLower.includes("ransom")) {
      reply += fallbackAnswers.lockbit;
    } else if (msgLower.includes("ddos") || msgLower.includes("flood")) {
      reply += fallbackAnswers.ddos;
    } else if (msgLower.includes("sql") || msgLower.includes("sqli")) {
      reply += fallbackAnswers.sqli;
    } else {
      reply += `1. **Investigate Log Sources**: Check auth logs, application routers, and cloud access logs for spikes.\n2. **Isolate Suspected IPs**: Apply a null-route at your Edge VPC Router for any aggressive external hosts.\n3. **Audit IAM Permissions**: Ensure credentials or keys used during the anomaly have their sessions revoked and rotated immediately.`;
    }

    res.json({ response: reply });
  }
});

// START VITE OR PRODUCTION STATIC FILE SERVING
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Cyber Server] Active & listening on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Server bootstrap failed:", err);
});
