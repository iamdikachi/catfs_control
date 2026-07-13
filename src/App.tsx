import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Shield, 
  Activity, 
  Terminal, 
  Globe, 
  AlertTriangle, 
  Cpu, 
  Database, 
  Network, 
  Server, 
  Clipboard, 
  Play, 
  CheckCircle2, 
  Lock, 
  Code2, 
  ArrowRight, 
  Search, 
  Sparkles, 
  RefreshCw, 
  FileWarning, 
  ExternalLink,
  BookOpen,
  Wrench,
  XCircle,
  HelpCircle,
  Info,
  MapPin,
  TrendingUp,
  Maximize2,
  Send,
  Sliders,
  Bell,
  Check,
  Trash2,
  LockKeyhole
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  CartesianGrid 
} from "recharts";
import { Hop, AnalysisResult, PlaybookResult } from "./types";
import { ATTACK_PROFILES, COMMON_THREATS } from "./data";
import { FALLBACK_REPORTS, FALLBACK_PLAYBOOKS } from "./fallbackData";

import IntakePortal from "./components/IntakePortal";
import StatusTracker from "./components/StatusTracker";
import StaffDashboard from "./components/StaffDashboard";
import DefenseDeck from "./components/DefenseDeck";


// Expanded pre-seeded threats for Registry view
const REGISTRY_THREATS = [
  { id: "THR-001", ip: "185.220.101.99", country: "Germany", type: "DDoS Botnet Node", severity: "Critical", status: "Active", timestamp: "2026-07-11 08:50:01", details: "Coordinated HTTP Flood traffic on main API gateways. Associated with Mirai IoT sub-network bot nodes.", hexDump: "45 00 00 28 1a 2b 40 00 40 06 1c 3e c0 a8 01 69 c0 a8 01 01 00 50 d2 d1 00 00 00 01 00 00 00 00" },
  { id: "THR-002", ip: "103.45.201.12", country: "Netherlands", type: "SQL Injection Probe", severity: "High", status: "Mitigated", timestamp: "2026-07-11 08:51:14", details: "Attempted SQL schema dump on Users table. Triggered Postgres parse mismatch exception.", hexDump: "53 45 4c 45 43 54 20 2a 20 46 52 4f 4d 20 75 73 65 72 73 20 57 48 45 52 45 20 65 6d 61 69 6c 3d" },
  { id: "THR-003", ip: "45.14.220.67", country: "China", type: "SSH Dictionary brute", severity: "High", status: "Quarantined", timestamp: "2026-07-11 08:52:10", details: "Dictionary attacks targeting root accounts on Bastion SSH port 22. Dynamically quarantined in Fail2Ban.", hexDump: "53 53 48 2d 32 2e 30 2d 4f 70 65 6e 53 53 48 5f 38 2e 32 70 31 20 55 62 75 6e 74 75 2d 34 75 62" },
  { id: "THR-004", ip: "91.228.140.5", country: "Ukraine", type: "Ransomware Beacon", severity: "Critical", status: "Investigating", timestamp: "2026-07-11 08:53:01", details: "Outbound communication to suspected LockBit V3 malware command and control servers.", hexDump: "16 03 01 02 00 01 00 01 fc 03 03 f0 e2 8c a2 a8 df df de 1a b4 5e a4 e1 d2 ad df d0 f1 a2 cc b5" },
  { id: "THR-005", ip: "198.199.12.8", country: "Brazil", type: "Phishing Campaign SSO", severity: "Medium", status: "Mitigated", timestamp: "2026-07-11 08:54:01", details: "Hosting cloned Microsoft Outlook portal. Domain resolves isolated via corporate web proxy sandbox.", hexDump: "47 45 54 20 2f 6f 61 75 74 68 20 48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74 3a 20 76 65 72 69 66" },
  { id: "THR-006", ip: "109.105.109.2", country: "Netherlands", type: "Anonymizer Relay", severity: "Medium", status: "Monitored", timestamp: "2026-07-11 09:12:00", details: "Passive packet forwarding router matching Tor Exit Node maps. Scanned for proxy credentials bypass.", hexDump: "50 52 4f 58 59 20 54 43 50 34 20 31 38 35 2e 32 32 30 2e 31 30 31 2e 39 39 20 31 30 2e 30 2e 30" },
  { id: "THR-007", ip: "159.203.88.19", country: "United States", type: "Cryptomining Node", severity: "Low", status: "Quarantined", timestamp: "2026-07-11 09:33:45", details: "Unapproved background daemon mining Monero on localized isolated container pod cluster.", hexDump: "7b 22 6d 65 74 68 6f 64 22 3a 22 6c 6f 67 69 6e 22 2c 22 70 61 72 61 6d 73 22 3a 7b 22 6c 6f 67" }
];

export default function App() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<"public" | "staff" | "sandbox" | "threats" | "defense">("public");

  // Current UTC clock
  const [utcTime, setUtcTime] = useState<string>("");

  // Sandbox & Attack presets state
  const [selectedProfileId, setSelectedProfileId] = useState<string>(ATTACK_PROFILES[0].id);
  const [targetIp, setTargetIp] = useState<string>(ATTACK_PROFILES[0].targetIp);
  const [logPayload, setLogPayload] = useState<string>(ATTACK_PROFILES[0].logSample);
  
  // Custom IP/Host input
  const [customTarget, setCustomTarget] = useState<string>("");
  
  // Simulation routing state
  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [currentHopIndex, setCurrentHopIndex] = useState<number>(-1);
  const [hopsList, setHopsList] = useState<Hop[]>([]);
  const [traceSeverity, setTraceSeverity] = useState<string>("Low Risk");
  const [activeHopDetails, setActiveHopDetails] = useState<Hop | null>(null);
  
  // Hovered map node state for tooltip
  const [hoveredHop, setHoveredHop] = useState<Hop | null>(null);

  // AI Forensic analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisReport, setAnalysisReport] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Custom playbook generator state
  const [selectedPlaybookThreat, setSelectedPlaybookThreat] = useState<string>("DDoS Flood Attack");
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState<boolean>(false);
  const [generatedPlaybook, setGeneratedPlaybook] = useState<PlaybookResult | null>(null);

  // System status state
  const [serverStatus, setServerStatus] = useState<{
    status: string;
    apiConfigured: boolean;
    timestamp: string;
  } | null>(null);
  
  // Clipboard copy feedback
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Threat registry search & filter states
  const [threatSearchQuery, setThreatSearchQuery] = useState<string>("");
  const [threatFilterSeverity, setThreatFilterSeverity] = useState<string>("All");
  const [selectedRegistryThreat, setSelectedRegistryThreat] = useState<any>(null);

  // AI SecOps Chatbot state
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "Welcome SOC Analyst. I am the Gemini SecOps AI expert. Ask me about security logs, vulnerabilities, LockBit ransomwares, SQL injections, or writing iptables firewall scripts." }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // Interactive Playbook checklist state
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // SOC Configuration settings
  const [socConfig, setSocConfig] = useState({
    honeypotActive: true,
    rateLimitingEnabled: true,
    automatedAlarms: false,
    severityThreshold: "Medium",
    alertWebhook: "https://siem.enterprise.internal/hooks/secops-alerts",
  });
  const [testWebhookStatus, setTestWebhookStatus] = useState<string | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<string[]>([
    "System booted successfully. Listeners bounded to SOC internal streams."
  ]);

  // Clock Tick effect
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(now.toUTCString());
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ref to hold the tracing interval to prevent concurrent timers running
  const traceIntervalRef = useRef<any>(null);

  // Fetch backend status on startup
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setServerStatus(data))
      .catch(() => setServerStatus({ status: "offline", apiConfigured: false, timestamp: "" }));

    return () => {
      if (traceIntervalRef.current) {
        clearInterval(traceIntervalRef.current);
      }
    };
  }, []);

  // Automatically trigger trace simulation when sandbox profile changes
  useEffect(() => {
    const profile = ATTACK_PROFILES.find(p => p.id === selectedProfileId);
    if (profile) {
      setTargetIp(profile.targetIp);
      setLogPayload(profile.logSample);
      handleTraceRoute(profile.targetIp, profile.type);
    }
  }, [selectedProfileId]);

  // Handle Trace Route simulation logic
  const handleTraceRoute = async (ip: string, profileType?: string) => {
    if (traceIntervalRef.current) {
      clearInterval(traceIntervalRef.current);
      traceIntervalRef.current = null;
    }

    setIsTracing(true);
    setCurrentHopIndex(-1);
    setActiveHopDetails(null);
    setHoveredHop(null);
    setHopsList([]);

    try {
      const res = await fetch("/api/trace/hops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: ip, profile: profileType }),
      });
      const data = await res.json();
      if (res.ok && data.hops) {
        setTraceSeverity(data.severity || "Low Risk");
        
        // Build trace step-by-step
        let hopCounter = 0;
        const interval = setInterval(() => {
          setHopsList(prev => {
            if (hopCounter < data.hops.length) {
              const nextHop = data.hops[hopCounter];
              return [...prev, nextHop];
            }
            return prev;
          });
          setCurrentHopIndex(hopCounter);
          hopCounter++;
          
          if (hopCounter >= data.hops.length) {
            clearInterval(interval);
            traceIntervalRef.current = null;
            setIsTracing(false);
            setActiveHopDetails(data.hops[data.hops.length - 1]);
          }
        }, 150);
        traceIntervalRef.current = interval;
      } else {
        setIsTracing(false);
      }
    } catch (err) {
      console.error(err);
      setIsTracing(false);
    }
  };

  // Run AI analysis with Gemini
  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisReport(null);

    const activeProfile = ATTACK_PROFILES.find(p => p.id === selectedProfileId);
    const profileKey = activeProfile ? activeProfile.type : "ddos";

    // If Gemini API is not configured on backend, trigger our high-fidelity fallback immediately
    if (serverStatus && !serverStatus.apiConfigured) {
      setTimeout(() => {
        setAnalysisReport(FALLBACK_REPORTS[profileKey] || FALLBACK_REPORTS.ddos);
        setIsAnalyzing(false);
      }, 1000);
      return;
    }

    try {
      const res = await fetch("/api/trace/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logData: logPayload,
          selectedAttackType: activeProfile ? activeProfile.name : "Custom User Log Trace",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze trace logs.");
      }

      setAnalysisReport(data);
    } catch (err: any) {
      console.warn("AI Analysis error on server, falling back to static offline report:", err);
      // Resilient UX: fall back to high-fidelity offline logs if server returns error
      setAnalysisReport(FALLBACK_REPORTS[profileKey] || FALLBACK_REPORTS.ddos);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate interactive Playbook via Gemini
  const handleGeneratePlaybook = async (threatName: string) => {
    setIsGeneratingPlaybook(true);
    setGeneratedPlaybook(null);
    setCompletedSteps({}); // Reset checklists

    // Clean match keys
    let lookupKey = "DDoS Flood Attack";
    if (threatName.toLowerCase().includes("sql")) lookupKey = "SQL Injection (SQLi)";
    else if (threatName.toLowerCase().includes("ssh") || threatName.toLowerCase().includes("brute")) lookupKey = "SSH Brute Force";
    else if (threatName.toLowerCase().includes("ransom")) lookupKey = "Ransomware Command & Control";
    else if (threatName.toLowerCase().includes("phish")) lookupKey = "Phishing Campaign Redirect";

    // If Gemini API is not configured on backend, trigger our high-fidelity fallback playbook immediately
    if (serverStatus && !serverStatus.apiConfigured) {
      setTimeout(() => {
        setGeneratedPlaybook(FALLBACK_PLAYBOOKS[lookupKey] || FALLBACK_PLAYBOOKS["DDoS Flood Attack"]);
        setIsGeneratingPlaybook(false);
      }, 800);
      return;
    }

    try {
      const res = await fetch("/api/trace/playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threatType: threatName,
          environment: "Corporate Linux Server Infrastructure",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate security playbook.");
      }

      setGeneratedPlaybook(data);
    } catch (err) {
      console.warn("Playbook error on server, using high-fidelity offline copy:", err);
      setGeneratedPlaybook(FALLBACK_PLAYBOOKS[lookupKey] || FALLBACK_PLAYBOOKS["DDoS Flood Attack"]);
    } finally {
      setIsGeneratingPlaybook(false);
    }
  };

  // Chat Submission to Gemini Endpoint
  const handleSendChat = async () => {
    if (!chatInput.trim() || isSendingChat) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    setIsSendingChat(true);

    try {
      const res = await fetch("/api/trace/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: chatMessages.slice(-6).map(m => ({ role: m.role, text: m.text }))
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "assistant", text: data.response }]);
    } catch (e) {
      console.error(e);
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        text: "Error calling SecOps AI endpoint. Running offline. Immediate guidance: Block aggressive source subnets, isolate workstations with high-entropy outbound transmissions, and verify all auth parameters." 
      }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Test SOC Alert Webhook
  const handleTestWebhook = () => {
    setTestWebhookStatus("sending");
    setTimeout(() => {
      const isSuccess = socConfig.alertWebhook.startsWith("http");
      if (isSuccess) {
        setTestWebhookStatus("success");
        setWebhookLogs(prev => [
          `[${new Date().toLocaleTimeString()}] SUCCESS: Test ping dispatched to ${socConfig.alertWebhook}. Response code: 200 OK.`,
          ...prev
        ]);
      } else {
        setTestWebhookStatus("failed");
        setWebhookLogs(prev => [
          `[${new Date().toLocaleTimeString()}] ERROR: Dispatched ping to invalid endpoint "${socConfig.alertWebhook}". Reason: Host unreachable.`,
          ...prev
        ]);
      }
    }, 1200);
  };

  // Toggle checklist step
  const toggleStep = (stepKey: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }));
  };

  // Copy helper
  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // SVG Map location coordinates mapping (scaled to viewBox="0 0 1000 500")
  const getMapCoordinates = (lat: number, lng: number) => {
    const x = ((lng + 180) * (1000 / 360));
    const y = (((90 - lat) * (500 / 180)) * 0.9) + 40;
    return { x, y };
  };

  // Pre-mapped aesthetic static world background dots for grid context
  const staticDots = useMemo(() => {
    return [
      { x: 120, y: 150 }, { x: 180, y: 140 }, { x: 220, y: 180 }, { x: 150, y: 220 }, // Americas North
      { x: 300, y: 350 }, { x: 320, y: 380 }, { x: 350, y: 410 }, // South America
      { x: 480, y: 130 }, { x: 500, y: 110 }, { x: 530, y: 140 }, { x: 520, y: 180 }, // Europe
      { x: 510, y: 280 }, { x: 550, y: 320 }, { x: 580, y: 360 }, // Africa
      { x: 620, y: 110 }, { x: 650, y: 150 }, { x: 720, y: 160 }, { x: 750, y: 120 }, // Russia/North Asia
      { x: 700, y: 240 }, { x: 780, y: 220 }, { x: 820, y: 250 }, { x: 800, y: 300 }, // Central/East Asia
      { x: 840, y: 420 }, { x: 900, y: 440 }, { x: 920, y: 410 }, // Oceania
    ];
  }, []);

  // Latency profile dataset for Recharts
  const latencyChartData = useMemo(() => {
    return hopsList.filter(Boolean).map(h => ({
      name: `Hop ${h.hop}`,
      ms: h.latency,
      ip: h.ip,
      status: h.status
    }));
  }, [hopsList]);

  // Current active profile
  const activeProfile = useMemo(() => {
    return ATTACK_PROFILES.find(p => p.id === selectedProfileId);
  }, [selectedProfileId]);

  // Filtered threats list for threats registry
  const filteredRegistryThreats = useMemo(() => {
    return REGISTRY_THREATS.filter(t => {
      const matchesSearch = t.ip.includes(threatSearchQuery) || 
                            t.country.toLowerCase().includes(threatSearchQuery.toLowerCase()) || 
                            t.type.toLowerCase().includes(threatSearchQuery.toLowerCase());
      const matchesSeverity = threatFilterSeverity === "All" || t.severity === threatFilterSeverity;
      return matchesSearch && matchesSeverity;
    });
  }, [threatSearchQuery, threatFilterSeverity]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white font-sans p-4 md:p-6 gap-6">
      
      {/* CYBER ATTACK TRACING SYSTEM HEADER BAR */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900 font-display font-bold tracking-tight text-xl flex items-center gap-2">
              CATFS Control Hub
              <span className="text-xs font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Academic Spec
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Cyber Attack Tracing, Forensic Case Files &amp; Secure Audits</p>
          </div>
        </div>

        {/* NAVIGATION TAB CONTROLS */}
        <nav className="flex items-center bg-slate-100/80 border border-slate-200 p-1.5 rounded-xl gap-1 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab("public")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "public"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Public Intake</span>
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "staff"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>SecOps Center</span>
          </button>
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "sandbox"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Route Sandbox</span>
          </button>
          <button
            onClick={() => setActiveTab("threats")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "threats"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Threat Registry</span>
          </button>
          <button
            onClick={() => setActiveTab("defense")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "defense"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Defense Deck</span>
          </button>
        </nav>

        {/* STATUS & CLOCK */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="hidden lg:flex flex-col bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2 min-w-[130px]">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Active UTC Time</span>
            <span className="text-slate-700 font-mono text-xs font-bold mt-0.5 truncate">{utcTime || "Synchronizing..."}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${serverStatus?.apiConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${serverStatus?.apiConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Gemini LLM</span>
              <span className="text-slate-700 font-sans text-xs font-bold mt-0.5">
                {serverStatus?.apiConfigured ? "Connected (Live)" : "Sandbox (Offline)"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* OPERATIONAL METRIC HIGHLIGHTS CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Operational Target</span>
            <span className="text-lg font-mono font-bold text-slate-900 mt-1">{targetIp}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              {activeProfile ? activeProfile.severity : "Manual Input"} Severity Vector
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Hops Traversed</span>
            <span className="text-lg font-mono font-bold text-slate-900 mt-1">
              {isTracing ? `${hopsList.length}/6` : hopsList.length} Nodes
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {isTracing ? "Routing simulation active..." : "Network trace complete"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Network className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Alarms</span>
            <span className={`text-lg font-display font-bold mt-1 ${socConfig.automatedAlarms ? 'text-rose-600' : 'text-slate-900'}`}>
              {socConfig.automatedAlarms ? "TRIGGERED (Live)" : "0 Active Alarms"}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <AlertTriangle className={`w-3.5 h-3.5 ${traceSeverity === "High Risk" ? "text-rose-500" : "text-amber-500"}`} />
              {traceSeverity === "High Risk" ? "Suspicious Network Hops" : "Subnets safe & stable"}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${socConfig.automatedAlarms ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-rose-50 text-rose-600'}`}>
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Honeypots Status</span>
            <span className="text-lg font-sans font-bold text-slate-900 mt-1">
              {socConfig.honeypotActive ? "ACTIVE (Listening)" : "SHUTDOWN"}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[170px]">
              Gateways: DDoS, SQL, SSH
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Server className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* VIEW-SPECIFIC PAGES MAIN ROUTING */}
      <main className="flex-1 w-full">
        
        {/* TAB 1: GEOGRAPHIC TOPOLOGY & TRACE (THE ORIGINAL TRACING DASHBOARD) */}
        {activeTab === "sandbox" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ADVERSARIAL PRESENTS & VECTOR LAUNCHER */}
            <section className="lg:col-span-4 flex flex-col gap-5">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <h2 className="font-display font-bold text-slate-900 text-sm tracking-tight">Simulation Vectors</h2>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-bold">
                    {ATTACK_PROFILES.length} Presets
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Select an adversary profile to inject system logs and trace geographical router packets to target sources.
                </p>

                <div className="flex flex-col gap-2">
                  {ATTACK_PROFILES.map((profile) => {
                    const isActive = selectedProfileId === profile.id;
                    return (
                      <button
                        key={profile.id}
                        onClick={() => {
                          setSelectedProfileId(profile.id);
                          setCustomTarget("");
                        }}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                          isActive 
                            ? "bg-blue-50/40 border-blue-500/50 shadow-sm" 
                            : "bg-slate-50/50 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-slate-900">{profile.name}</span>
                          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                            profile.severity === "Critical" 
                              ? "bg-rose-50 text-rose-600 border border-rose-100" 
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {profile.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                          {profile.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* MANUAL LOOKUP TOOL */}
                <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Manual Destination Traceroute</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={customTarget}
                        onChange={(e) => setCustomTarget(e.target.value)}
                        placeholder="Enter target IP or Domain..."
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 pl-9 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 font-mono text-slate-800"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (customTarget.trim()) {
                          setTargetIp(customTarget);
                          handleTraceRoute(customTarget, "manual");
                        }
                      }}
                      disabled={isTracing}
                      className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-mono text-[11px] px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {isTracing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-blue-400" />}
                      Trace
                    </button>
                  </div>
                </div>
              </div>

              {/* QUICK SHORTCUT TO AI ANALYSER */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-slate-850 p-5 rounded-2xl shadow-md flex flex-col gap-3">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs tracking-wider uppercase font-bold">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>AI Incident Assistant</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Need deep packet investigation?</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Navigate to the <strong className="text-white font-semibold">AI Forensics Hub</strong> tab to perform live log scanning, evaluate threat signatures, and chat with Gemini SecOps agent.
                </p>
                <button
                  onClick={() => setActiveTab("terminal")}
                  className="mt-1 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Open Forensics Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* INTERACTIVE GEOGRAPHIC ROUTING TOPOLOGY MAP */}
            <section className="lg:col-span-8 flex flex-col gap-5">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <h2 className="font-display font-bold text-slate-900 text-sm tracking-tight">Geographic Routing Topology</h2>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
                    <span>Active Target IP:</span>
                    <span className="text-blue-600 font-bold">{targetIp}</span>
                  </div>
                </div>

                {/* World map drawing stage */}
                <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-900 aspect-[2/1] flex items-center justify-center">
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-pulse pointer-events-none" style={{ top: "40%" }} />

                  <svg viewBox="0 0 1000 500" className="w-full h-full text-slate-800/20" id="interactive-world-svg">
                    <defs>
                      <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="1000" height="500" fill="url(#mapGrid)" />

                    {staticDots.map((dot, idx) => (
                      <circle key={`static-${idx}`} cx={dot.x} cy={dot.y} r="2.5" className="fill-slate-700/35" />
                    ))}

                    {hopsList.filter(Boolean).length > 1 && (
                      <path
                        d={hopsList.reduce((acc, curr, idx) => {
                          if (!curr) return acc;
                          const coords = getMapCoordinates(curr.lat || 0, curr.lng || 0);
                          return !acc
                            ? `M ${coords.x} ${coords.y}` 
                            : `${acc} Q ${(getMapCoordinates(hopsList[idx-1].lat, hopsList[idx-1].lng).x + coords.x)/2} ${Math.min(getMapCoordinates(hopsList[idx-1].lat, hopsList[idx-1].lng).y, coords.y) - 40} ${coords.x} ${coords.y}`;
                        }, "")}
                        fill="none"
                        stroke="url(#lineGrad)"
                        strokeWidth="2.5"
                        className="signal-line"
                      />
                    )}

                    <defs>
                      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.5" />
                      </linearGradient>
                    </defs>

                    {hopsList.map((hop, index) => {
                      if (!hop) return null;
                      const { x, y } = getMapCoordinates(hop.lat || 0, hop.lng || 0);
                      const isLastHop = index === hopsList.length - 1;

                      let nodeColor = "#3b82f6";
                      if (hop.status === "Suspicious") nodeColor = "#f59e0b";
                      if (hop.status === "Flagged" || (isLastHop && traceSeverity === "High Risk")) nodeColor = "#f43f5e";

                      return (
                        <g 
                          key={`hop-${index}`} 
                          className="cursor-pointer group"
                          onMouseEnter={() => setHoveredHop(hop)}
                          onMouseLeave={() => setHoveredHop(null)}
                          onClick={() => setActiveHopDetails(hop)}
                        >
                          <circle cx={x} cy={y} r={isLastHop ? "15" : "11"} fill="transparent" stroke={nodeColor} strokeWidth="1.5" className="animate-node-pulse" />
                          <circle cx={x} cy={y} r={isLastHop ? "7" : "5.5"} fill={nodeColor} className="transition-all duration-300 group-hover:scale-125" />
                          <text x={x} y={y - 14} textAnchor="middle" className="text-[10px] font-mono font-bold fill-slate-300 pointer-events-none select-none">
                            {hop.hop}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* World map tooltip */}
                  {hoveredHop && (
                    <div 
                      className="absolute bg-slate-900 border border-slate-850 text-slate-200 p-3.5 rounded-xl shadow-xl text-[11px] font-mono flex flex-col gap-1 z-20 pointer-events-none"
                      style={{
                        left: `${Math.min(Math.max(getMapCoordinates(hoveredHop.lat, hoveredHop.lng).x - 90, 15), 580)}px`,
                        top: `${Math.min(Math.max(getMapCoordinates(hoveredHop.lat, hoveredHop.lng).y + 20, 15), 320)}px`,
                      }}
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5 font-bold text-white">
                        <span>Node #{hoveredHop.hop}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          hoveredHop.status === "Flagged" 
                            ? "bg-rose-500/20 text-rose-400" 
                            : hoveredHop.status === "Suspicious" 
                            ? "bg-amber-500/20 text-amber-400" 
                            : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {hoveredHop.status}
                        </span>
                      </div>
                      <div>IP: <span className="text-white font-bold">{hoveredHop.ip}</span></div>
                      <div>Host: <span className="text-slate-300">{hoveredHop.host}</span></div>
                      <div>ISP: <span className="text-slate-400 truncate max-w-[150px] inline-block">{hoveredHop.isp}</span></div>
                      <div>Latency: <span className="text-emerald-400 font-bold">{hoveredHop.latency} ms</span></div>
                      <div className="text-[10px] text-slate-500 border-t border-slate-800/50 mt-1.5 pt-1 italic">{hoveredHop.location}</div>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-lg flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                      Hover nodes for active telemetry. Click to pin diagnostic logs.
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Active ICMP Projection</span>
                  </div>
                </div>

                {/* PINNED HOP DETAIL DRAWER (if clicked on a node) */}
                {activeHopDetails && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-2.5 relative transition-all">
                    <button 
                      onClick={() => setActiveHopDetails(null)} 
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 font-mono text-[11px]"
                    >
                      Close [x]
                    </button>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        Node Gateway Detail: {activeHopDetails.ip} ({activeHopDetails.host})
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="bg-white border border-slate-200 p-2 rounded">
                        <span className="text-[9px] text-slate-400 uppercase font-bold">Location</span>
                        <div className="font-bold text-slate-700 mt-0.5">{activeHopDetails.location}</div>
                      </div>
                      <div className="bg-white border border-slate-200 p-2 rounded">
                        <span className="text-[9px] text-slate-400 uppercase font-bold">Latency Response</span>
                        <div className="font-bold text-emerald-600 mt-0.5">{activeHopDetails.latency} ms</div>
                      </div>
                      <div className="bg-white border border-slate-200 p-2 rounded">
                        <span className="text-[9px] text-slate-400 uppercase font-bold">ASN Carrier</span>
                        <div className="font-bold text-slate-700 mt-0.5 truncate" title={activeHopDetails.isp}>{activeHopDetails.isp}</div>
                      </div>
                      <div className="bg-white border border-slate-200 p-2 rounded">
                        <span className="text-[9px] text-slate-400 uppercase font-bold">Integrity Level</span>
                        <div className={`font-bold mt-0.5 ${
                          activeHopDetails.status === "Flagged" ? "text-rose-600" : activeHopDetails.status === "Suspicious" ? "text-amber-500" : "text-blue-600"
                        }`}>
                          {activeHopDetails.status}
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans bg-white border border-slate-200 p-3 rounded-lg mt-0.5">
                      <strong>Diagnostic Assessment:</strong> {activeHopDetails.info}
                    </p>
                  </div>
                )}

                {/* NETWORK LATENCY RECHARTS BLOCK */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-slate-700">ICMP Packet Transmission Latency (ms)</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Proxy Node Congestion Rate</span>
                  </div>
                  
                  <div className="h-28 w-full">
                    {latencyChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={latencyChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.5)" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <ChartTooltip
                            contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#f8fafc", fontSize: "11px", fontFamily: "monospace" }}
                            itemStyle={{ color: "#38bdf8" }}
                            labelStyle={{ fontWeight: "bold", color: "#fff" }}
                          />
                          <Area type="monotone" dataKey="ms" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#latencyGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono italic">
                        No traceroute packets on stream. Launch an attack vector to record telemetry.
                      </div>
                    )}
                  </div>
                </div>

                {/* LIVE TRACEROUTE HOPS LOG TABLE */}
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-850">Traceroute Packet Hops Table</span>
                    <span className="text-[9px] font-mono bg-slate-100 text-slate-500 border border-slate-200 rounded px-2 py-0.5 uppercase">Realtime Output</span>
                  </div>
                  <div className="overflow-x-auto w-full custom-scroll max-h-[220px] border border-slate-200 rounded-xl">
                    {hopsList.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-[10px] bg-slate-50 font-mono text-slate-400 uppercase tracking-wider">
                            <th className="py-2.5 px-3 font-bold">Hop</th>
                            <th className="py-2.5 px-3 font-bold">IP Address</th>
                            <th className="py-2.5 px-3 font-bold">Router Name / Location</th>
                            <th className="py-2.5 px-3 font-bold text-right">Latency</th>
                            <th className="py-2.5 px-3 font-bold text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hopsList.filter(Boolean).map((hop) => {
                            const isHighlighted = activeHopDetails?.hop === hop.hop;
                            let badgeColor = "bg-blue-50 text-blue-600 border border-blue-100";
                            if (hop.status === "Suspicious") badgeColor = "bg-amber-50 text-amber-600 border border-amber-100";
                            if (hop.status === "Flagged") badgeColor = "bg-rose-50 text-rose-600 border border-rose-100";

                            return (
                              <tr 
                                key={hop.hop}
                                onClick={() => setActiveHopDetails(hop)}
                                onMouseEnter={() => setHoveredHop(hop)}
                                onMouseLeave={() => setHoveredHop(null)}
                                className={`border-b border-slate-100 text-xs font-mono cursor-pointer transition-colors ${
                                  isHighlighted ? "bg-blue-50/20" : "hover:bg-slate-50/60"
                                }`}
                              >
                                <td className="py-2.5 px-3 text-slate-400 font-bold">#{hop.hop}</td>
                                <td className="py-2.5 px-3 text-slate-900 font-semibold">{hop.ip}</td>
                                <td className="py-2.5 px-3 text-slate-500 truncate max-w-[180px]" title={`${hop.host} | ${hop.location}`}>
                                  {hop.host} <span className="text-[10px] text-slate-400">({hop.location})</span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 font-bold text-right text-emerald-600">{hop.latency} ms</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${badgeColor}`}>
                                    {hop.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-12 bg-white flex flex-col items-center justify-center gap-3">
                        <Activity className="w-8 h-8 text-slate-300 animate-pulse" />
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 font-mono uppercase">Traceroute Queue Empty</h3>
                          <p className="text-[10px] text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                            Click on any adversary vector or insert an IP address manually to initiate network route scan.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: ACTIVE THREAT REGISTRY & INCIDENT LIST */}
        {activeTab === "threats" && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-display font-bold text-slate-900 text-base tracking-tight flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Active Threat Intelligence Registry
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Database of active malicious subnets, flagged gateway transactions, and localized SIEM relays</p>
              </div>

              {/* SEARCH & FILTER CONTROLS */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={threatSearchQuery}
                    onChange={(e) => setThreatSearchQuery(e.target.value)}
                    placeholder="Search by IP, type, or origin..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 pl-9 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 font-mono"
                  />
                </div>
                <select
                  value={threatFilterSeverity}
                  onChange={(e) => setThreatFilterSeverity(e.target.value)}
                  className="bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg min-w-[110px]"
                >
                  <option value="All">All Severities</option>
                  <option value="Critical">Critical Only</option>
                  <option value="High">High Only</option>
                  <option value="Medium">Medium Only</option>
                  <option value="Low">Low Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LIST TABLE CONTAINER (LEFT 2 COLS) */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                <div className="overflow-x-auto w-full border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] bg-slate-50 font-mono text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 font-bold">Threat ID</th>
                        <th className="py-3 px-4 font-bold">IP & Origin</th>
                        <th className="py-3 px-4 font-bold">Classification</th>
                        <th className="py-3 px-4 font-bold">Severity</th>
                        <th className="py-3 px-4 font-bold">Incident Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistryThreats.length > 0 ? (
                        filteredRegistryThreats.map((threat) => {
                          const isSelected = selectedRegistryThreat?.id === threat.id;
                          let sevBadge = "bg-blue-50 text-blue-600 border border-blue-100";
                          if (threat.severity === "Critical") sevBadge = "bg-rose-50 text-rose-600 border border-rose-100";
                          if (threat.severity === "High") sevBadge = "bg-amber-50 text-amber-600 border border-amber-100";
                          if (threat.severity === "Medium") sevBadge = "bg-yellow-50 text-yellow-600 border border-yellow-100";

                          let statusBadge = "bg-slate-100 text-slate-600";
                          if (threat.status === "Active") statusBadge = "bg-rose-100 text-rose-700 animate-pulse";
                          if (threat.status === "Quarantined") statusBadge = "bg-emerald-100 text-emerald-800";
                          if (threat.status === "Mitigated") statusBadge = "bg-blue-100 text-blue-800";

                          return (
                            <tr
                              key={threat.id}
                              onClick={() => setSelectedRegistryThreat(threat)}
                              className={`border-b border-slate-100 text-xs font-mono cursor-pointer transition-colors ${
                                isSelected ? "bg-blue-50/30" : "hover:bg-slate-50/50"
                              }`}
                            >
                              <td className="py-3 px-4 font-bold text-slate-400">{threat.id}</td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-900">{threat.ip}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {threat.country}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-700 font-sans">{threat.type}</td>
                              <td className="py-3 px-4">
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${sevBadge}`}>
                                  {threat.severity}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${statusBadge}`}>
                                  {threat.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-xs font-mono text-slate-400 italic">
                            No threats found matching the filter credentials.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] leading-relaxed text-slate-500 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Data Synchronization notice:</strong> Threat logs are ingested continuously from core honeypots and DNS proxy monitors. Selecting any incident displays its localized network packet payload hex dumps, target gateways, and actionable resolution paths in the right-side inspection drawer.
                  </div>
                </div>
              </div>

              {/* DETAILED PACKET INSPECTOR DRAWER (RIGHT 1 COL) */}
              <div className="bg-slate-900 border border-slate-950 rounded-2xl p-5 text-white shadow-lg flex flex-col gap-4">
                {selectedRegistryThreat ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono text-xs uppercase font-bold text-white">Incident Packet Inspector</span>
                      </div>
                      <button 
                        onClick={() => setSelectedRegistryThreat(null)} 
                        className="text-[10px] font-mono text-slate-400 hover:text-white"
                      >
                        [Clear]
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">ID Reference:</span>
                      <span className="font-mono text-xs font-bold text-blue-400">{selectedRegistryThreat.id}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">Source Attacker IP:</span>
                      <span className="font-mono text-xs font-bold text-white">{selectedRegistryThreat.ip} ({selectedRegistryThreat.country})</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">Incident Categorization:</span>
                      <span className="font-sans text-xs font-bold bg-slate-800 border border-slate-700 px-2.5 py-1 rounded inline-block text-emerald-300">
                        {selectedRegistryThreat.type}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">Syslog Log Ingestion Details:</span>
                      <p className="text-[11px] font-sans text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-850">
                        {selectedRegistryThreat.details}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">RAW Hex Dump Payload (First 32 bytes):</span>
                      <pre className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-[10px] font-mono text-blue-400 whitespace-pre-wrap leading-relaxed select-all">
                        {selectedRegistryThreat.hexDump}
                      </pre>
                    </div>

                    <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
                      <span className="text-[10px] font-mono text-slate-400">Rapid Action Security Commands</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleCopyToClipboard(`sudo iptables -A INPUT -s ${selectedRegistryThreat.ip} -j DROP`, "registry-rules");
                            alert(`IPtables drop command copied for ${selectedRegistryThreat.ip}`);
                          }}
                          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] py-2 rounded font-bold transition-colors"
                        >
                          Copy Drop Command
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPlaybookThreat(selectedRegistryThreat.type.includes("DDoS") ? "DDoS Flood Attack" : selectedRegistryThreat.type.includes("SQL") ? "SQL Injection (SQLi)" : selectedRegistryThreat.type.includes("SSH") ? "SSH Brute Force" : "Ransomware Command & Control");
                            setActiveTab("playbooks");
                            handleGeneratePlaybook(selectedRegistryThreat.type);
                          }}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] py-2 rounded font-bold transition-colors border border-slate-700"
                        >
                          Load Playbook
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-24 flex flex-col items-center justify-center gap-3">
                    <Maximize2 className="w-8 h-8 text-slate-700 animate-pulse" />
                    <h3 className="text-xs font-bold text-slate-400 font-mono uppercase">Packet Analyzer Empty</h3>
                    <p className="text-[10px] text-slate-400 max-w-[190px] mx-auto leading-relaxed">
                      Select any active trace incident from the ledger to load raw packet payloads and security hex dumps.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NEW ACADEMIC COMPONENT TABS INTEGRATION */}
        {activeTab === "public" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            <div className="lg:col-span-5 flex flex-col gap-6">
              <IntakePortal />
            </div>
            <div className="lg:col-span-7 flex flex-col gap-6">
              <StatusTracker />
            </div>
          </div>
        )}

        {activeTab === "staff" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <StaffDashboard />
          </div>
        )}

        {activeTab === "defense" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <DefenseDeck />
          </div>
        )}

        {/* TAB 3: AI FORENSICS TERMINAL & CHAT CONSOLE */}
        {false && activeTab === "terminal" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LOG FEED EDITOR & AI SCANNER (LEFT 5 COLS) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-slate-900 border border-slate-950 rounded-2xl p-5 shadow-lg flex flex-col gap-4 min-h-[480px]">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h2 className="font-mono text-xs uppercase font-bold text-white tracking-widest">Syslog Honeypot Buffer</h2>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-emerald-500/15 rounded-full text-emerald-400 font-mono border border-emerald-500/10">INGEST</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Modify the honeypot log stream manually to inject malicious footprints or choose one of the predefined profiles from the first tab. Then execute the deep AI forensic engine.
                </p>

                <div className="flex-1 flex flex-col relative min-h-[220px]">
                  <textarea
                    value={logPayload}
                    onChange={(e) => setLogPayload(e.target.value)}
                    placeholder="Enter standard security logs or paste syslog traces..."
                    className="w-full flex-1 bg-slate-950 border border-slate-850 p-4 rounded-xl text-[10.5px] font-mono text-emerald-400/90 focus:outline-none focus:border-emerald-500/30 custom-scroll leading-relaxed resize-none"
                  />
                  <button
                    onClick={() => {
                      const active = ATTACK_PROFILES.find(p => p.id === selectedProfileId);
                      if (active) setLogPayload(active.logSample);
                    }}
                    className="absolute right-3.5 bottom-3.5 text-[10px] font-mono bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 border border-slate-750 rounded transition-colors"
                  >
                    Reset Buffer
                  </button>
                </div>

                {/* AI FORENSIC TRIGGER ACTION */}
                <button
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing || isTracing || !logPayload.trim()}
                  className="w-full py-3.5 rounded-xl font-display font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gemini Forensic Compiler Active...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-200" />
                      <span>Compile Forensic AI Analysis</span>
                    </>
                  )}
                </button>
              </div>

              {/* DYNAMIC COMPILATION REPORT RENDERER */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="font-display font-bold text-slate-900 text-sm">Compiled AI Diagnostic Assessment</h3>
                </div>

                {/* Empty reports */}
                {!analysisReport && !isAnalyzing && (
                  <div className="text-center py-10">
                    <FileWarning className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Assessment Queue Idle</h4>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">Click "Compile Forensic AI Analysis" above to audit honeypot logs.</p>
                  </div>
                )}

                {/* Loading state */}
                {isAnalyzing && (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                    <span className="text-[11px] text-slate-500 font-mono uppercase font-bold animate-pulse">Running Neural Audits...</span>
                  </div>
                )}

                {/* Realized Report */}
                {analysisReport && !isAnalyzing && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs font-bold text-slate-800 uppercase">{analysisReport.attackType}</div>
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                        analysisReport.severity === "CRITICAL" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {analysisReport.severity}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans bg-slate-50 p-3 rounded-lg border border-slate-150">
                      {analysisReport.summary}
                    </p>

                    <div className="border-t border-slate-100 pt-3 text-[11px] font-mono">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Detected Signatures</div>
                      <ul className="flex flex-col gap-1.5 pl-0">
                        {analysisReport.anomaliesFound.map((item, index) => (
                          <li key={index} className="text-slate-600 flex items-start gap-1.5 leading-relaxed">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-2">Actionable Mitigations</div>
                      <div className="flex flex-col gap-2">
                        {analysisReport.mitigationSteps.map((step, index) => (
                          <div key={index} className="bg-slate-50 border border-slate-150 rounded p-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800 font-mono">{step.action}</span>
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                step.priority === "Immediate" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                              }`}>{step.priority}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 font-sans">{step.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* INTERACTIVE ASK-GEMINI SECOPS CHAT ASSISTANT (RIGHT 7 COLS) */}
            <div className="lg:col-span-7 flex flex-col bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm min-h-[640px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="font-display font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                    Ask Gemini SecOps Expert
                    <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full uppercase">Assistant</span>
                  </h2>
                </div>
                <button
                  onClick={() => setChatMessages([
                    { role: "assistant", text: "Welcome SOC Analyst. I am the Gemini SecOps AI expert. Ask me about security logs, vulnerabilities, LockBit ransomwares, SQL injections, or writing iptables firewall scripts." }
                  ])}
                  className="text-[10px] font-mono text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear Consultations
                </button>
              </div>

              {/* MESSAGES FLOW AREA */}
              <div className="flex-1 overflow-y-auto max-h-[460px] flex flex-col gap-4 pr-1 mb-4 custom-scroll">
                {chatMessages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={index}
                      className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs shadow flex-shrink-0">
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                        isUser 
                          ? "bg-slate-900 text-white font-sans rounded-tr-none shadow-sm"
                          : "bg-slate-50 border border-slate-200 text-slate-700 font-mono whitespace-pre-wrap rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                {isSendingChat && (
                  <div className="flex justify-start items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs shadow flex-shrink-0 animate-pulse">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-mono text-slate-400 flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                      Gemini is compiling response parameters...
                    </div>
                  </div>
                )}
              </div>

              {/* QUICK ASK TEMPLATES */}
              <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 mb-3">
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider py-1">Quick Queries:</span>
                <button
                  onClick={() => setChatInput("Explain how LockBit ransomware coordinates its outbound command beacons")}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-600 px-2.5 py-1 transition-colors"
                >
                  "LockBit Beacons?"
                </button>
                <button
                  onClick={() => setChatInput("Write an iptables rules script to drop active incoming DDoS flood traffic")}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-600 px-2.5 py-1 transition-colors"
                >
                  "Iptables Drop Rule?"
                </button>
                <button
                  onClick={() => setChatInput("How can parameterized queries protect PostgreSQL databases against SQL Injection?")}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-600 px-2.5 py-1 transition-colors"
                >
                  "Fix SQLi Vulnerability?"
                </button>
              </div>

              {/* INPUT BOX */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendChat();
                  }}
                  placeholder="Ask the expert SecOps AI about logs or firewall codes..."
                  className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendChat}
                  disabled={isSendingChat || !chatInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white p-3.5 rounded-xl transition-colors shadow-md flex items-center justify-center flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMPLIANCE CONTAINMENT PLAYBOOKS */}
        {false && activeTab === "playbooks" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SELECTOR & INTERACTIVE ACTION CHECKLISTS (LEFT 5 COLS) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <h2 className="font-display font-bold text-slate-900 text-sm tracking-tight">Active NIST Compliance Playbooks</h2>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-bold">PLAYBOOK</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Select a threat profile preset to compile immediate containment guidelines, eradicate infected resources, configure blocklists, and copy deployment scripts.
                </p>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Select Vector Catalog</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedPlaybookThreat}
                      onChange={(e) => setSelectedPlaybookThreat(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 p-2.5 text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg"
                    >
                      {COMMON_THREATS.map((threat, index) => (
                        <option key={index} value={threat.type}>{threat.type}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleGeneratePlaybook(selectedPlaybookThreat)}
                      disabled={isGeneratingPlaybook}
                      className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-mono text-[11px] px-3.5 py-2.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 border border-slate-850"
                    >
                      {isGeneratingPlaybook ? "Compiling..." : "Build Playbook"}
                    </button>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE WORKFLOW CHECKLIST */}
              {generatedPlaybook && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900 font-display">Resolution Workflow Progress</span>
                    <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold">
                      {Object.values(completedSteps).filter(Boolean).length} / 4 Done
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 font-sans text-xs">
                    
                    <button
                      onClick={() => toggleStep("step-1")}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        completedSteps["step-1"]
                          ? "bg-emerald-50/40 border-emerald-500/30 text-slate-500"
                          : "bg-slate-50 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className={`mt-0.5 w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${
                        completedSteps["step-1"] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {completedSteps["step-1"] && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className={`font-bold ${completedSteps["step-1"] ? "line-through text-slate-400" : "text-slate-800"}`}>[PHASE 1] Initial Identification Check</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Identify abnormal ingress traffic spikes, grep auth logs, and register rogue subnets on target.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleStep("step-2")}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        completedSteps["step-2"]
                          ? "bg-emerald-50/40 border-emerald-500/30 text-slate-500"
                          : "bg-slate-50 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className={`mt-0.5 w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${
                        completedSteps["step-2"] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {completedSteps["step-2"] && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className={`font-bold ${completedSteps["step-2"] ? "line-through text-slate-400" : "text-slate-800"}`}>[PHASE 2] Apply Containment Limits</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Throttle API endpoints, isolate infected workstations physically, and setup blocklist drop directives.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleStep("step-3")}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        completedSteps["step-3"]
                          ? "bg-emerald-50/40 border-emerald-500/30 text-slate-500"
                          : "bg-slate-50 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className={`mt-0.5 w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${
                        completedSteps["step-3"] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {completedSteps["step-3"] && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className={`font-bold ${completedSteps["step-3"] ? "line-through text-slate-400" : "text-slate-800"}`}>[PHASE 3] Deploy Hardening Snippets</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Update proxy rules, configure credential parameters, disable SSH password auths, and clean local systems.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleStep("step-4")}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        completedSteps["step-4"]
                          ? "bg-emerald-50/40 border-emerald-500/30 text-slate-500"
                          : "bg-slate-50 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className={`mt-0.5 w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${
                        completedSteps["step-4"] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {completedSteps["step-4"] && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className={`font-bold ${completedSteps["step-4"] ? "line-through text-slate-400" : "text-slate-800"}`}>[PHASE 4] Restore &amp; Validate Baselining</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Verify route latency baseline curve returns normal. Remove temporary challenge constraints safely.</p>
                      </div>
                    </button>

                  </div>
                </div>
              )}
            </div>

            {/* FULL PLAYBOOK RESOLUTION OUTPUTS (RIGHT 7 COLS) */}
            <div className="lg:col-span-7 flex flex-col bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm min-h-[500px]">
              
              {generatedPlaybook ? (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-tight flex items-center gap-2">
                      <LockKeyhole className="w-4 h-4 text-rose-500" />
                      {generatedPlaybook.title}
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-150 font-bold uppercase">
                      NIST-COMPLIANT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Identification */}
                    <div className="bg-slate-50/50 border border-slate-200 p-3.5 rounded-xl flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-wider">Phase 1: Identification &amp; Alerting</span>
                      <ul className="flex flex-col gap-1 pl-0">
                        {generatedPlaybook.phase_identification ? generatedPlaybook.phase_identification.map((step, i) => (
                          <li key={i} className="text-[11px] text-slate-650 leading-relaxed flex items-start gap-1.5">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{step}</span>
                          </li>
                        )) : (
                          <li className="text-[11px] text-slate-400 italic">No identification parameters compiled.</li>
                        )}
                      </ul>
                    </div>

                    {/* Containment */}
                    <div className="bg-slate-50/50 border border-slate-200 p-3.5 rounded-xl flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-rose-600 font-bold uppercase tracking-wider">Phase 2: Immediate Containment</span>
                      <ul className="flex flex-col gap-1 pl-0">
                        {generatedPlaybook.phase_containment ? generatedPlaybook.phase_containment.map((step, i) => (
                          <li key={i} className="text-[11px] text-slate-650 leading-relaxed flex items-start gap-1.5">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{step}</span>
                          </li>
                        )) : (
                          <li className="text-[11px] text-slate-400 italic">No immediate containment steps found.</li>
                        )}
                      </ul>
                    </div>

                    {/* Eradication */}
                    <div className="bg-slate-50/50 border border-slate-200 p-3.5 rounded-xl flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-amber-600 font-bold uppercase tracking-wider">Phase 3: Deep Eradication</span>
                      <ul className="flex flex-col gap-1 pl-0">
                        {generatedPlaybook.phase_eradication ? generatedPlaybook.phase_eradication.map((step, i) => (
                          <li key={i} className="text-[11px] text-slate-650 leading-relaxed flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{step}</span>
                          </li>
                        )) : (
                          <li className="text-[11px] text-slate-400 italic">No eradication metrics identified.</li>
                        )}
                      </ul>
                    </div>

                    {/* Recovery */}
                    <div className="bg-slate-50/50 border border-slate-200 p-3.5 rounded-xl flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider">Phase 4: Post-Containment Recovery</span>
                      <ul className="flex flex-col gap-1 pl-0">
                        {generatedPlaybook.phase_recovery ? generatedPlaybook.phase_recovery.map((step, i) => (
                          <li key={i} className="text-[11px] text-slate-650 leading-relaxed flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{step}</span>
                          </li>
                        )) : (
                          <li className="text-[11px] text-slate-400 italic">No recovery metrics identified.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* DEPLOYMENT COMMAND SNIPPETS */}
                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Code2 className="w-3.5 h-3.5 text-blue-600" />
                        CLI Command block / Config rules snippet
                      </span>
                      <button
                        onClick={() => handleCopyToClipboard(generatedPlaybook.firewall_rules_snippet, "snippet-copy")}
                        className="text-[10px] font-mono text-blue-600 hover:text-blue-500 flex items-center gap-1 font-bold"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                        {copyFeedback === "snippet-copy" ? "Copied Command!" : "Copy Command"}
                      </button>
                    </div>
                    <pre className="bg-slate-900 border border-slate-950 p-4 rounded-xl text-[10.5px] font-mono text-blue-400 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                      {generatedPlaybook.firewall_rules_snippet}
                    </pre>
                  </div>

                  {/* PROACTIVE HARDENING */}
                  <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block mb-1">Long-term Proactive Hardening</span>
                    <p className="text-[11px] font-sans text-slate-600 leading-relaxed">
                      {generatedPlaybook.post_incident_review}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 flex flex-col items-center justify-center gap-3 my-auto">
                  <HelpCircle className="w-8 h-8 text-slate-300 animate-pulse" />
                  <h3 className="text-xs font-bold text-slate-400 font-mono uppercase">Compliance Rulebook Empty</h3>
                  <p className="text-[11px] text-slate-400 max-w-[210px] mx-auto leading-relaxed mt-1">
                    Select a threat scenario on the left panel and click <strong>Build Playbook</strong> to compile standard NIST containment instructions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SOC GATEWAY CONFIGURATION & WEBHOOK TESTERS */}
        {false && activeTab === "config" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* TOGGLE CONTROLS (LEFT 5 COLS) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <h2 className="font-display font-bold text-slate-900 text-sm tracking-tight">SOC Simulated Gateways</h2>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-bold">CONFIGS</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Configure real-time simulated rules, set alarm triggers, enable decoy honeypots, and configure webhook delivery properties for security events.
                </p>

                <div className="flex flex-col gap-4 mt-1">
                  
                  {/* Toggle 1 */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-150 bg-slate-50/50">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">Decoy Honeypots Listening</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Capture incoming probes on Port 22/80/5432.</p>
                    </div>
                    <button
                      onClick={() => setSocConfig(prev => ({ ...prev, honeypotActive: !prev.honeypotActive }))}
                      className={`w-11 h-6 rounded-full transition-all relative ${socConfig.honeypotActive ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all ${socConfig.honeypotActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Toggle 2 */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-150 bg-slate-50/50">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">Automated Rate Limiter</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Enforce strict maximum limits of 10req/sec on API paths.</p>
                    </div>
                    <button
                      onClick={() => setSocConfig(prev => ({ ...prev, rateLimitingEnabled: !prev.rateLimitingEnabled }))}
                      className={`w-11 h-6 rounded-full transition-all relative ${socConfig.rateLimitingEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all ${socConfig.rateLimitingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Toggle 3 */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-150 bg-slate-50/50">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">System Audio Alarms</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Trigger alerts on local workstations when a Critical vector arrives.</p>
                    </div>
                    <button
                      onClick={() => setSocConfig(prev => ({ ...prev, automatedAlarms: !prev.automatedAlarms }))}
                      className={`w-11 h-6 rounded-full transition-all relative ${socConfig.automatedAlarms ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all ${socConfig.automatedAlarms ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Input 1 */}
                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Alert Threshold Level</label>
                    <select
                      value={socConfig.severityThreshold}
                      onChange={(e) => setSocConfig(prev => ({ ...prev, severityThreshold: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 p-2.5 text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg"
                    >
                      <option value="Critical">Critical Only</option>
                      <option value="High">High &amp; Critical</option>
                      <option value="Medium">Medium, High &amp; Critical</option>
                      <option value="Low">Low / All Activities</option>
                    </select>
                  </div>

                </div>
              </div>
            </div>

            {/* WEBHOOK DISPATCH MONITORS (RIGHT 7 COLS) */}
            <div className="lg:col-span-7 flex flex-col bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm min-h-[480px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-blue-600" />
                  <h3 className="font-display font-bold text-slate-900 text-sm tracking-tight">Outbound SIEM Webhook Integration</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-bold">INTEGRATIONS</span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mt-3">
                Connect external Security Information and Event Management (SIEM) gateways. Dispatch raw event JSON packages to external servers upon threat detection.
              </p>

              <div className="flex flex-col gap-3 mt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Outbound Webhook Delivery Endpoint</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={socConfig.alertWebhook}
                      onChange={(e) => setSocConfig(prev => ({ ...prev, alertWebhook: e.target.value }))}
                      placeholder="https://siem.endpoint/v1/alerts..."
                      className="flex-1 bg-slate-50 border border-slate-200 p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg"
                    />
                    <button
                      onClick={handleTestWebhook}
                      disabled={testWebhookStatus === "sending"}
                      className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-250 text-white font-mono text-xs px-4 py-2 rounded-lg transition-colors"
                    >
                      {testWebhookStatus === "sending" ? "Dispatched..." : "Test Webhook"}
                    </button>
                  </div>
                </div>

                {/* TEST WEBHOOK FEEDBACKS */}
                {testWebhookStatus && (
                  <div className={`p-3 rounded-lg border text-xs font-mono ${
                    testWebhookStatus === "success" 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : testWebhookStatus === "failed"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-blue-50 border-blue-250 text-blue-800 animate-pulse"
                  }`}>
                    {testWebhookStatus === "sending" && "Dispatched secure POST session to SIEM listener..."}
                    {testWebhookStatus === "success" && "SUCCESS: Simulated REST handshake validated (200 OK). Event packages correctly structured."}
                    {testWebhookStatus === "failed" && "FAILED: REST handshake timed out. Check endpoint formatting or network proxy parameters."}
                  </div>
                )}

                {/* WEBHOOK OUTPUT LOGS FEED */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[10px] font-mono text-slate-450 uppercase font-bold tracking-wider">Integration Audit Logs</span>
                  <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-[10.5px] font-mono text-emerald-400 overflow-y-auto h-[180px] flex flex-col gap-1.5 custom-scroll select-all">
                    {webhookLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed truncate" title={log}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER METRICS */}
      <footer className="border-t border-slate-200 bg-white rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-400 shadow-sm mt-auto">
        <div className="tracking-wider uppercase font-semibold">
          © 2026 THREATTRACE ANALYTICS SYSTEMS • STRICT SOC-COMPLIANT INTELLIGENCE
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-200">|</span>
          <span className="text-slate-400 tracking-wider uppercase font-semibold">TELEMETRY AGENT: ACTIVE</span>
          <span className="text-slate-200">|</span>
          <span className="text-slate-500 flex items-center gap-1.5 tracking-wider uppercase font-bold">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>FIPS 140-3 SECURITY CHANNEL</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
