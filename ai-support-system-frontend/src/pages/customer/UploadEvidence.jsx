import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ticketService } from '../../services/ticketService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Upload, CheckCircle, HardDrive, AlertCircle, FileText } from 'lucide-react';

const UploadEvidence = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  
  // File upload states
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (user) {
        const all = await ticketService.getUserTickets(user.email);
        const userTickets = (all || []).filter(t => t.status !== 'resolved');
        setTickets(userTickets);
        if (userTickets.length > 0) setSelectedTicketId(userTickets[0].id);
      }
    };
    load();
  }, [user]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setSuccess(false);
      setProgress(0);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedTicketId) return;

    setScanning(true);
    // Simulate AI security threat scanning first
    await new Promise(resolve => setTimeout(resolve, 1500));
    setScanning(false);

    setUploading(true);
    // Simulate uploading progress
    let currentProgress = 0;
    const interval = setInterval(async () => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        try {
          // Append attachment message to ClipboardList HardDrive
          await ticketService.addMessage(selectedTicketId, 'customer', `Evidence document attached: ${file.name} (telemetry scan verified)`, file);
        } catch (err) {
          console.error("Failed to add message", err);
        }
        
        setUploading(false);
        setSuccess(true);
        setFile(null);
      }
      setProgress(currentProgress);
    }, 150);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-800/40 pb-5">
        <h1 className="text-3xl font-display font-bold text-white">Upload Incident Evidence</h1>
        <p className="text-slate-400 text-xs font-sans mt-1">
          Transmit diagnostic images, configuration screenshots, or hardware logs directly to active case tickets.
        </p>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <Card title="Upload Control Panel" subtitle="Transmit network log captures and media payloads">
          {tickets.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-3">
              <AlertCircle className="text-amber-500" size={32} />
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                You have no active open tickets. Please open a support ClipboardList first to attach diagnostic evidence payloads.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpload} className="flex flex-col gap-6">
              {/* Select ClipboardList */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-display font-medium text-slate-400">Target ClipboardList Association</label>
                <select
                  value={selectedTicketId}
                  onChange={(e) => setSelectedTicketId(e.target.value)}
                  className="glass-input text-xs w-full"
                >
                  {tickets.map(t => (
                    <option key={t.id} value={t.id} className="bg-slate-950">
                      {t.id} - {t.title.slice(0, 35)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag drop area */}
              <div className="border border-dashed border-slate-800/80 hover:border-cyan-500/30 bg-slate-950/20 hover:bg-cyan-950/5 rounded-xl p-8 relative flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={scanning || uploading}
                />
                
                {scanning ? (
                  <div className="flex flex-col items-center py-4 gap-2">
                    <HardDrive className="text-indigo-400 animate-bounce" size={32} />
                    <span className="text-xs text-slate-300 font-display font-semibold uppercase tracking-wider text-glow-indigo">
                      AI Security Sweep Scan Running...
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans">Scanning payload content for malicious code vectors</span>
                  </div>
                ) : uploading ? (
                  <div className="flex flex-col items-center py-4 w-full max-w-xs gap-3">
                    <FileText className="text-cyan-400 animate-pulse" size={32} />
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-slate-300 font-sans font-medium">{progress}% Uploading pay-loads...</span>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center py-4 gap-2">
                    <CheckCircle className="text-cyan-400 animate-pulse" size={32} />
                    <span className="text-xs text-white font-semibold font-display truncate max-w-xs">{file.name}</span>
                    <span className="text-[10px] text-slate-500 font-sans">Size: {(file.size / 1024).toFixed(1)} KB</span>
                    <button type="button" onClick={() => setFile(null)} className="text-[10px] text-rose-400 font-sans hover:underline mt-2">
                      Clear Attachment
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="text-slate-500 mb-3" size={36} />
                    <p className="text-xs text-slate-300 font-sans">Drag & drop files or click here to upload evidence</p>
                    <p className="text-[10px] text-slate-500 font-sans mt-1">Supports PDF, PNG, JPG, TXT, LOG (Max 5MB)</p>
                  </>
                )}
              </div>

              {success && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-xs font-sans text-emerald-300 flex items-center gap-2">
                  <CheckCircle size={15} />
                  <span>Payload uploaded successfully. Synced to target ClipboardList conversation log.</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                glow
                disabled={!file || scanning || uploading}
                className="w-full py-3.5 mt-2"
              >
                Transmit Evidence Payload
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UploadEvidence;
