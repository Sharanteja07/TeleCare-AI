import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { ticketService } from '../../services/ticketService';
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const UpdateStatus = () => {
  const [ticketId, setTicketId] = useState('');
  const [ticket, setTicket] = useState(null);
  const [statusVal, setStatusVal] = useState('in-progress');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = () => {
    setError('');
    setSuccess(false);
    (async () => {
      try {
        const found = await ticketService.getTicketById(ticketId.toUpperCase().trim());
        if (found) {
          setTicket(found);
          setStatusVal(found.status);
        } else {
          setTicket(null);
          setError(`Ticket with ID "${ticketId}" not found in system database.`);
        }
      } catch (err) {
        setTicket(null);
        setError(err.message || 'Lookup failed');
      }
    })();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!ticket) return;

    setLoading(true);
    // Simulate updating ticket
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    try {
      const updated = await ticketService.updateStatus(ticket.id, statusVal);
      setTicket(updated);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-800/40 pb-5">
        <h1 className="text-3xl font-display font-bold text-white">Override Incident Status</h1>
        <p className="text-slate-400 text-xs font-sans mt-1">
          Perform administrative state overrides on active tickets in the network queue database.
        </p>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <Card title="Database Override Panel" subtitle="Search and modify any ticket's current state">
          <div className="flex flex-col gap-5">
            
            {/* Search Input */}
            <div className="flex gap-3 items-end">
              <Input
                label="Search Ticket ID"
                placeholder="e.g. TCK-1082"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
              />
              <Button onClick={handleSearch} variant="secondary" className="py-3 px-6 h-[46px] text-xs">
                Lookup ID
              </Button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs font-sans text-rose-300 flex items-center gap-2">
                <AlertTriangle size={15} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-xs font-sans text-emerald-300 flex items-center gap-2">
                <CheckCircle size={15} />
                <span>Ticket status overridden successfully in local database.</span>
              </div>
            )}

            {ticket && (
              <form onSubmit={handleUpdate} className="flex flex-col gap-5 border-t border-slate-900/60 pt-5 mt-2 animate-fade-in">
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-slate-500">Ticket Reference:</span>
                    <p className="text-white font-semibold mt-0.5">{ticket.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Target Customer:</span>
                    <p className="text-white font-semibold mt-0.5">{ticket.customerName}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Current Title:</span>
                    <p className="text-slate-300 mt-0.5">{ticket.title}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-display font-medium text-slate-400">Override Status State</label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className="glass-input text-xs w-full py-2.5 mt-1"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved / Closed</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  glow
                  loading={loading}
                  className="w-full py-3.5 mt-2"
                >
                  <RefreshCw size={15} className="mr-2 animate-spin" />
                  <span>Commit Status Change</span>
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UpdateStatus;
