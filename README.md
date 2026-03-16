# Caza — Interactive Furniture Room Planner

> **Sri Lanka's #1 Furniture Designer** — A web-based 2D & 3D room planning tool built for in-store furniture designers and their customers.

Caza lets furniture store staff sketch real room layouts, drop in catalogue furniture pieces, style colors, and present a polished 3D walkthrough — all in real time, without slowing down the customer conversation.

---

## ✨ Features

| Feature | Description |
|---|---|
| **2D Room Canvas** | Draw real room shapes with accurate dimensions, corners, and wall lengths using an interactive Konva canvas |
| **Furniture Catalogue** | Drag and drop sofas, chairs, tables, and beds directly onto the floor plan |
| **Live Color Styling** | Swap wall tones, flooring, and upholstery colors in real time |
| **3D Preview** | Jump from a 2D plan view into an immersive 3D room walkthrough powered by React Three Fiber |
| **Save Designs** | Store multiple design drafts per customer session and compare layouts side by side |
| **Authentication** | Secure sign-up / login backed by Supabase Auth |
| **Dashboard** | Manage saved designs and customer sessions from a dedicated dashboard |
| **Responsive Navbar** | Adaptive floating navbar with mobile drawer, scroll-aware styling, and user avatar dropdown |
| **Animated UI** | Smooth Framer Motion entrance animations throughout the landing page and planner |

---

## 🛠️ Tech Stack

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.1.6 | App framework (App Router) |
| [React](https://react.dev/) | 19.2.3 | UI rendering |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Type safety across the codebase |

### Styling
| Technology | Version | Purpose |
|---|---|---|
| [Tailwind CSS](https://tailwindcss.com/) | ^4 | Utility-first styling |
| [tw-animate-css](https://github.com/joe-bell/tw-animate) | ^1.4.0 | Tailwind animation utilities |
| [class-variance-authority](https://cva.style/) | ^0.7.1 | Component variant management |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | latest | Conditional class merging |

### UI Components
| Technology | Version | Purpose |
|---|---|---|
| [shadcn/ui](https://ui.shadcn.com/) | ^4.0.2 | Accessible, composable component library |
| [Base UI React](https://base-ui.com/) | ^1.2.0 | Headless UI primitives |
| [Lucide React](https://lucide.dev/) | ^0.577.0 | Icon set |

### 3D Rendering
| Technology | Version | Purpose |
|---|---|---|
| [Three.js](https://threejs.org/) | ^0.183.2 | WebGL 3D engine |
| [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) | ^9.5.0 | React renderer for Three.js |
| [@react-three/drei](https://github.com/pmndrs/drei) | ^10.7.7 | Helpers and abstractions for R3F |
| [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) | ^3.0.4 | Post-processing effects for 3D scenes |
| [postprocessing](https://github.com/vanruesc/postprocessing) | ^6.38.3 | Underlying post-processing library |

### 2D Canvas
| Technology | Version | Purpose |
|---|---|---|
| [Konva](https://konvajs.org/) | ^10.2.0 | 2D HTML5 canvas rendering |
| [react-konva](https://konvajs.org/docs/react/) | ^19.2.3 | React bindings for Konva |

### State Management
| Technology | Version | Purpose |
|---|---|---|
| [Zustand](https://zustand-demo.pmnd.rs/) | ^5.0.11 | Lightweight global state (auth, design, portfolio stores) |

### Backend & Auth
| Technology | Version | Purpose |
|---|---|---|
| [Supabase](https://supabase.com/) | ^2.99.0 | Postgres database, auth, and realtime |
| [@supabase/auth-helpers-nextjs](https://github.com/supabase/auth-helpers) | ^0.15.0 | Supabase auth integration for Next.js |

### Animation
| Technology | Version | Purpose |
|---|---|---|
| [Framer Motion](https://www.framer.com/motion/) | ^12.35.1 | Declarative animations and transitions |

---

## 📁 Project Structure

```
hci/
├── app/
│   ├── page.tsx              # Landing / Home page
│   ├── layout.tsx            # Root layout with providers
│   ├── globals.css           # Global styles & cartoon design tokens
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   ├── dashboard/            # Saved designs dashboard
│   ├── planner/              # Main room planner page
│   └── designs/              # Design gallery / viewer
│
├── components/
│   ├── navbar.tsx            # Floating adaptive navigation bar
│   ├── footer.tsx            # Global footer
│   ├── providers.tsx         # App-level context providers
│   ├── conditional-layout.tsx
│   ├── planner/
│   │   ├── room-canvas.tsx         # 2D Konva room canvas
│   │   ├── furniture-panel.tsx     # Furniture catalogue sidebar
│   │   ├── properties-panel.tsx    # Properties / style panel
│   │   ├── toolbar.tsx             # Planner toolbar actions
│   │   ├── room-viewer-3d.tsx      # Full 3D room viewer
│   │   └── furniture-preview-3d.tsx # 3D furniture preview widget
│   └── ui/                   # shadcn/ui component library
│
├── lib/
│   ├── data/
│   │   └── furniture.ts      # Furniture catalogue definitions
│   ├── stores/
│   │   ├── auth-store.ts     # Zustand auth store (login / session)
│   │   ├── design-store.ts   # Zustand design store (room state)
│   │   └── portfolio-store.ts # Zustand portfolio / saved designs store
│   ├── supabase/             # Supabase client configuration
│   └── utils.ts              # Shared utility helpers
│
├── public/                   # Static assets
├── next.config.ts
├── tailwind.config (via postcss.config.mjs)
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- A [Supabase](https://supabase.com) project (for auth & database)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/hci.git
cd hci

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Fill in your Supabase URL and anon key (see Environment Variables below)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## 🎨 Design System

Caza uses a custom **"cartoon"** design language:
- Warm cream base (`#fff7e8`) with pastel accent blobs
- Bold card outlines (`cartoon-frame`) for a playful editorial feel
- Circular / rounded UI elements (`cartoon-button`, `cartoon-frame`)
- Custom display font (`font-display-cartoon`) for headings
- Consistent pastel palette: peach (`#ffede2`), sky (`#e8f7ff`), mint (`#edf9d8`), yellow (`#fff3bf`)

---

## 🗺️ Roadmap

- [ ] Export designs as PDF / image
- [ ] Multi-room support
- [ ] Customer-facing shareable design links
- [ ] Real-time collaborative editing
- [ ] Expanded furniture catalogue
