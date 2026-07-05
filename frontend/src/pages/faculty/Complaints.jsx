import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import { complaintService } from '../../services';
import { Card, SkeletonCard, EmptyState, PageHeader, Badge, StatusBadge, PriorityBadge } from '../../components/ui';

export default function FacultyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await complaintService.list();
      setComplaints(res.data);
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Complaints" subtitle="View and manage complaints" />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : complaints.length === 0 ? (
        <Card><EmptyState icon={ClipboardList} title="No complaints" /></Card>
      ) : (
        <div className="space-y-3">
          {complaints.map(comp => (
            <div key={comp.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{comp.title}</h3>
                    <Badge color="gray">{comp.category}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">by {comp.student?.name}</p>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority={comp.ai_priority} />
                  <StatusBadge status={comp.status} />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">{comp.description}</p>
              {comp.location && <p className="text-xs text-slate-500 mb-2">📍 {comp.location}</p>}
              {comp.ai_priority_reason && (
                <div className="p-3 bg-amber-50 rounded-lg mb-3">
                  <p className="text-xs text-amber-800">{comp.ai_priority_reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}