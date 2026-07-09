# 세션 요약 — PPT Studio DB 템플릿 + AI 추천 시스템 구축

## Goal
Build a DB-driven PPT Studio where admins upload .pptx templates and AI automatically recommends + generates beautifully styled slides.

## Constraints & Preferences
- Templates stored in Supabase DB, manageable by admin via CRUD UI
- Admin uploads .pptx → color/font auto-extracted via JSZip → stored as template
- AI auto-recommends the best template based on sermon content
- AI generation respects template-specific guides and auto-applies styles to generated slides
- Church-school variant gets identical features as main project
- All changes must compile in both `npm run build` builds
- GET endpoint open to all users (not just admin) so non-admin PptStudio can fetch templates
- Template delete should be hard delete (not soft) — user explicitly requested
- Preview must reflect selected template colors/fonts in all 10 layouts immediately

## Progress
### Done
- Created `ppt_templates` Supabase table + 7 seed templates with AI guides
- Created `@/lib/pptxParser.ts`: extracts primary/accent/background/text colors + title/body fonts from `.pptx` theme.xml via JSZip
- Created `@/lib/templateRegistry.ts` in both projects: client-side fetch, localStorage cache (5min TTL), static fallback, `applyTemplate(slide, template)` helper, `invalidateCache()` function
- Created `/api/admin/templates` API (GET list, POST create with .pptx upload → auto-extract → save) in both projects
- Created `/api/admin/templates/[id]` API (PUT update, DELETE hard) in both projects
- Created `/admin/templates` CRUD page in both projects (.pptx upload with color/font extraction preview, AI guide editor, color/font inputs, template list with swatches)
- Modified both `/api/ppt/generate` to accept `templateId`, look up template from DB, pass to `generatePptSlidesGpt()`
- Modified both `openai.ts`: `generatePptSlidesGpt()` accepts `template` object (name, primary/accent colors, fonts, ai_guide), injects into GPT system prompt; added `recommendTemplate()` function
- Modified `handleGenerate()` in both PptStudio.tsx: auto-calls `recommendTemplate()` when no template pre-selected, sends `templateId` in request, auto-applies `applyTemplate()` to generated slides
- Fixed PptSlidePreview in both projects: all 10 layouts + default use `titleCss`/`bodyCss`/`primary`/`accent`/`bg` template variables instead of hardcoded colors
- Fixed `#` prefix bug: `primary = c?.primary ? `#${c.primary}` : '#1B3A5C'` so DB colors (no `#`) become valid CSS
- Changed selectedTemplateId default from `'modern'` to `''` (empty → auto-recommend triggers)
- Moved `templates`/`selectedTemplateId` state declarations before `handleGenerate` to fix ReferenceError (TDZ)
- Changed DELETE endpoint from soft (`update({ is_active: false })`) to hard (`.delete()`) in both projects
- Cache invalidation: admin CRUD (save/delete) calls `invalidateCache()` → `localStorage.removeItem(CACHE_KEY)` → PptStudio always fetches fresh list
- Both projects build successfully (`npm run build` passes)

### In Progress
- (none)

### Blocked
- Supabase migration SQL must be manually run in dashboard (`supabase_migration_ppt_templates.sql`) — user was going to run it but may not have yet

## Key Decisions
- `.pptx` upload → extract theme approach chosen over manual color input (user preference)
- Templates stored in DB so admin can manage without code deploy
- Client caches in localStorage (5min) to reduce API calls; `invalidateCache()` called on CRUD for immediate refresh
- Static fallback templates ensure functionality even when DB/API is unavailable
- GET endpoint intentionally open to all authenticated users (templates are not sensitive)
- AI auto-recommend only triggers when no template pre-selected; manual selection takes priority
- Template styles auto-applied to generated slides immediately, so user sees styled result without extra click
- DELETE is hard delete (`.delete()`) per user request — soft delete rejected
- User declined template preview card enhancement request — current small color-dot buttons kept as-is
- Template preview in PptStudio sidebar intentionally not enhanced (user chose to leave it)

## Next Steps
1. Remind user to run SQL migration in Supabase dashboard SQL Editor (if not yet done)
2. Restart dev servers (`npm run dev`) to pick up new files
3. Verify: admin uploads .pptx → template appears in PptStudio → user clicks 생성 → AI recommends + generates + styles applied

## Critical Context
- Both projects share same Supabase instance (`otzdebgfztoattfuvxqy.supabase.co`)
- Both use `supabaseAdmin` from `@/lib/supabase`
- `PptSlidePreview` handles 10 layout types (title, bullets, section-header, quote, two-column, closing, vs-contrast, timeline-flow, central-focus, grid-matrix)
- Current state is commit `a2b1128` with all session's re-done changes uncommitted: 11 files modified (main + church PptStudio.tsx, openai.ts, API routes)
- Previous reset to `2838d55` then back to `a2b1128` lost uncommitted work — all fixes re-applied in this session
- Template colors stored without `#` prefix in DB; `#` is now added in PptSlidePreview to produce valid CSS

## Relevant Files
- `supabase_migration_ppt_templates.sql`: DDL + 7 seed templates
- `src/lib/pptxParser.ts`: .pptx → theme extraction (JSZip + regex)
- `src/lib/templateRegistry.ts` / `church-school/src/lib/templateRegistry.ts`: client loader, cache, fallback, `applyTemplate()`, `invalidateCache()`
- `src/app/api/admin/templates/route.ts` / `church-school/src/app/api/admin/templates/route.ts`: GET (open) + POST (admin only)
- `src/app/api/admin/templates/[id]/route.ts` / `church-school/src/app/api/admin/templates/[id]/route.ts`: PUT (admin) + DELETE (hard, admin)
- `src/app/admin/templates/page.tsx` / `church-school/src/app/admin/templates/page.tsx`: CRUD UI with .pptx upload + color/font preview
- `src/components/PptStudio.tsx` / `church-school/src/components/ppt/PptStudio.tsx`: dynamic template loading, auto-recommendation, auto-apply on generate, PptSlidePreview with full template variable support
- `src/lib/openai.ts` / `church-school/src/lib/workspace/openai.ts`: `generatePptSlidesGpt()` with template injection, `recommendTemplate()`
- `src/app/api/ppt/generate/route.ts` / `church-school/src/app/api/ppt/generate/route.ts`: accepts `templateId`, fetches DB template, passes to AI
