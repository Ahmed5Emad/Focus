# Focus Design System

A comprehensive documentation of the UI components, tokens, and design patterns used in the Focus application. Built with **React**, **Tailwind CSS 4**, and **Radix UI**.

## 🎨 Color Palette

The system uses theme-aware OKLCH colors for better perceptual uniformity and accessibility.

### Core Colors
| Name | Variable | Description |
| :--- | :--- | :--- |
| **Primary** | `--primary` | Main brand color (Purple-ish). Used for primary actions. |
| **Secondary** | `--secondary` | Subtle background for secondary actions. |
| **Accent** | `--accent` | Highlight color for interactive elements. |
| **Muted** | `--muted` | De-emphasized text and backgrounds. |
| **Destructive** | `--destructive` | Error states and dangerous actions (Red). |
| **Background** | `--background` | Main application background. |
| **Foreground** | `--foreground` | Default text color. |

### Custom Palette
Specialized colors available via `@theme`:
- `cu-purple`: `#7b68ee`
- `cu-pink`: `#ff5cba`
- `cu-green`: `#00a843`
- `cu-blue`: `#00bdf9`
- `cu-orange`: `#ff8d36`
- `cu-red`: `#e65054`

---

## typography Typography

Standardized hierarchy using the **Inter** font family.

- **H1**: `text-4xl lg:text-5xl font-extrabold tracking-tight`
- **H2**: `text-3xl font-semibold tracking-tight`
- **H3**: `text-2xl font-semibold tracking-tight`
- **Body**: `leading-7 [&:not(:first-child)]:mt-6`
- **Muted**: `text-sm text-muted-foreground`

---

## 🧱 Components

All components are located in `src/components/ui/` and can be imported using the `@/components/ui` alias.

### Button
Interactive element for actions.
- **Variants**: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`
- **Sizes**: `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="lg">Get Started</Button>
<Button variant="outline" size="icon"><Plus /></Button>
```

### Badge
Small status indicators.
- **Variants**: `default`, `secondary`, `outline`, `destructive`, `success`, `warning`, `info`

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="success">Active</Badge>
```

### Card
Container for grouped content.
- **Sub-components**: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content goes here.</CardContent>
</Card>
```

### Avatar
User profile representations.
- **Sub-components**: `AvatarImage`, `AvatarFallback`

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="url" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Dialog (Modal)
Overlay for focused user interaction.

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader><DialogTitle>Are you sure?</DialogTitle></DialogHeader>
  </DialogContent>
</Dialog>
```

### Tabs
Organize content into switchable panels.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
</Tabs>
```

---

## 🛠️ Utilities

### `cn(...inputs)`
A utility function in `src/lib/utils.ts` that combines `clsx` and `tailwind-merge` to safely handle conditional Tailwind classes.

```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", isActive && "active-class", customClass)}>
```

---

## 🚀 Development

### Adding Components
1. Create the component file in `src/components/ui/`.
2. Follow the existing pattern of using `cva` for variants and `React.forwardRef` for consistency.
3. Update the Design System page (`src/Pages/DesignSystem/DesignSystem.tsx`) to showcase the new component.

### Running the Design System Page
The design system showcase is available at the `/design-system` route when running the development server.
