import { HelpCircle } from 'lucide-react';

export default function Support() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4">
      <div className="max-w-md text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
          <HelpCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Support</h2>
        <p className="text-slate-500 max-w-sm">Need help? Reach out to our support team. This section is coming soon.</p>
      </div>
    </div>
  );
}
