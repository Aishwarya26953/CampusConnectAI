import { useState, useEffect } from 'react';
import { Megaphone, Pin } from 'lucide-react';
import { announcementService } from '../../services';
import { Card, SkeletonCard, EmptyState, PageHeader, Badge } from '../../components/ui';

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.list();
      setAnnouncements(res.data);
    } catch { toast.error('Failed to load announcements'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Announcements" subtitle="View announcements" />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : announcements.length === 0 ? (
        <Card><EmptyState icon={Megaphone} title="No announcements" /></Card>
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => (
            <div key={ann.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{ann.title}</h3>
                    {ann.is_pinned && <Pin className="w-4 h-4 text-primary-600" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={ann.target_role === 'all' ? 'blue' : 'purple'}>
                      {ann.target_role === 'all' ? 'Everyone' : ann.target_role}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 line-clamp-3 mb-2">{ann.content}</p>
              <p className="text-xs text-slate-400">by {ann.admin?.name} • {new Date(ann.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}