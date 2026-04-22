export const OnboardingData = {
  welcome: {
    hero: {
      badge: "Kinetic Flow Engine 2.0",
      title: "Zero distractions. Pure flow.",
      description: "Designed for power users who demand precision. Eliminate noise, automate focus states, and reclaim 2 hours of deep work every day.",
      primaryButton: "Next",
      secondaryButton: "View Demo",
    },
    stats: [
      { value: "2.4h", label: "Avg Daily Gain" },
      { value: "98%", label: "Focus Retention" },
      { value: "0", label: "Ad Distractions" },
      { value: "150+", label: "Integrations" },
    ],
  },
  deepWork: {
    badge: "Deep Work Mastery",
    title: "Master your focus.",
    description: "Eliminate distractions and enter the flow state with precision-engineered tools designed for deep concentration.",
    features: [
      { title: "Pomodoro integration", description: "Customizable focus intervals and intelligent break reminders to keep your cognitive load balanced.", icon: "timer" },
      { title: "Capture every thought", description: "A dedicated distraction log to offload intrusive ideas instantly, keeping your current session uninterrupted.", icon: "edit_note" }
    ],
    primaryButton: "Next"
  },
  powerTools: {
    badge: "Efficiency First",
    title: "Built for speed.",
    description: "Navigate your entire workspace without ever touching your mouse. Focus utilizes keyboard-first patterns to keep you in flow state, visualizing connections across your project's knowledge graph.",
    features: [
      { title: "Universal Command Palette", description: "Press ⌘K to trigger actions, search files, or switch contexts instantly.", icon: "keyboard_command_key" },
      { title: "Knowledge Graph", description: "See how tasks, documents, and people are connected in a live visual web.", icon: "hub" }
    ],
    primaryButton: "Next"
  },
  finalSetup: {
    badge: "Final Step",
    title: "Let's set the stage.",
    description: "Your environment dictates your output. Define your first workspace to start the journey of deep focus.",
    workspaceLabel: "Workspace Name",
    goalLabel: "Primary Focus Goal",
    goals: [
        { label: "Coding", icon: "code", value: "coding" },
        { label: "Writing", icon: "edit_note", value: "writing" },
        { label: "Design", icon: "brush", value: "design" }
    ],
    aiToggle: { label: "Enable Focus AI", subLabel: "Automatically optimizes notifications based on your activity." },
    primaryButton: "Launch Workspace"
  }
};
