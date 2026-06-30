import { Archive } from 'lucide-react';

export default function ArchivePage() {
  return (
    <div className="page-container pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="page-title">Archive</h1>
        <p className="page-description">Archived items will appear here. This section is coming soon.</p>
      </div>
      <div className="content-card flex flex-col items-center justify-center py-24 px-6">
        <div className="max-w-md text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Archive className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">No archived items yet.</p>
        </div>
      </div>
    </div>
  );
}
