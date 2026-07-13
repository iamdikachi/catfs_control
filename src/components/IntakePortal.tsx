import React, { useState } from "react";
import { AlertTriangle, Send, CheckCircle2, Clipboard, ShieldAlert, Cpu, Layers } from "lucide-react";

interface IntakePortalProps {
  onSuccess?: (trackingRef: string) => void;
}

export default function IntakePortal({ onSuccess }: IntakePortalProps) {
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [attackType, setAttackType] = useState("DDoS HTTP Flood");
  const [affectedSystem, setAffectedSystem] = useState("Main Application Load Balancer");
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [description, setDescription] = useState("");
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceType, setEvidenceType] = useState<"log" | "screenshot">("log");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !affectedSystem.trim()) {
      setErrorMsg("Please provide a description and affected system.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporter_name: isAnonymous ? "Anonymous Reporter" : reporterName,
          reporter_contact: isAnonymous ? "anonymous@secured-trace.org" : reporterContact,
          attack_type: attackType,
          description,
          affected_system: affectedSystem,
          severity,
          evidence_text: evidenceText,
          evidence_type: evidenceType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report");
      }

      setSubmittedRef(data.report.tracking_ref);
      if (onSuccess) onSuccess(data.report.tracking_ref);
      
      // Clear fields
      setReporterName("");
      setReporterContact("");
      setDescription("");
      setEvidenceText("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while submitting the report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (submittedRef) {
      navigator.clipboard.writeText(submittedRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const PRESET_LOGS = {
    ddos: `[2026-07-11 08:50:01] INFO: TCP Handshake initiated from bot-node-185-220-101-99.net (185.220.101.99:54231)
[2026-07-11 08:50:01] WARNING: Rate limit exceeded for IP 185.220.101.99. Current count: 1250 req/sec. Limit: 100 req/sec.
[2026-07-11 08:50:02] ALERT: High load on /api/v1/auth/session - CPU 98%, Mem 91%`,
    sqli: `[2026-07-11 08:51:14] INFO: Connection accepted from tor-exit-node.nl (103.45.201.12:43110) to login portal
[2026-07-11 08:51:14] INFO: Request payload: {"email": "admin@enterprise.com", "password": "' OR '1'='1 --"}
[2026-07-11 08:51:15] WARN: Postgres SQL Exception generated: "terminated by quote mismatch" near column 'password'`,
    ssh: `Jul 11 08:52:10 enterprise-bastion sshd[23120]: Invalid user admin from 45.14.220.67 port 59003
Jul 11 08:52:11 enterprise-bastion sshd[23120]: Connection closed by authenticating user admin [preauth]
Jul 11 08:52:12 enterprise-bastion sshd[23128]: Invalid user root from 45.14.220.67 port 59012`,
    ransom: `[2026-07-11 08:53:01] INFO: DNS Lookup request for domain: update-system-security-patch.xyz. Host: internal-accounting-pc-12
[2026-07-11 08:53:02] ALERT: Payload analysis: High entropy data chunk (3.2MB) transmitted. Suspected AES-256 encrypted file list payload.
[2026-07-11 08:53:04] ALERT: Command beacon received: "SHUTDOWN_READY". LockBit payload confirmed.`,
    phish: `[2026-07-11 08:54:01] INFO: SMTP inbound mail server parsed message ID <msg-541289@external.com>
[2026-07-11 08:54:02] WARN: Email SPF / DKIM alignment failed. Masqueraded as: HR-Payroll <payroll@enterprise-update.com>
[2026-07-11 08:54:03] ALERT: User emmanuel.n@enterprise.com clicked suspicious link: verify-payroll-login-enterprise.com`
  };

  const loadPresetEvidence = (type: keyof typeof PRESET_LOGS) => {
    setEvidenceText(PRESET_LOGS[type]);
    setEvidenceType("log");
  };

  return (
    <div className="bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-blue-600" />
          Public Secure Incident Intake Portal
        </h2>
        <p className="text-xs text-slate-500 mt-1 leading-normal">
          Section 5.1: Structured incident-reporting gateway. Victims or security organizations submit validated cyber-attack details. All submissions generate unique tracking references and are securely timestamped.
        </p>
      </div>

      {submittedRef ? (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-6 flex flex-col items-center text-center gap-4 animate-fade-in">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Incident Report Logged Successfully</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Your report has been securely registered in our system. Save your tracking reference below to track live investigation status, notes, and evidence logs without requiring login.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 font-mono text-slate-850 font-bold text-sm tracking-wider shadow-sm flex items-center gap-3">
            <span>{submittedRef}</span>
            <button 
              onClick={handleCopy}
              className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-50 transition-colors"
              title="Copy to clipboard"
            >
              <Clipboard className="w-4 h-4" />
            </button>
          </div>
          {copied && <span className="text-[10px] text-emerald-600 font-semibold font-mono">Reference copied to clipboard!</span>}

          <div className="flex gap-2.5 mt-2">
            <button
              onClick={() => setSubmittedRef(null)}
              className="text-slate-600 hover:text-slate-850 bg-slate-100 hover:bg-slate-200/80 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-150 p-3 rounded-lg text-rose-600 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Reporter Identification (Section 9: Anonymity Decision) */}
          <div className="bg-slate-50/65 border border-slate-200/60 p-4 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500">
                Reporter Identification
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous-toggle"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <label htmlFor="anonymous-toggle" className="text-xs text-slate-700 font-medium select-none cursor-pointer">
                  Submit Anonymously
                </label>
              </div>
            </div>

            {!isAnonymous ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-600">Organization or Name</span>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="e.g. Acme Corp CISO"
                    className="bg-white border border-slate-200 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required={!isAnonymous}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-600">Secure Contact Email</span>
                  <input
                    type="email"
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                    placeholder="e.g. security@acme.com"
                    className="bg-white border border-slate-200 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required={!isAnonymous}
                  />
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic leading-normal">
                Anonymity mode active. Contact credentials will be masked with secure cryptographic placeholders. Preserves reporter safety and increases threat reporting compliance.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attack Classification */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">Attack Classification</label>
              <select
                value={attackType}
                onChange={(e) => setAttackType(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
              >
                <option value="DDoS HTTP Flood on Main Gateway">DDoS HTTP Flood Attack</option>
                <option value="SQL Injection Probe on Users API">SQL Injection (SQLi)</option>
                <option value="SSH Root Brute-Force Scanning">SSH Brute Force Attack</option>
                <option value="Ransomware Command & Control beaconing">Ransomware (LockBit C2)</option>
                <option value="Phishing Redirect & Credential Harvesting">Phishing Campaign</option>
                <option value="Custom Intrusion Vector">Custom Threat Vector</option>
              </select>
            </div>

            {/* Affected Asset */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">Affected System or Host</label>
              <input
                type="text"
                value={affectedSystem}
                onChange={(e) => setAffectedSystem(e.target.value)}
                placeholder="e.g. database-sso-node.prod"
                className="bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Severity Priority */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">Threat Severity Assessment</label>
              <div className="flex items-center gap-2">
                {(["Low", "Medium", "High", "Critical"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(level)}
                    className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold border transition-all ${
                      severity === level
                        ? level === "Critical"
                          ? "bg-rose-50 text-rose-600 border-rose-500 shadow-sm"
                          : level === "High"
                          ? "bg-amber-50 text-amber-600 border-amber-500 shadow-sm"
                          : level === "Medium"
                          ? "bg-blue-50 text-blue-600 border-blue-500 shadow-sm"
                          : "bg-slate-100 text-slate-600 border-slate-400 shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">Attach Evidence</label>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-slate-400 font-mono">Presets:</span>
                  <button type="button" onClick={() => loadPresetEvidence("ddos")} className="text-[9px] text-blue-500 hover:underline px-1 font-mono">DDoS</button>
                  <button type="button" onClick={() => loadPresetEvidence("sqli")} className="text-[9px] text-blue-500 hover:underline px-1 font-mono">SQLi</button>
                  <button type="button" onClick={() => loadPresetEvidence("ssh")} className="text-[9px] text-blue-500 hover:underline px-1 font-mono">SSH</button>
                </div>
              </div>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value as "log" | "screenshot")}
                className="bg-slate-50 border border-slate-200 text-xs p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
              >
                <option value="log">Log Trace (.log / .txt)</option>
                <option value="screenshot">Affected System Metric Screenshot Descr.</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">Incident Narrative &amp; Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail what is happening, timelines observed, affected API pathways, and impacts..."
              rows={3}
              className="bg-slate-50 border border-slate-200 text-xs p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 leading-relaxed"
              required
            />
          </div>

          {/* Evidence Logs content */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
              Evidence Body (Trace Logs, Header Payload, Terminal Snippets)
            </label>
            <textarea
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
              placeholder="Paste actual log dumps, request/response bodies, or trace logs here..."
              rows={4}
              className="bg-slate-900 border border-slate-850 text-xs p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-blue-400 font-mono leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-200 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Layers className="w-4 h-4 animate-spin text-white" />
                Validating &amp; Stamping Report...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-blue-100" />
                Submit Secure Incident Report
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
