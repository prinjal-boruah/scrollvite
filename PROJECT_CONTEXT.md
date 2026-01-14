# ScrollVite - Digital Wedding Invitation Platform

## Project Overview
ScrollVite is a SaaS platform where users can purchase, customize, and share digital wedding invitations. It's a full-stack application with Django backend and Next.js frontend.

## Tech Stack
- **Backend**: Django 6.0.1 + Django REST Framework + JWT Auth + Razorpay (Indian payment gateway)
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Auth**: Google OAuth + JWT tokens
- **Database**: SQLite (dev) → PostgreSQL (production)
- **Storage**: Local filesystem (dev) → AWS S3/Cloudflare R2 (production)
- **Image Processing**: Pillow (auto-resize to 1200px, JPEG compression)

## Core Architecture

### User Roles
1. **SUPER_ADMIN**: Create/edit template blueprints, set pricing, publish/unpublish
2. **BUYER**: Browse templates, purchase, customize their own invites, share public links

### Data Model Flow
```
Category (e.g., "Wedding", "Birthday")
  ↓
Template (Blueprint with JSON schema, price, template_component name)
  ↓
Order (User purchases template) + Payment (Razorpay integration)
  ↓
InviteInstance (User's customizable copy of template schema)
  ↓
Public URL (/invite/[slug]) - shareable invitation link
```

### Key Concepts
- **Template**: Admin-created blueprint with JSON schema defining editable fields (e.g., bride_name, groom_name, wedding_date, couple_photo)
- **Schema**: JSON structure that defines the data for a template (hero, venue, events, etc.)
- **InviteInstance**: User-owned copy of a template that they can customize
- **TemplateRenderer**: Frontend component that routes to specific template designs (currently only RoyalWeddingTemplate)
- **template_component**: Field in Template model that specifies which React component to use (e.g., "RoyalWeddingTemplate")

## Project Structure
```
scrollvite/
├── backend/scrollvite/
│   ├── scrollvite/ (main Django config)
│   ├── users/ (Custom User model with email auth)
│   ├── templates_app/ (Category, Template models & views)
│   ├── orders/ (Order, InviteInstance, Payment models & views)
│   ├── payments/ (Empty app, functionality in orders)
│   └── media/ (User-uploaded images, gitignored)
├── frontend/
│   ├── app/
│   │   ├── login/ (Google OAuth)
│   │   ├── (protected)/
│   │   │   ├── categories/ (Browse template categories)
│   │   │   ├── templates/[categorySlug]/ (Template list)
│   │   │   ├── templates/[categorySlug]/[templateId]/ (Template preview + Buy button)
│   │   │   ├── my-templates/ (User's purchased templates)
│   │   │   ├── editor/[inviteId]/ (Edit invite instance)
│   │   │   └── admin/templates/[templateId]/ (Admin template editor)
│   │   └── invite/[publicSlug]/ (Public invite view, no auth)
│   ├── components/
│   │   ├── TemplateRenderer.tsx (Routes to specific template component)
│   │   └── templates/
│   │       └── RoyalWeddingTemplate.tsx (Gold/royal wedding design)
│   └── lib/
│       ├── api.ts (Centralized API functions, uses NEXT_PUBLIC_API_URL)
│       ├── payment.ts (Razorpay integration)
│       └── logout.ts
```

## Current Implementation Status

### ✅ Completed Features
1. **Authentication**: Google OAuth login, JWT tokens, role-based access
2. **Template System**: 
   - Admin can create templates with JSON schema
   - Templates stored with `template_component` field
   - Single source of truth: RoyalWeddingTemplate component renders in preview, editor, and public view (DRY)
3. **Payment Flow**: Razorpay integration (create order → payment → verify signature → create invite)
4. **Template Browsing**: Categories → Template List → Template Preview (with Buy button)
5. **Smart Buy Button**: Shows "Buy" or "Edit Your Invite" if already owned
6. **Editor**: Split-screen (left: form fields, right: live preview using TemplateRenderer)
7. **My Templates Page**: Shows purchased templates with edit/view buttons
8. **Image Upload System**: 
   - Users can upload couple photos in editor
   - Auto-resize to 1200px width, JPEG compression (85% quality)
   - Preview thumbnail with remove option
   - Images stored in `media/invites/{invite_id}/`
9. **Public Invites**: Shareable URLs, no auth required, expiry handling
10. **Invite Expiry**: Auto-expires 30 days after wedding date (or 90 days default)
11. **No Hardcoded URLs**: All API calls use environment variable `NEXT_PUBLIC_API_URL`
12. **Controlled Inputs**: All form inputs use `|| ""` to prevent React errors

### 🚧 Known Issues & Tech Debt
1. **CRITICAL SECURITY**: 
   - `SECRET_KEY` exposed in settings.py (needs environment variable)
   - `DEBUG=True` in production
   - `CORS_ALLOW_ALL_ORIGINS=True` (should restrict to frontend domain)
2. **Missing Backend Features**:
   - No database indexes on foreign keys
   - Email notifications configured but not fully tested
   - No file cleanup for expired invites
3. **Frontend Issues**:
   - Using `any` type extensively (needs proper TypeScript interfaces)
   - Alert() for notifications (should use toast/snackbar)
   - No error boundaries
   - Mobile editor needs improvement (has warning banner)
4. **Missing Features**:
   - Admin can't upload default template images yet (UI exists in code but not deployed)
   - No template search/filter
   - No image cropping tool
   - Only one template design (RoyalWeddingTemplate)
   - No payment refund handling

### 📋 Ready for Deployment
- **Domain**: scrollvite.com (already owned)
- **Planned Stack**: Railway (backend) + Vercel (frontend)
- **Needs Before Deploy**:
  - Environment variables setup
  - Switch to PostgreSQL
  - Configure S3 for media files
  - Set DEBUG=False, proper ALLOWED_HOSTS, CORS settings
  - Generate new SECRET_KEY

## Important Code Patterns

### Adding a New Template Design
1. Create `frontend/components/templates/NewTemplateName.tsx`
2. Add to TemplateRenderer.tsx switch case
3. In admin, create Template with `template_component='NewTemplateName'`
4. Define schema structure in JSON
5. Done! No other code changes needed (DRY architecture)

### Schema Structure Example
```json
{
  "hero": {
    "bride_name": "Sarah",
    "groom_name": "John",
    "couple_photo": "http://example.com/media/invites/id/photo.jpg",
    "tagline": "Two hearts, one soul",
    "wedding_date": "2026-06-15"
  },
  "venue": {
    "name": "Grand Palace",
    "city": "Jaipur"
  },
  "events": [
    {
      "name": "Mehendi",
      "date": "2026-06-13",
      "time": "4:00 PM",
      "venue": "Grand Palace"
    }
  ]
}
```

### API Endpoints
- `POST /api/auth/google/` - Login with Google
- `GET /api/categories/` - List categories
- `GET /api/templates/{category_slug}/` - Templates by category
- `GET /api/template-editor/{template_id}/` - Get template with schema
- `POST /api/create-payment-order/{template_id}/` - Create Razorpay order
- `POST /api/verify-payment/` - Verify payment and create invite
- `GET /api/my-templates/` - User's purchased templates
- `GET /api/invites/{invite_id}/` - Get invite instance (auth required)
- `PUT /api/invites/{invite_id}/` - Update invite schema (auth required)
- `POST /api/invites/{invite_id}/upload-image/` - Upload image for invite
- `GET /api/invite/{public_slug}/` - Public invite view (no auth)

## Environment Variables

### Backend (.env)
```
SECRET_KEY=<generate-random-key>
DEBUG=False
ALLOWED_HOSTS=api.scrollvite.com
CORS_ALLOWED_ORIGINS=https://scrollvite.com
RAZORPAY_KEY_ID=<your-key>
RAZORPAY_KEY_SECRET=<your-secret>
EMAIL_HOST_USER=<gmail>
EMAIL_HOST_PASSWORD=<app-password>
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000  # dev
NEXT_PUBLIC_API_URL=https://api.scrollvite.com  # production
```

## Recent Changes (Latest Session)
- Fixed DRY violation: Admin template editor now uses TemplateRenderer instead of hardcoded HTML
- Removed all hardcoded localhost URLs, using environment variables
- Fixed controlled input bug (added `|| ""` to all form fields)
- Implemented complete image upload system with Pillow
- Fixed route parameter bug: `params.inviteid` (lowercase) vs `params.inviteId`
- Added image upload UI in editor with preview and remove functionality
- Updated RoyalWeddingTemplate to display uploaded couple photos
- Created comprehensive .gitignore to exclude media files

## Next Steps (Priority Order)
1. **Deploy to Production** (Railway + Vercel + S3)
2. **Security Fixes** (environment variables, CORS, SECRET_KEY)
3. **Create More Templates** (Beach, Minimalist, Floral designs)
4. **UI/UX Polish** (toast notifications, better errors, mobile editor)
5. **Admin Features** (template image upload UI, analytics dashboard)
6. **Additional Features** (search, image cropping, more image fields)
