
import React, { useState } from 'react';
import { submitReport } from '../services/apiService';

interface ReportModalProps {
  targetId: string;
  targetName: string;
  targetType: 'TouristSpot' | 'DiningSpot' | 'BlogPost';
  onClose: () => void;
}

const REASONS = [
    'Incorrect Information',
    'Permanently Closed',
    'Duplicate Listing',
    'Inappropriate Content',
    'Offensive Images',
    'Spam',
    'Other'
];

const ReportModal: React.FC<ReportModalProps> = ({ targetId, targetName, targetType, onClose }) => {
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
        await submitReport({
            targetId,
            targetName,
            targetType,
            reason,
            description
        });
        setSuccess(true);
        setTimeout(onClose, 2000);
    } catch (err) {
        setError('Failed to submit report. Please try again.');
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-200" onClick={e => e.stopPropagation()}>
            {success ? (
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-check text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Report Submitted</h3>
                    <p className="text-slate-600 mt-2">Thank you for helping us keep our information accurate.</p>
                </div>
            ) : (
                <>
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <i className="fas fa-flag text-lt-red"></i> Report Issue
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6">
                        <p className="text-sm text-slate-500 mb-4">
                            Reporting: <span className="font-bold text-slate-800">{targetName}</span>
                        </p>
                        
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason</label>
                            <select 
                                value={reason} 
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lt-red focus:outline-none text-sm"
                            >
                                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Details (Optional)</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lt-red focus:outline-none text-sm"
                                rows={3}
                                placeholder="Provide more details..."
                            ></textarea>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3">
                            {error && <p className="text-xs text-red-600 font-bold w-full mb-2">{error}</p>}
                            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-lt-red text-white font-bold text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    </div>
  );
};

export default ReportModal;
