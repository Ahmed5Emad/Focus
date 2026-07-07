import { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  Mail,
  MessageCircle,
  BookOpen,
  Search,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How do I create a new task?",
    answer:
      "Navigate to the Tasks page using the sidebar, then click the 'New Task' button in the top-right corner. You can also use the keyboard shortcut Cmd/Ctrl + K to open the command palette and quickly create a task.",
  },
  {
    question: "Can I assign tasks to other team members?",
    answer:
      "Yes! When creating or editing a task, you'll find an assignee dropdown. Select any member of your workspace to assign them the task. Assigned tasks will appear in their task list.",
  },
  {
    question: "How do I start a focus session?",
    answer:
      "Click the 'Start Session' button on your Dashboard, or navigate to the Focus Timer page. You can optionally link a session to a specific task to track time spent on it.",
  },
  {
    question: "What is the flow score?",
    answer:
      "The flow score measures the quality of your focus session. It starts at 100 and decreases based on logged distractions (minor: -5, major: -15). Longer sessions earn bonus points up to +20, with a max score of 100.",
  },
  {
    question: "How do workspaces work?",
    answer:
      "Workspaces provide isolated environments for different teams or projects. Each workspace has its own tasks, projects, goals, and members. You can switch between workspaces from the Settings page.",
  },
  {
    question: "Can I restore archived items?",
    answer:
      "Yes! Go to the Archive page via the sidebar. Find the item you want to restore and click the restore icon. Archived tasks and projects can be brought back at any time.",
  },
  {
    question: "How do I invite team members?",
    answer:
      "Navigate to Settings > Workspace. In the 'Invite Members' section, enter the email address of the person you want to invite and select their role. They'll receive an invitation to join your workspace.",
  },
  {
    question: "Is my data synced across devices?",
    answer:
      "Yes, all your data is synced in real-time via Supabase. Changes made on one device will automatically appear on all other devices connected to the same account.",
  },
];

const supportOptions = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our support team in real-time.",
    action: "Start Chat",
    href: "/chat",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us an email and we'll get back to you.",
    action: "Send Email",
    href: "mailto:support@focus.app",
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Read our detailed guides and API docs.",
    action: "View Docs",
    href: "/docs",
  },
];

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="page-container pt-3">
      <div className="flex flex-col gap-0.5 mb-4">
        <h1 className="page-title">Support</h1>
        <p className="page-description">
          Find answers to common questions or reach out to our team.
        </p>
      </div>

      <div className="relative w-full max-w-md mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        <Input
          placeholder="Search FAQs..."
          className="pl-10 bg-white border-slate-100 h-10 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="font-['Spline_Sans',sans-serif] font-semibold text-slate-700 text-[12px] tracking-[1.2px] uppercase">
                Frequently Asked Questions
              </h3>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <HelpCircle className="w-12 h-12 text-slate-300 mb-4" />
                <p className="font-['Inter',sans-serif] text-[16px] text-slate-600 font-medium">
                  No matching questions found
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Try a different search term or browse the categories below.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredFaqs.map((faq, index) => (
                  <div key={index}>
                    <button
                      onClick={() =>
                        setOpenIndex(openIndex === index ? null : index)
                      }
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="font-['Spline_Sans',sans-serif] text-[15px] font-semibold text-slate-900 pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200",
                          openIndex === index && "rotate-180",
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        openIndex === index ? "max-h-96" : "max-h-0",
                      )}
                    >
                      <div className="px-6 pb-4">
                        <p className="font-['Inter',sans-serif] text-[14px] leading-relaxed text-slate-500">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-[#7b68ee]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Need more help?</h3>
                <p className="text-sm text-muted-foreground">
                  We're here for you.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {supportOptions.map((option) => {
                const isExternal = option.href.startsWith("http") || option.href.startsWith("mailto:");
                const isHashRoute = option.href.startsWith("/");
                const content = (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors no-underline">
                    <div className="w-9 h-9 rounded-lg bg-[#f5f3ff] flex items-center justify-center shrink-0">
                      <option.icon className="w-4 h-4 text-[#7b68ee]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {option.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {option.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs font-semibold text-[#7b68ee] shrink-0"
                    >
                      {option.action}
                      {isExternal && <ExternalLink className="w-3 h-3 ml-1" />}
                    </Button>
                  </div>
                );
                if (isHashRoute) {
                  return <Link key={option.title} to={option.href} className="no-underline block">{content}</Link>;
                }
                return <a key={option.title} href={option.href} className="no-underline block" target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>{content}</a>;
              })}
            </div>
          </div>

          <div className="bg-linear-to-br from-[#f5f3ff] to-[#ede9fe] border border-[#e0d6ff] rounded-xl p-6">
            <h3 className="font-['Spline_Sans',sans-serif] text-[18px] font-semibold text-slate-900 mb-2">
              Join our community
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Connect with other power users, share tips, and get early access
              to new features.
            </p>
            <Button className="bg-[#7b68ee] hover:opacity-90 text-white w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Join Discord
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
