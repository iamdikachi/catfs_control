import { useState } from "react";
import { 
  BookOpen, ChevronLeft, ChevronRight, Layers, Table, Calendar, AlertOctagon, 
  Settings, GitMerge, Database, Shield, Server, FileText, CheckCircle2 
} from "lucide-react";

export default function DefenseDeck() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "1. Three-Tier System Architecture (Sec 3.0)",
      subtitle: "Academic Framework & Core Ingress Flow",
      icon: <Layers className="w-5 h-5 text-blue-600" />,
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            The Cyber Attack Tracing System is built on an enterprise-grade 3-tier architectural plan ensuring high-availability, sandboxed execution, and isolated security audits.
          </p>

          {/* SVG Diagram representation */}
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-850 flex flex-col items-center justify-center gap-4 text-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Interactive Ingress Topology Map</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 items-center w-full max-w-lg gap-4 relative py-2">
              {/* Box 1 */}
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex flex-col items-center gap-1.5 shadow-md">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-bold text-slate-200">User Ingress SPA</span>
                <span className="text-[9px] font-mono text-slate-500">React + Tailwind CSS</span>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex flex-col items-center text-slate-600 font-mono text-[9px]">
                <span>HTTPS API</span>
                <span className="text-lg">➔</span>
              </div>

              {/* Box 2 */}
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex flex-col items-center gap-1.5 shadow-md">
                <Server className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">NestJS Middleware</span>
                <span className="text-[9px] font-mono text-slate-500">Node controller Layer</span>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex flex-col items-center text-slate-600 font-mono text-[9px]">
                <span>TypeORM</span>
                <span className="text-lg">➔</span>
              </div>

              {/* Box 3 */}
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex flex-col items-center gap-1.5 shadow-md col-span-1 md:col-span-1 self-center justify-self-center">
                <Database className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">PostgreSQL DB</span>
                <span className="text-[9px] font-mono text-slate-500">Relational Schema</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-400 text-left w-full leading-normal bg-slate-950/50 p-3 rounded-lg border border-slate-850">
              <span className="text-blue-400 font-bold">Trace Mechanism:</span> Public clients enter incident details anonymously. System hashes credentials and registers the report. Staff log in via the clearance console, trigger Gemini SDK log analysis, and generate containment scripts that serialize into the PostgreSQL audit history block.
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. Recommeded Technology Stack (Sec 4.0)",
      subtitle: "Optimized for Academic Feasibility and Scalability",
      icon: <Settings className="w-5 h-5 text-blue-600" />,
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-600 leading-normal">
            To assure defense readiness on a compressed calendar, we utilize a highly cohesive, containerized JavaScript stack paired with Google's modern AI models.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-1.5">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Next.js / Express SPA
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Handles high-contrast UI state rendering, layout animations, client local state triggers, and interactive traceroute charts via Recharts, avoiding template bloat.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-1.5">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                NestJS controller API
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Structured controllers organize public and staff endpoints securely. In-memory local file streaming simulates physical PostgreSQL database boundaries flawlessly.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-1.5">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                PostgreSQL Relational DB
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Structures table associations between reported incident logs, assigned staff roles, append-only history logs, and system audit logs.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-1.5">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Google Gemini LLM SDK
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Integrates server-side LLM diagnostics. Analyzes syslog packets and outputs firewall configuration structures and containment playbooks in milliseconds.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. Interactive Schema Diagram (Sec 6.0)",
      subtitle: "Relational Tables and Cryptographic Audit Constraints",
      icon: <Table className="w-5 h-5 text-blue-600" />,
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-600 leading-normal">
            Below is the precise database schema design proposed in Section 6.0. It defines the constraints, data-types, and indexes necessary for secure operation.
          </p>

          <div className="flex border border-slate-200 rounded-xl overflow-hidden text-[11px]">
            {/* Left selector */}
            <div className="bg-slate-55 border-r border-slate-200 font-mono flex flex-col text-slate-600 shrink-0 p-1">
              <span className="p-1.5 font-bold uppercase text-[9px] text-slate-400">Database Tables</span>
              <span className="bg-white text-blue-600 font-bold px-2 py-1.5 rounded shadow-sm border border-slate-200">reports</span>
              <span className="px-2 py-1.5">users</span>
              <span className="px-2 py-1.5">evidence</span>
              <span className="px-2 py-1.5">status_history</span>
              <span className="px-2 py-1.5">audit_logs</span>
            </div>

            {/* Schema Table */}
            <div className="p-3 bg-white flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10.5px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono font-bold text-[9px]">
                    <th className="pb-1.5">Column</th>
                    <th className="pb-1.5">Type</th>
                    <th className="pb-1.5">Constraints</th>
                    <th className="pb-1.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  <tr>
                    <td className="py-1.5 font-bold text-slate-800">id</td>
                    <td className="py-1.5">UUID / string</td>
                    <td className="py-1.5">PRIMARY KEY</td>
                    <td className="py-1.5 font-sans">Unique system identifier.</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-bold text-slate-800">tracking_ref</td>
                    <td className="py-1.5">VARCHAR(30)</td>
                    <td className="py-1.5">UNIQUE, INDEX</td>
                    <td className="py-1.5 font-sans">Cryptographic randomized tracer code (e.g. REF-XXXX-XXXX).</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-bold text-slate-800">severity</td>
                    <td className="py-1.5">VARCHAR(10)</td>
                    <td className="py-1.5">NOT NULL</td>
                    <td className="py-1.5 font-sans">Low, Medium, High, or Critical threat tier.</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-bold text-slate-800">status</td>
                    <td className="py-1.5">VARCHAR(20)</td>
                    <td className="py-1.5">DEFAULT 'Submitted'</td>
                    <td className="py-1.5 font-sans">Submitted, Under Review, Investigating, Resolved.</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-bold text-slate-800">assigned_to</td>
                    <td className="py-1.5">UUID</td>
                    <td className="py-1.5">FOREIGN KEY</td>
                    <td className="py-1.5 font-sans">Links to Investigator users table record.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4. Five-Phase Timeline (Sec 7.0)",
      subtitle: "Implementation Milestones & Execution Plan",
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-600 leading-normal">
            Our systematic phase-based delivery plan guarantees a stable prototype rollout within a strict academic calendar.
          </p>

          <div className="flex flex-col border border-slate-200/80 rounded-xl bg-white shadow-sm overflow-hidden divide-y divide-slate-100">
            <div className="p-3.5 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono mt-0.5">1</span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Phase 1: Project Setup &amp; Interface Layout (Week 1)</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Establish container frameworks. Standardize React Vite and routing. Build modern high-contrast pages and Recharts widgets.
                </p>
              </div>
            </div>

            <div className="p-3.5 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono mt-0.5">2</span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Phase 2: Database Schema &amp; Audit Logger (Week 2)</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Configure local SQLite or disk JSON persistence. Solidify append-only status transitions tables and secure audit logs.
                </p>
              </div>
            </div>

            <div className="p-3.5 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono mt-0.5">3</span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Phase 3: NestJS Controller Routing APIs (Week 3)</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Mount Express/Nest API controllers. Setup POST report triggers, PUT status controls, and secure GET lists. Integrate Gemini AI key parameters.
                </p>
              </div>
            </div>

            <div className="p-3.5 flex items-start gap-3 bg-emerald-50/20">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono mt-0.5">✔</span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Phase 4 &amp; 5: Testing, Hardening &amp; Production Deployment (Completed)</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Verify end-to-end integration. Deploy securely to Google Cloud Run containers on Port 3000 behind reverse-proxy ingress configurations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "5. Risks, Trade-offs & Security (Sec 9.0)",
      subtitle: "Designing for Anonymity vs. Accountability",
      icon: <AlertOctagon className="w-5 h-5 text-blue-600" />,
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-600 leading-normal">
            Section 9.0 outlines the design risks of malicious report spamming when allowing anonymous submissions, and how our architecture counters this.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rose-50/40 border border-rose-150 p-4 rounded-xl flex flex-col gap-2">
              <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <AlertOctagon className="w-4.5 h-4.5" />
                The Anonymity Spam Threat
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                By allowing public anonymous submissions, malicious users could spam false threat records, exhausting SOC investigator capacity and database indexing tables.
              </p>
            </div>

            <div className="bg-emerald-50/40 border border-emerald-150 p-4 rounded-xl flex flex-col gap-2">
              <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Shield className="w-4.5 h-4.5" />
                Audited Countermeasures
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                Our Secure Audit module logs every submission with cryptographic timestamps. Combined with Gemini log integrity validation, false telemetry payloads are filtered out automatically.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const current = slides[activeSlide];

  return (
    <div className="bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      
      {/* Title & Navigation controls */}
      <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Academic Defense Presentation Deck
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Section 3 - 9: Live interactive defense slides supporting thesis evaluation and development walkthroughs.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1 self-start md:self-auto">
          <button
            onClick={prevSlide}
            className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-600 hover:text-slate-900"
            title="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-600 px-3 select-none">
            Slide {activeSlide + 1} of {slides.length}
          </span>
          <button
            onClick={nextSlide}
            className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-600 hover:text-slate-900"
            title="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Canvas */}
      <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-6 animate-fade-in flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-150/40 shrink-0 mt-0.5">
            {current.icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{current.title}</h3>
            <p className="text-[11px] text-slate-400 font-medium font-mono">{current.subtitle}</p>
          </div>
        </div>

        <div className="border-t border-slate-200/50 pt-4 mt-1 font-sans">
          {current.content}
        </div>
      </div>

      {/* Footer Navigation indicators */}
      <div className="flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              activeSlide === idx ? "w-6 bg-blue-600" : "w-2 bg-slate-200 hover:bg-slate-300"
            }`}
          />
        ))}
      </div>

    </div>
  );
}
