# MotionAI Project State

## 🟢 Status
Phase 3 Complete — Moving to Lib/Utils (Phase 4)

## 🔑 Credentials
- **Database:** PostgreSQL (connection string in `.env` → `DATABASE_URL`)
- **Auth:** NextAuth.js v4 (secret in `.env` → `NEXTAUTH_SECRET`)
- **AI:** Anthropic Claude API (key in `.env` → `ANTHROPIC_API_KEY`)
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
- **State:** Zustand (editorStore)
- **DB:** Prisma + PostgreSQL
- **Video:** Remotion (programmatic video)
- **AI:** Anthropic Claude API для генерации Remotion-кода

## 📋 Code Conventions
- **Компоненты:** PascalCase (`Button.tsx`)
- **Утилиты/Хуки:** camelCase (`useAuth.ts`)
- **Импорты:** Абсолютные `@/components/...`
- **TypeScript:** strict mode, NO `any`
- **API:** try-catch + zod validation
- **Ошибки пользователю:** только на русском

## 📋 Task List
- [x] .gitignore, .env, .env.example
- [x] package.json (точные версии)
- [x] tsconfig.json, next.config.js
- [x] tailwind.config.ts, postcss.config.js
- [x] public/uploads/ с .gitkeep
- [x] prisma/schema.prisma
- [x] prisma/seed.ts
- [x] src/types/* (5 файлов)
- [ ] src/lib/* (10 файлов)
- [ ] src/remotion/* (10 файлов)
- [ ] src/stores + hooks (5 файлов)
- [ ] src/components/ui/* (20 файлов)
- [ ] src/components/shared + providers (6 файлов)
- [ ] src/components/feature/* (20 файлов)
- [ ] src/middleware.ts
- [ ] src/app/api/* (10 route файлов)
- [ ] src/app/pages/* (16 файлов)

## ⚠️ Known Issues
- Терминал заблокирован workspace валидацией — npm install нужно выполнять вручную
- Gemini.md в корне Documents конфликтует с workspace — проект создан в `motionai/`

## 🔄 Context for Next Agent
Phase 0-3 завершены (Infrastructure + Config + Database + Types). Следующий шаг — src/lib/* (Phase 4: Lib/Utils).
