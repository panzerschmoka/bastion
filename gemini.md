# MotionAI Project State

## 🟢 Status
Cinematic Quality Upgrade Phase — AI Model + System Prompt + Canvas Enhanced

## 🔑 Credentials
- **Database:** SQLite (via Prisma, `prisma/dev.db`)
- **Auth:** NextAuth.js v4 (secret in `.env` → `NEXTAUTH_SECRET`)
- **AI:** Anthropic Claude Sonnet 4 (key in `.env` → `ANTHROPIC_API_KEY`)
- **Storage:** Local filesystem (`public/uploads/`)

## 📦 Dependencies
- Next.js 14.2.15
- React 18.3.1
- Remotion 4.0.232
- Prisma 5.20.0
- NextAuth 4.24.8
- Zustand 4.5.5
- Tailwind CSS 3.4.13
- TypeScript 5.6.3

## 🏗️ Architecture
- **Pattern:** Feature-Based (src/features/)
- **Router:** Next.js App Router
- **Styling:** Tailwind CSS + Shadcn/ui (dark theme)
- **State:** Zustand (editorStore, layerStore, timelineStore, keyframeStore, compositionStore, effectStore, selectionStore, historyStore, toolStore)
- **DB:** Prisma + SQLite
- **Video:** Remotion (programmatic video) — not yet integrated as player
- **AI:** Anthropic Claude Sonnet 4 → JSON keyframe generation
- **Vibe-Coding Rule:** НЕ запускать `npm run dev` для проверки кода. Всегда использовать `npm run build` для выявления ошибок компиляции и типов.
- **Workflow:** Перед коммитом обязательно запускать `npm run lint` и `typecheck`.

## 📋 Code Conventions
- **Компоненты:** PascalCase (`Button.tsx`)
- **Утилиты/Хуки:** camelCase (`useAuth.ts`)
- **Импорты:** Абсолютные `@/components/...`
- **TypeScript:** strict mode, NO `any`
- **API:** try-catch + zod validation
- **Ошибки пользователю:** только на русском
- **Структура:** Модульная архитектура (src/features/). Каждая фича содержит свои компоненты, логику и хуки.

## 📋 Completed
- [x] Infrastructure (Phase 0-3): .gitignore, .env, package.json, tsconfig, tailwind
- [x] Database: Prisma schema + SQLite
- [x] Types: keyframe, layer, effect, project, composition
- [x] Lib: interpolation, anthropic, auth, prisma, validations, utils, errors, constants, animationPresets, file, remotion, api-response
- [x] Stores: 10 stores (keyframe, layer, composition, effect, selection, timeline, history, tool, editor, effects)
- [x] Hooks: 9 hooks (usePlayback, useKeyboardShortcuts, useAuth, useEditor, useActiveComposition, useProject, useStore, useUpload, use-toast)
- [x] UI Components: 20+ shadcn components
- [x] Shared Components: Navbar, Sidebar, ThemeProvider, UserMenu, LoadingSpinner, SessionProvider, ThemeToggle
- [x] Feature Components: AI (PromptInput, GenerationStatus), Editor (Canvas, Timeline, PropertiesPanel, EditorShell, EditorHeader, Toolbar, CompositionSettingsDialog, ExportDialog, VideoPlayer)
- [x] API Routes: auth, generate, projects, render, upload
- [x] Pages: login, register, dashboard, editor/[id]
- [x] Middleware
- [x] Keyframe Easing Editor with visual curve preview
- [x] **Cinematic AI Upgrade**: Claude Haiku → Sonnet 4, completely rewritten system prompt with motion design principles
- [x] **Canvas Enhancements**: CSS blend modes, 3D perspective, improved text/shape renderers with glow support

## 🚧 Next Steps
- [ ] Remotion Player Integration (replace CSS canvas with @remotion/player for real video export)
- [ ] 3D Transform support (translateZ, rotateX/Y for true 3D effects)
- [ ] Multiple AI generation variants (generate 3 options, user picks best)
- [ ] Template library (pre-made cinematic animations)
- [ ] AI iteration (refine prompt → update composition)
- [ ] Curve editor for bezier keyframes
- [ ] Audio layer support
- [ ] Export pipeline (MP4/WebM via Remotion renderer)

## ⚠️ Known Issues
- Терминал заблокирован workspace валидацией — npm install нужно выполнять вручную
- Gemini.md в корне Documents конфликтует с workspace — проект создан в `motionai/`
- AI модель теперь Sonnet 4 — стоит дороже но значительно лучше результат

## 🎯 Product Vision
- Referent: https://hera.video/ — AI Motion Designer
- Quality level: After Effects-grade cinematic animations
- Target: полноценный продукт, не MVP
- Timeline: 1 месяц
- 3D эффекты, perspective, parallax — обязательны
