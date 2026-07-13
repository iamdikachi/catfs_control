import React, { useState } from "react";
import { Search, Loader2, History, AlertCircle, FileText, CheckCircle, HelpCircle, RefreshCcw, Download, UserCheck, ShieldAlert } from "lucide-react";

export default function StatusTracker() {
  const [refQuery, setRefQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);

  const handleTrack = async (e?: React.FormEvent, explicitRef?: string) => {
    if (e) e.preventDefault();
    const query = (explicitRef || refQuery).trim().toUpperCase();
    if (!query) return;

    setLoading(true);
    setErrorMsg(null);
    setReportData(null);

    try {
      const res = await fetch(`/api/reports/track/${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Report not found.");
      }

      setReportData(data);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while tracking the report.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case "Submitted": return 0;
      case "Under Review": return 1;
      case "Investigating": return 2;
      case "Resolved": return 3;
      default: return 0;
    }
  };

  const currentStep = reportData ? getStatusStep(reportData.report.status) : 0;
  const steps = ["Submitted", "Under Review", "Investigating", "Resolved"];

  const handleDownloadCSV = async () => {
    if (!reportData) return;
    try {
      const res = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: reportData.report.id,
          format: "csv"
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `case_${reportData.report.tracking_ref}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Failed to export CSV");
      }
    } catch (err) {
      console.error(err);
      alert("Error exporting report");
    }
  };

  return (
    <div className="bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          Public Incident Status Tracer
        </h2>
        <p className="text-xs text-slate-500 mt-1 leading-normal">
          Section 5.2 &amp; Section 5.3: Anonymous query interface. Input a tracking reference code to pull timestamped, cryptographic verification trails, status progression logs, and evidence files.
        </p>
      </div>

      <form onSubmit={(e) => handleTrack(e)} className="flex gap-2.5">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={refQuery}
            onChange={(e) => setRefQuery(e.target.value)}
            placeholder="Enter Tracking Reference (e.g. REF-8231-A42F)"
            className="w-full bg-slate-50 border border-slate-200 text-xs pl-10 pr-3.5 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-mono tracking-wider"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-200 text-white text-xs font-semibold px-5 rounded-xl transition-all flex items-center gap-1"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            "Trace Incident"
          )}
        </button>
      </form>

      {/* QUICK PRESETS FOR ACADEMIC TESTING */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Demo Presets:</span>
        <button
          onClick={(e) => { setRefQuery("REF-8231-A42F"); handleTrack(e, "REF-8231-A42F"); }}
          className="bg-slate-50 border border-slate-200 text-[10px] text-slate-600 hover:text-blue-600 hover:border-blue-400 font-mono px-2.5 py-1 rounded transition-all"
        >
          REF-8231-A42F (DDoS)
        </button>
        <button
          onClick={(e) => { setRefQuery("REF-4412-B90A"); handleTrack(e, "REF-4412-B90A"); }}
          className="bg-slate-50 border border-slate-200 text-[10px] text-slate-600 hover:text-blue-600 hover:border-blue-400 font-mono px-2.5 py-1 rounded transition-all"
        >
          REF-4412-B90A (SQLi)
        </button>
        <button
          onClick={(e) => { setRefQuery("REF-1190-C22E"); handleTrack(e, "REF-1190-C22E"); }}
          className="bg-slate-50 border border-slate-200 text-[10px] text-slate-600 hover:text-blue-600 hover:border-blue-400 font-mono px-2.5 py-1 rounded transition-all"
        >
          REF-1190-C22E (SSH)
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl text-rose-600 text-xs flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">Tracing Failure:</span>
            <p className="mt-0.5 text-rose-500 leading-normal">{errorMsg}</p>
          </div>
        </div>
      )}

      {reportData && (
        <div className="border border-slate-250/70 rounded-xl p-5 flex flex-col gap-6 bg-slate-50/40 animate-fade-in">
          
          {/* Header Summary info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">
                  SECURE TRACE
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {reportData.report.id}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2 font-mono text-base">
                {reportData.report.tracking_ref}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-sans">
                {reportData.report.attack_type} on <span className="font-mono text-slate-700 font-semibold">{reportData.report.affected_system}</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                reportData.report.severity === "Critical" ? "bg-rose-100 text-rose-700" :
                reportData.report.severity === "High" ? "bg-amber-100 text-amber-750" :
                reportData.report.severity === "Medium" ? "bg-blue-100 text-blue-700" :
                "bg-slate-100 text-slate-600"
              }`}>
                {reportData.report.severity} Severity
              </span>

              <button
                onClick={handleDownloadCSV}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                title="Download CSV Incident Summary"
              >
                <Download className="w-3.5 h-3.5" />
                Case File (CSV)
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar (Section 5.3) */}
          <div className="flex flex-col gap-3 bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Investigation Lifecycle Progression</span>
            
            <div className="grid grid-cols-4 items-center justify-between relative mt-2 gap-2">
              {/* Connector line behind */}
              <div className="absolute top-4 left-0 right-0 h-1 bg-slate-100 -z-10 rounded-full" />
              <div 
                className="absolute top-4 left-0 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500" 
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />

              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isActive = idx === currentStep;

                return (
                  <div key={idx} className="flex flex-col items-center text-center gap-1">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompleted 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "bg-white border-slate-200 text-slate-400"
                    } ${isActive ? "ring-4 ring-blue-100 font-bold scale-110" : "scale-100"}`}>
                      {isCompleted && idx < currentStep ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-[11px] font-mono font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold mt-1 truncate max-w-full ${
                      isActive ? "text-blue-600 font-extrabold" :
                      isCompleted ? "text-slate-800" : "text-slate-400"
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incident Description */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Narrative Description</span>
            <div className="bg-white border border-slate-200/50 p-4 rounded-xl shadow-sm text-xs text-slate-700 leading-relaxed font-sans">
              {reportData.report.description}
            </div>
          </div>

          {/* Status Timeline History Logs (Append-Only) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Audit Status Change Log (Append-Only)</span>
              <span className="text-[9px] text-slate-400 font-mono">Required by Sec 5.2.2</span>
            </div>

            <div className="flex flex-col gap-3">
              {reportData.history && reportData.history.length > 0 ? (
                reportData.history.map((log: any, idx: number) => (
                  <div key={log.id || idx} className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-3 relative">
                    <div className="flex gap-3">
                      {/* Left color bar reflecting transition */}
                      <div className="w-1 rounded-full bg-blue-500 self-stretch" />
                      
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1">
                            {log.old_status === "-" ? "Submitted" : `${log.old_status} → ${log.new_status}`}
                          </span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            {log.changed_by_name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans">
                          {log.note}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 block font-medium">
                        {new Date(log.changed_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 bg-white border border-slate-200/50 rounded-xl">
                  No transitions recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Evidence files */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Evidence Files &amp; Payload Logs</span>
            {reportData.evidence && reportData.evidence.length > 0 ? (
              reportData.evidence.map((ev: any, idx: number) => (
                <div key={ev.id || idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-mono font-bold text-slate-300">{ev.file_name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">{new Date(ev.uploaded_at).toLocaleString()}</span>
                  </div>
                  <pre className="text-[10px] font-mono text-blue-400 overflow-x-auto whitespace-pre-wrap leading-normal bg-slate-950 p-3 rounded-lg border border-slate-850 max-h-56">
                    {ev.content_summary}
                  </pre>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-slate-400 bg-white border border-slate-200/50 rounded-xl">
                No telemetry files uploaded for this case.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
