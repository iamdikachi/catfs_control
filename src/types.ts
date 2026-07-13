export interface Hop {
  hop: number;
  ip: string;
  host: string;
  latency: number;
  location: string;
  lat: number;
  lng: number;
  isp: string;
  status: "Clean" | "Suspicious" | "Flagged";
  info: string;
}

export interface AttackerInfo {
  ip: string;
  country: string;
  isp: string;
  asn: string;
  threatLevel: string;
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  level: string;
}

export interface MitigationStep {
  action: string;
  details: string;
  priority: string;
}

export interface AnalysisResult {
  attackType: string;
  severity: string;
  confidenceScore: number;
  summary: string;
  attackerInfo: AttackerInfo;
  compromisedTarget: string;
  anomaliesFound: string[];
  timeline: TimelineEvent[];
  mitigationSteps: MitigationStep[];
}

export interface PlaybookResult {
  title: string;
  phase_identification: string[];
  phase_containment: string[];
  phase_eradication: string[];
  phase_recovery: string[];
  firewall_rules_snippet: string;
  post_incident_review: string;
}

export interface AttackProfile {
  id: string;
  name: string;
  type: "ddos" | "sqli" | "bruteforce" | "ransomware" | "phishing";
  severity: "High" | "Critical" | "Medium";
  targetIp: string;
  description: string;
  logSample: string;
}

// Academic Defense Cyber Incident Tracing System Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "Reporter" | "Investigator" | "Admin";
  created_at: string;
}

export interface IncidentReport {
  id: string;
  tracking_ref: string;
  reporter_id: string | null;
  reporter_name: string;
  reporter_contact: string;
  attack_type: string;
  description: string;
  affected_system: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Submitted" | "Under Review" | "Investigating" | "Resolved";
  created_at: string;
  assigned_to: string | null; // User id
  assigned_to_name: string | null; // User name
}

export interface EvidenceFile {
  id: string;
  report_id: string;
  file_name: string;
  file_type: "log" | "screenshot" | "pcap" | "other";
  content_summary: string; // Storing either trace log chunk or description
  uploaded_at: string;
}

export interface StatusHistoryItem {
  id: string;
  report_id: string;
  old_status: string;
  new_status: string;
  changed_by: string; // User id or "anonymous"
  changed_by_name: string; // User name or "Public Reporter"
  changed_at: string;
  note: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string; // User id or "anonymous"
  actor_name: string; // User name or "Public Reporter"
  action: string; // e.g. "SUBMIT_REPORT", "VIEW_REPORT", "UPDATE_STATUS", "LOGIN"
  target_table: string; // "reports", "users", "evidence", "status_history"
  target_id: string;
  timestamp: string;
  details?: string;
}
