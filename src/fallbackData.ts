import { AnalysisResult, PlaybookResult } from "./types";

export const FALLBACK_REPORTS: Record<string, AnalysisResult> = {
  ddos: {
    attackType: "Distributed Denial of Service (HTTP GET Flood)",
    severity: "CRITICAL",
    confidenceScore: 98,
    summary: "The application gateway is experiencing an active, highly coordinated Layer 7 HTTP GET Flood. Over 14,000 concurrent TCP requests are targeting key authentication routes, causing severe upstream container CPU spikes (98%) and cascading 504 gateway timeouts. Immediate rate limiting and CDN IP-reputation blocking are recommended.",
    attackerInfo: {
      ip: "185.220.101.99",
      country: "Germany",
      isp: "Tor Exit Infrastructure DE",
      asn: "AS206342",
      threatLevel: "Critical"
    },
    compromisedTarget: "Primary Application Load Balancer (/api/v1/auth/session)",
    anomaliesFound: [
      "SYN Flood pattern detected with over 14,350 SYN packets/sec.",
      "Identical User-Agent headers across high volume incoming connections.",
      "Repeated requests bypass local caching layer to deplete backend connection pool."
    ],
    timeline: [
      { timestamp: "08:50:01", event: "Initial anomaly detection on gateway port 443", level: "Info" },
      { timestamp: "08:50:01", event: "Connection volume spikes 12x above baseline", level: "Warning" },
      { timestamp: "08:50:02", event: "Authentication handler CPU usage exceeds critical threshold (95%)", level: "Critical" },
      { timestamp: "08:50:03", event: "Cascading 504 gateway timeouts reported across upstream web nodes", level: "Critical" }
    ],
    mitigationSteps: [
      { action: "Activate Cloudflare Under-Attack Mode", details: "Instantly force JS challenges on all incoming web traffic.", priority: "Immediate" },
      { action: "Block Subnet via Security Group", details: "Drop all TCP traffic from 185.220.0.0/16 at the router level.", priority: "Immediate" },
      { action: "Throttle Authentication Endpoint", details: "Implement strict Redis-backed rate limiting of 5 req/min per IP.", priority: "High" }
    ]
  },
  sqli: {
    attackType: "SQL Injection (Authentication Bypass Attempt)",
    severity: "HIGH",
    confidenceScore: 95,
    summary: "An attacker is executing advanced SQL Injection probes targeting the login credentials payload. Probes utilize classic OR-operators and UNION-select clauses aiming to extract password hashes. Although local database shields caught and restricted the malicious queries, the target system remains under heavy scanner interest.",
    attackerInfo: {
      ip: "103.45.201.12",
      country: "Netherlands",
      isp: "Tor Exit Node Network NL",
      asn: "AS19551",
      threatLevel: "Suspicious"
    },
    compromisedTarget: "User Authentication PostgreSQL Database",
    anomaliesFound: [
      "Database parse exception triggered: quote mismatch on password field.",
      "Inbound payload containing explicit raw SQL strings (' OR '1'='1 --).",
      "Tor exit node IP matches known active threat actor lists."
    ],
    timeline: [
      { timestamp: "08:51:14", event: "TCP connection established from known Tor Exit Node", level: "Info" },
      { timestamp: "08:51:14", event: "Authentication payload fails standard validation parser", level: "Warning" },
      { timestamp: "08:51:15", event: "SQL Exception generated and logged to audit vault", level: "Warning" },
      { timestamp: "08:51:18", event: "Database defense filter intercepts SELECT UNION payload", level: "Critical" }
    ],
    mitigationSteps: [
      { action: "Quarantine Attacker IP", details: "Block Tor exit node IP 103.45.201.12 via Edge Firewall rules.", priority: "Immediate" },
      { action: "Enforce Query Parameterization", details: "Audit Auth Service models to ensure ORM handles all variable escaping.", priority: "High" },
      { action: "Rotate Database Secrets", details: "Preemptively rotate database session keys and auth service passwords.", priority: "Medium" }
    ]
  },
  bruteforce: {
    attackType: "SSH SSH-2 Dictionary Brute-Force",
    severity: "HIGH",
    confidenceScore: 92,
    summary: "Automated dictionary scanning is hammering SSH terminal access on port 22 of the bastion subnet. Over 42 login attempts occurred in a 15-second span using default and administrative usernames ('root', 'admin'). IP has been temporary blocked by local daemon, but permanent network restrictions are advised.",
    attackerInfo: {
      ip: "45.14.220.67",
      country: "China",
      isp: "Chinanet Guangdong Network",
      asn: "AS4134",
      threatLevel: "Suspicious"
    },
    compromisedTarget: "Enterprise Bastion Server (SSH Port 22)",
    anomaliesFound: [
      "Rapid sequence of failed passwords for administrative usernames.",
      "Connection frequency exceeds secure human configuration parameters.",
      "High volume login failures occurring across short pre-auth windows."
    ],
    timeline: [
      { timestamp: "08:52:10", event: "SSHD socket connection received from external subnet", level: "Info" },
      { timestamp: "08:52:11", event: "Authentication failure reported for username 'admin'", level: "Warning" },
      { timestamp: "08:52:12", event: "Authentication failure reported for username 'root'", level: "Warning" },
      { timestamp: "08:52:15", event: "Brute force alarm triggers local fail2ban quarantine", level: "Critical" }
    ],
    mitigationSteps: [
      { action: "Block Scanner Subnet", details: "Add 45.14.220.0/24 to local iptables drop rule.", priority: "Immediate" },
      { action: "Disable Password Auth", details: "Configure sshd_config to allow PubKey authentication only.", priority: "High" },
      { action: "Modify Default SSH Port", details: "Migrate bastion SSH service to non-standard high port (e.g. 2222).", priority: "Medium" }
    ]
  },
  ransomware: {
    attackType: "Ransomware Command & Control Beaconing",
    severity: "CRITICAL",
    confidenceScore: 99,
    summary: "Active infection alert. An internal workstation is communicating with a known ransomware domain via outbound HTTPS queries. Deep packet inspection detected periodic, high-entropy cryptographic payloads matching ransomware beacon behavior, culminating in a critical 'SHUTDOWN_READY' instruction. Host isolation is strictly required.",
    attackerInfo: {
      ip: "91.228.140.5",
      country: "Ukraine",
      isp: "UkrNet Telecom Operator",
      asn: "AS21219",
      threatLevel: "Critical"
    },
    compromisedTarget: "Internal Accounting Workstation (192.168.1.105)",
    anomaliesFound: [
      "Outbound DNS request targeting known LockBit command domain.",
      "High-entropy encrypted file payload (3.2MB) uploaded via secure tunnel.",
      "Workstation processes attempting to query shadow volumes and network shares."
    ],
    timeline: [
      { timestamp: "08:53:01", event: "DNS query resolve exception for malicious C2 domain", level: "Warning" },
      { timestamp: "08:53:02", event: "Encrypted outbound communication established on port 443", level: "Warning" },
      { timestamp: "08:53:03", event: "High entropy payload exfiltration detected by DPI gateway", level: "Critical" },
      { timestamp: "08:53:04", event: "Ransomware client reports encryption preparation complete", level: "Critical" }
    ],
    mitigationSteps: [
      { action: "Isolate Compromised Host", details: "Disconnect 192.168.1.105 from the physical and Wi-Fi networks immediately.", priority: "Immediate" },
      { action: "Apply DNS Sinkhole", details: "Route update-system-security-patch.xyz to a dead-loop IP.", priority: "Immediate" },
      { action: "Terminate Active Active Directory Sessions", details: "Revoke auth tokens and lock accounts associated with the host.", priority: "High" }
    ]
  },
  phishing: {
    attackType: "Phishing Campaign & Credential Harvesting",
    severity: "MEDIUM",
    confidenceScore: 89,
    summary: "An inbound email mimicking administrative HR communications bypassed standard filters. The mail contained a cloned portal redirect link targeting company SSO credentials. One corporate user clicked the link, but local secure DNS proxies successfully redirected and isolated the browser tab.",
    attackerInfo: {
      ip: "198.199.12.8",
      country: "Brazil",
      isp: "Telefônica Brasil",
      asn: "AS27699",
      threatLevel: "Suspicious"
    },
    compromisedTarget: "Employee Identity Portal Credentials",
    anomaliesFound: [
      "Inbound email spoofing corporate domain without SPF/DKIM validation.",
      "Unassigned lookalike domain (verify-payroll-login-enterprise.com) hosted on external VPS.",
      "User session cookie transferred toward unauthorized destination."
    ],
    timeline: [
      { timestamp: "08:54:01", event: "Inbound SPF mismatch flagged by secure mail gateway", level: "Info" },
      { timestamp: "08:54:02", event: "Phishing link detected in email body", level: "Warning" },
      { timestamp: "08:54:03", event: "User clicks redirect link inside enterprise subnet", level: "Critical" },
      { timestamp: "08:54:04", event: "Internal DNS proxy intercepts redirect and initiates isolation", level: "Warning" }
    ],
    mitigationSteps: [
      { action: "Revoke SSO Session Tokens", details: "Invalidate active web tokens for emmanuel.n@enterprise.com.", priority: "Immediate" },
      { action: "Flag Domain on Mail Filters", details: "Add enterprise-update.com and verify-payroll domains to blocklist.", priority: "High" },
      { action: "Incorporate Security Awareness Drill", details: "Enroll users who interacted with the link in spear-phishing retraining.", priority: "Low" }
    ]
  }
};

export const FALLBACK_PLAYBOOKS: Record<string, PlaybookResult> = {
  "DDoS Flood Attack": {
    title: "Incident Response Playbook: L7 DDoS Mitigation",
    phase_identification: [
      "Identify traffic spikes on Application Gateway metrics.",
      "Query access logs for high-frequency user-agent requests."
    ],
    phase_containment: [
      "Apply localized rate limits using Edge Web Application Firewall (WAF).",
      "Deploy Geo-Blocking filters on regions displaying abnormal connection volumes."
    ],
    phase_eradication: [
      "Block attacker Tor IP address blocks at the VPC Router boundary.",
      "Distribute system workloads across multiple auto-scaling availability zones."
    ],
    phase_recovery: [
      "Verify system latency curves return to the 50ms baseline.",
      "Re-enable standard web caching controls."
    ],
    firewall_rules_snippet: `# Nginx reverse proxy rate limit block
limit_req_zone $binary_remote_addr zone=ddos_limit:15m rate=10r/s;
server {
    location /api/v1/auth {
        limit_req zone=ddos_limit burst=5 nodelay;
        proxy_pass http://auth_backend;
    }
}
# Cloudflare WAF JSON expression:
# (http.request.uri.path contains "/api/" and cf.threat_score > 15)`,
    post_incident_review: "Migrate upstream endpoints to Cloudflare Anycast IPs and configure automated CDN caching for secure, non-database static responses."
  },
  "SQL Injection (SQLi)": {
    title: "Incident Response Playbook: SQLi Protection",
    phase_identification: [
      "Detect SQL query error exceptions in application logs.",
      "Monitor database thread pool for rapid connection exhaustion."
    ],
    phase_containment: [
      "Enforce Web Application Firewall (WAF) SQLi signature injection filters.",
      "Temporarily lock accounts identified as targets of continuous SQL exploitation."
    ],
    phase_eradication: [
      "Sanitize and validate all system payload controllers with regex inputs.",
      "Convert raw database queries to strict parameterized statement structures."
    ],
    phase_recovery: [
      "Restore database backups if any unauthorized tables were dropped.",
      "Perform a full vulnerability scanner audit on user authentication APIs."
    ],
    firewall_rules_snippet: `# Block common SQL injection keywords via AWS WAF Custom Rule
# Pattern matches UNION, SELECT, and quote injection
{
  "FieldToMatch": { "Type": "QUERY_STRING" },
  "TextTransformations": [ { "Type": "URL_DECODE" } ],
  "RegexString": "(?i)(union|select|insert|delete|drop|update|'|--)"
}`,
    post_incident_review: "Implement Prisma or Drizzle ORM as a mandatory data layer, and integrate SonarQube static application security testing (SAST) into the CI/CD pipeline."
  },
  "SSH Brute Force": {
    title: "Incident Response Playbook: SSH Bastion Hardening",
    phase_identification: [
      "Monitor secure syslog files (e.g. /var/log/auth.log) for repetitive failed passwords.",
      "Track system metrics for sudden spikes in socket creations on port 22."
    ],
    phase_containment: [
      "Quarantine scanner IPs dynamically using fail2ban modules.",
      "Enforce strict firewall rules restricting SSH ingress to specific corporate VPN subnets."
    ],
    phase_eradication: [
      "Disable password authentications completely in SSHD configurations.",
      "Remove inactive, unauthorized SSH keypairs from bastion hosts."
    ],
    phase_recovery: [
      "Validate secure key access and verify system logs report clean logins.",
      "Audit terminal history logs of administrator accounts."
    ],
    firewall_rules_snippet: `# UFW (Uncomplicated Firewall) block rules
sudo ufw deny from 45.14.220.67 to any port 22
# Secure sshd_config guidelines:
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
Port 2222`,
    post_incident_review: "Migrate traditional SSH endpoints to modern zero-trust cloud console tools like AWS Systems Manager (SSM) or Google Cloud IAP Tunneling."
  },
  "Ransomware Command & Control": {
    title: "Incident Response Playbook: Workstation Ransomware Isolation",
    phase_identification: [
      "Observe suspicious outbound beacons on DNS server query logs.",
      "Detect sudden, widespread high-entropy file system writes via EDR systems."
    ],
    phase_containment: [
      "Disconnect infected physical host 192.168.1.105 from the local network.",
      "Instruct DNS servers to sinkhole the malicious command domain."
    ],
    phase_eradication: [
      "Format workstation and execute full malware cleanup scans using deep offline tools.",
      "Reset Active Directory account credentials associated with the infected workstation."
    ],
    phase_recovery: [
      "Restore encrypted file vaults from secure, read-only cloud backups.",
      "Deploy fully updated antivirus and EDR packages to the target host before reconnection."
    ],
    firewall_rules_snippet: `# Block malicious C2 domain using Local BIND DNS Sinkholing
# Add to BIND config: /etc/bind/named.conf.local
zone "update-system-security-patch.xyz" {
    type master;
    file "/etc/bind/zones/blocked.db";
};
# blocked.db content points A record to 127.0.0.1`,
    post_incident_review: "Enforce strict local subnet isolation, blocking peer-to-peer workspace communication, and require offline daily immutable cloud backups."
  },
  "Phishing Campaign Redirect": {
    title: "Incident Response Playbook: Phishing Campaign Response",
    phase_identification: [
      "Track incoming email SPF/DKIM mismatches using mail relays.",
      "Analyze email server attachments and redirecting hyper-links."
    ],
    phase_containment: [
      "Purge duplicate emails with similar headers from all employee mailboxes.",
      "Block access to the harvested URL domains at the corporate DNS proxy tier."
    ],
    phase_eradication: [
      "Force-expire active OAuth tokens and SSO sessions for compromised accounts.",
      "Report lookalike VPS hosting providers to Registrar abuse lines for shutdown."
    ],
    phase_recovery: [
      "Verify MFA enrollment parameters on recovered user accounts.",
      "Monitor corporate Active Directory logins for unusual location anomalies."
    ],
    firewall_rules_snippet: `# Block phishing domain on Linux IPtables Squid Proxy
# Add domain to /etc/squid/blocked_domains.txt
# verify-payroll-login-enterprise.com
acl blocked_domains dstdomain "/etc/squid/blocked_domains.txt"
http_access deny blocked_domains`,
    post_incident_review: "Enforce mandatory security key tokens (FIDO2) which are cryptographically bound to exact URL domains, making credential harvesting ineffective."
  }
};
