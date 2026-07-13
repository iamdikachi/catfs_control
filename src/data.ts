import { AttackProfile } from "./types";

export const ATTACK_PROFILES: AttackProfile[] = [
  {
    id: "ddos-http-flood",
    name: "DDoS HTTP Flood on Main Gateway",
    type: "ddos",
    severity: "Critical",
    targetIp: "185.220.101.99",
    description: "Simulates thousands of botnet-orchestrated concurrent connections flooding the primary application load balancer, causing severe CPU exhaustion and latency spikes.",
    logSample: `[2026-07-11 08:50:01] INFO: TCP Handshake initiated from bot-node-185-220-101-99.net (185.220.101.99:54231)
[2026-07-11 08:50:01] WARNING: Rate limit exceeded for IP 185.220.101.99. Current count: 1250 req/sec. Limit: 100 req/sec.
[2026-07-11 08:50:02] ALERT: High load on /api/v1/auth/session - CPU 98%, Mem 91%
[2026-07-11 08:50:02] INFO: Request header: User-Agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" Connection="keep-alive"
[2026-07-11 08:50:02] INFO: Request header: Accept-Encoding="gzip, deflate" Cache-Control="no-cache"
[2026-07-11 08:50:02] ERROR: Gateway Timeout 504 on upstream application-node-03
[2026-07-11 08:50:03] INFO: Syn-Flood signature detected. SYN packets received: 14,350/sec. Block action recommended.
[2026-07-11 08:50:03] CRITICAL: System Gateway responsive state: UNRESPONSIVE. Packet drop rate: 42%`
  },
  {
    id: "sqli-exploit",
    name: "SQL Injection Probe on Users API",
    type: "sqli",
    severity: "High",
    targetIp: "103.45.201.12",
    description: "Simulates malicious query payload injections attempting to bypass authentication, expose password hashes, and leak system tables.",
    logSample: `[2026-07-11 08:51:14] INFO: Connection accepted from tor-exit-node.nl (103.45.201.12:43110) to https://api.enterprise.com/v1/users/login
[2026-07-11 08:51:14] INFO: Request payload: {"email": "admin@enterprise.com", "password": "' OR '1'='1 --"}
[2026-07-11 08:51:15] WARN: Postgres SQL Exception generated: "terminated by quote mismatch" near column 'password'
[2026-07-11 08:51:17] INFO: Request payload: {"email": "admin@enterprise.com", "password": "' UNION SELECT username, password_hash, salt FROM users; --"}
[2026-07-11 08:51:18] ALERT: Database leak prevention filter triggered. Blocked query string containing keywords: "UNION SELECT", "password_hash".
[2026-07-11 08:51:19] INFO: Connection dropped for IP 103.45.201.12. Session invalidated.`
  },
  {
    id: "ssh-brute-force",
    name: "SSH Root Brute-Force Scanning",
    type: "bruteforce",
    severity: "High",
    targetIp: "45.14.220.67",
    description: "Simulates automated dictionary attacks hammering SSH port 22 in rapid succession trying common credentials like 'admin', 'root', and 'support'.",
    logSample: `Jul 11 08:52:10 enterprise-bastion sshd[23120]: Invalid user admin from 45.14.220.67 port 59003
Jul 11 08:52:11 enterprise-bastion sshd[23120]: Connection closed by authenticating user admin 45.14.220.67 port 59003 [preauth]
Jul 11 08:52:12 enterprise-bastion sshd[23128]: Invalid user root from 45.14.220.67 port 59012
Jul 11 08:52:12 enterprise-bastion sshd[23128]: Failed password for invalid user root from 45.14.220.67 port 59012 ssh2
Jul 11 08:52:14 enterprise-bastion sshd[23136]: Failed password for invalid user support from 45.14.220.67 port 59024 ssh2
Jul 11 08:52:15 enterprise-bastion sshd[23144]: Repeated failed attempts from 45.14.220.67: 42 failures in 15 seconds.
Jul 11 08:52:16 enterprise-bastion secure_logs: ALERT: SSH brute force pattern detected. Initiating block recommendations on port 22.`
  },
  {
    id: "ransomware-c2",
    name: "Ransomware Command & Control beaconing",
    type: "ransomware",
    severity: "Critical",
    targetIp: "91.228.140.5",
    description: "Simulates an active internal workstation talking back to an external ransomware server, signaling encryption readiness and uploading file inventories.",
    logSample: `[2026-07-11 08:53:01] INFO: DNS Lookup request for domain: update-system-security-patch.xyz. Host: internal-accounting-pc-12 (192.168.1.105)
[2026-07-11 08:53:01] WARNING: Domain update-system-security-patch.xyz resolved to unassigned block IP 91.228.140.5 (Kyiv, UA)
[2026-07-11 08:53:02] INFO: TCP socket opened from 192.168.1.105:49182 -> 91.228.140.5:443
[2026-07-11 08:53:02] ALERT: Payload analysis: High entropy data chunk (3.2MB) transmitted. Suspected AES-256 encrypted file list payload.
[2026-07-11 08:53:03] WARNING: Firewall deep packet inspection flags suspicious outbound HTTPS metadata matching "LockBit V3" beacon intervals.
[2026-07-11 08:53:04] ALERT: Command beacon received: "SHUTDOWN_READY". LockBit payload on host confirmed.`
  },
  {
    id: "phishing-redirect",
    name: "Phishing Redirect & Credential Harvesting",
    type: "phishing",
    severity: "Medium",
    targetIp: "198.199.12.8",
    description: "Simulates emails redirecting corporate employees to lookalike clone login domains hosted on suspicious cloud VPS networks.",
    logSample: `[2026-07-11 08:54:01] INFO: SMTP inbound mail server parsed message ID <msg-541289@external.com>
[2026-07-11 08:54:02] WARN: Email SPF / DKIM alignment failed. Domain masqueraded as: HR-Payroll <payroll@enterprise-update.com>
[2026-07-11 08:54:02] INFO: Link detected in body: http://verify-payroll-login-enterprise.com/oauth
[2026-07-11 08:54:02] WARNING: Domain verify-payroll-login-enterprise.com resolved to host VPS IP 198.199.12.8 (Brazil)
[2026-07-11 08:54:03] ALERT: User emmanuel.n@enterprise.com clicked suspicious link. Redirection active.
[2026-07-11 08:54:04] INFO: Web Proxy injected warning screen and isolated the user session.`
  }
];

export const COMMON_THREATS = [
  {
    type: "DDoS Flood Attack",
    description: "Distributed Denial of Service floods networks or servers with excessive traffic to overwhelm bandwidth, exhausting server resources.",
    mitigations: [
      "Implement CDN rate limiting and Anycast IP routing.",
      "Enable Cloudflare/WAF Under Attack protection.",
      "Block traffic from high-risk hosting subnets."
    ]
  },
  {
    type: "SQL Injection (SQLi)",
    description: "Infiltration vulnerability where attackers inject malicious SQL inputs into input fields to query databases without authorization.",
    mitigations: [
      "Always use parametrized queries or ORMs (never concatenate raw user input).",
      "Sanitize inputs using strict regular expression validators.",
      "Deploy WAF rules specifically filtering SELECT, UNION, and quotes."
    ]
  },
  {
    type: "SSH Brute Force",
    description: "Automated attempt to access server terminals by logging in with thousands of username/password dictionary combinations on port 22.",
    mitigations: [
      "Disable password authentication completely; require cryptographic SSH key pairs.",
      "Deploy Fail2Ban to automatically ban IPs with multiple failed attempts.",
      "Change default SSH port 22 to a non-standard high-range port."
    ]
  },
  {
    type: "Ransomware Command & Control",
    description: "Compromised internal host communicating with external command servers to download encryption payloads, exfiltrate files, or get keys.",
    mitigations: [
      "Implement DNS sinkholing for known threat domains.",
      "Segment corporate subnets to prevent lateral spreading of malware.",
      "Enforce Endpoint Detection and Response (EDR) active host isolation."
    ]
  },
  {
    type: "Phishing Campaign Redirect",
    description: "Masqueraded social engineering campaigns directing users to cloned portal links to steal passwords, session tokens, or API keys.",
    mitigations: [
      "Enable strict SPF, DKIM, and DMARC enforcement on corporate email servers.",
      "Enforce mandatory hardware security keys (FIDO2) for MFA logins.",
      "Deploy active cloud proxy URL safety categorization lists."
    ]
  }
];
