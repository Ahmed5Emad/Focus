import { Archive } from 'lucide-react';

export default function ArchivePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4">
      <div className="max-w-md text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
          <Archive className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Archive</h2>
        <p className="text-slate-500 max-w-sm">Archived items will appear here. This section is coming soon.</p>
      </div>
    </div>
  );
}
