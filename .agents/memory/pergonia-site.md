---
name: Pergonia commercial site
description: Architecture and key decisions for the Pergonia pool/social areas commercial website added to the Dovalina Express/React app.
---

## What was built
A new commercial website for "Pergonia — Arquitectura Exterior" (pool/social areas design company in Torreón) layered on top of the existing Dovalina Pro Painters app.

## New DB tables (added to shared/schema.ts)
- `gallery_items` — gallery photos displayed on the public site (category, displayOrder, isVisible)
- `page_content` — CMS key/value store for editable site text (key, value, section, label)

**Why:** The existing app already had a `leads` table for contact form submissions; no new table was needed for that. `settings` existed but its structure didn't fit CMS-style page content.

## New routes
- `GET/POST/PUT/DELETE /api/gallery` — public GET, auth required for write
- `GET /api/page-content` — public
- `PUT/POST /api/page-content/:key` — upsert (create or update) by key, auth required
- `POST /api/contact` — public, creates a lead record
- `GET/PUT/DELETE /api/users` — admin-only user management

## New pages (client/src/pages/)
- `landing-page.tsx` — Full Pergonia commercial site (Spanish, Torreón focused, SEO structured data)
- `admin-gallery.tsx` — Gallery CRUD admin page
- `admin-content.tsx` — Page content editor (edits key/value CMS content)
- `admin-users.tsx` — User management page

## Routes in App.tsx
- `/dashboard/gallery` → AdminGallery
- `/dashboard/content` → AdminContent
- `/dashboard/users` → AdminUsers

## Color scheme (index.css)
Primary: hsl(82, 28%, 32%) — olive/sage green (Pergonia brand)
Secondary: hsl(38, 42%, 54%) — tan/gold
Background: hsl(42, 30%, 96%) — cream/off-white

## SEO
Landing page includes JSON-LD structured data (LocalBusiness schema) in a script tag and sets document.title + meta description on mount.

## How to apply
When making changes to the landing page or admin pages, remember:
- Gallery items with `isVisible: false` are hidden from public gallery
- `page_content` keys are unique; upsert by key via PUT /api/page-content/:key
- Default gallery images use Unsplash URLs as fallback when no DB items exist
- The sidebar is grouped by section (Principal, Sitio Web, Clientes y Proyectos, Finanzas, Administración)
