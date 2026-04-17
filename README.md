# 🎯 Focus

A sleek, modern web application designed for high-performing teams who value speed, clarity, and zero distractions. Built with a vibrant aesthetic, smooth micro-interactions, and a component-driven architecture.

![Hero Preview](https://github.com/Ahmed5Emad/Focus/assets/hero-placeholder)

## ✨ Features

- **Dynamic Routing:** Multi-page architecture including `Home`, `Features`, `Pricing`, `About`, and Authentication pages built on `react-router-dom`.
- **Responsive Layout:** A flawlessly responsive navigation header with a modern sliding Mobile Hamburger Menu utilizing `shadcn/ui` primitives.
- **Interactive UI Elements:** 
  - **Pricing:** Dynamic Monthly/Yearly toggle with animated "magic pill" background states and robust, semantic HTML `<details>` accordion FAQs.
  - **Featured:** "Power User" tools visualized beautifully with custom SVG animations and a functional copy-to-clipboard code snippet.
  - **About:** A clean, prose-heavy layout featuring scalable, data-driven grid components for principles and team members.
- **Brand Consistency:** Custom Tailwind variables injecting `cu-purple`, `cu-pink`, `cu-orange`, `cu-green`, and `cu-blue` across gradients, borders, and hover states.

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vite.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Primitives:** [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Package Manager:** [Bun](https://bun.sh/)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Bun](https://bun.sh/docs/installation) installed on your machine.

### Installation & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ahmed5Emad/Focus.git
   cd Focus
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Run the development server:**
   ```bash
   bun dev
   ```

4. **Build for production:**
   ```bash
   bun run build
   ```

## 📁 Project Structure

- `src/Pages`: Core application routes (`Home`, `About`, `Featured`, `Pricing`, `LogIn`, `SignUp`).
- `src/components`: Reusable UI elements, including Shadcn UI primitives (`Button`, `Sheet`, `Input`, etc.) and the global `Header`.
- `src/sections`: Specialized page blocks (e.g., `HeroSection`, `FeaturesSection`, `Footer`).
- `src/lib`: Core utilities (like Tailwind `cn` merger).

## 🌍 Live Demo
The application is automatically deployed to GitHub Pages and can be viewed live here:
**[https://Ahmed5Emad.github.io/Focus/](https://Ahmed5Emad.github.io/Focus/)**

---
*© Focus Technology Group. Built for the power user.*
