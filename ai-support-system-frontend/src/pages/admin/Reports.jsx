import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Download, CheckCircle, HardDrive } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('Incidents Summary');
  const [format, setFormat] = useState('PDF');
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const [reportsList, setReportsList] = useState([
    { name: "SLA_Response_June26.csv", size: "48 KB", date: "July 1, 2026", format: "CSV" },
    { name: "AI_Resolution_Audit_Q2.pdf", size: "1.4 MB", date: "July 5, 2026", format: "PDF" },
    { name: "Incident_Outage_Report_Ring4.pdf", size: "320 KB", date: "July 12, 2026", format: "PDF" },
  ]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setSuccess(false);

    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newReport = {
      name: `${reportType.replace(/\s+/g, '_')}_Generated.${format.toLowerCase()}`,
      size: format === 'PDF' ? '412 KB' : '18 KB',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      format
    };

    setReportsList(prev => [newReport, ...prev]);
    setGenerating(false);
    setSuccess(true);
  };

  const triggerDownload = (name) => {
    alert(`Downloading ${name}...`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-800/40 pb-5">
        <h1 className="text-3xl font-display font-bold text-white">System Reports Generator</h1>
        <p className="text-slate-400 text-xs font-sans mt-1">
          Export incident logs, diagnostic sheets, and staff performance parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Report configuration */}
        <div className="lg:col-span-1">
          <Card title="Configure Export" subtitle="Select parameters for compilation payload">
            <form onSubmit={handleGenerate} className="flex flex-col gap-5 text-xs font-sans">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400">Report Category</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="glass-input text-xs w-full py-2.5 mt-1"
                >
                  <option value="Incidents Summary">Incidents Summary</option>
                  <option value="SLA Response Times">SLA Response Times</option>
                  <option value="AI Resolutions Audit">AI Resolutions Audit</option>
                  <option value="Technician Sat Ratings">Technician Sat Ratings</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400">File Output Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="glass-input text-xs w-full py-2.5 mt-1"
                >
                  <option value="PDF">PDF Report Document</option>
                  <option value="CSV">CSV Data Spreadsheet</option>
                </select>
              </div>

              {success && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-900/35 text-emerald-300 rounded-xl flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle size={14} />
                  <span>Report generated successfully!</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                glow
                loading={generating}
                className="w-full py-3.5 mt-2"
              >
                <span>Compile & Generate Report</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* Available downloads list */}
        <div className="lg:col-span-2">
          <Card title="Generated Archives" subtitle="Recently compiled logs available for local download">
            <div className="flex flex-col gap-3.5 mt-2">
              {reportsList.map((rep, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/20 hover:bg-slate-900/60 transition-all flex items-center justify-between"
                >
                  <div className="flex flex-col gap-1 truncate pr-4">
                    <h4 className="text-xs font-semibold text-white truncate font-display">{rep.name}</h4>
                    <span className="text-[10px] text-slate-500 font-sans">Compiled: {rep.date} &bull; Size: {rep.size}</span>
                  </div>

                  <button
                    onClick={() => triggerDownload(rep.name)}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition-all flex items-center justify-center shrink-0"
                  >
                    <Download size={15} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
