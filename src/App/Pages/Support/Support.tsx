import { HelpCircle } from 'lucide-react';

export default function Support() {
  return (
    <div className="page-container pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="page-title">Support</h1>
        <p className="page-description">Need help? Reach out to our support team.</p>
      </div>
      <div className="content-card flex flex-col items-center justify-center py-24 px-6">
        <div className="max-w-md text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">This section is coming soon.</p>
        </div>
      </div>
    </div>
  );
}
