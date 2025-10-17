# Press Release Management System - Deployment Guide

## Overview

This application is a complete press release management system with:
- User authentication (OAuth)
- Entity (company/brand) management
- Press release creation with WYSIWYG editor
- RSS feed generation and submission
- Public RSS feed at `/feed`

## Custom Domain Setup: rankwire.ai

### Prerequisites
1. Access to your domain registrar (where rankwire.ai is registered)
2. Deployment platform account (recommended: Vercel, Netlify, or Railway)

### Deployment Steps

#### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy the application**:
   ```bash
   cd /home/ubuntu/press-release-app
   vercel
   ```

3. **Configure custom domain**:
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Domains
   - Add `rankwire.ai` and `www.rankwire.ai`
   - Vercel will provide DNS records

4. **Update DNS records** at your domain registrar:
   - Add A record: `@` → Vercel IP (provided by Vercel)
   - Add CNAME record: `www` → `cname.vercel-dns.com`

5. **Environment Variables** (set in Vercel dashboard):
   ```
   DATABASE_URL=<your-database-connection-string>
   JWT_SECRET=<random-secret-key>
   VITE_APP_ID=<oauth-app-id>
   OAUTH_SERVER_URL=<oauth-server-url>
   VITE_OAUTH_PORTAL_URL=<oauth-portal-url>
   OWNER_OPEN_ID=<owner-id>
   OWNER_NAME=<owner-name>
   VITE_APP_TITLE=RankWire Press Release Manager
   VITE_APP_LOGO=<logo-url>
   ```

#### Option 2: Deploy to Railway

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add custom domain**:
   - Go to Railway dashboard
   - Select your project
   - Go to Settings → Domains
   - Add `rankwire.ai`
   - Update DNS records as instructed

#### Option 3: Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

3. **Configure custom domain**:
   - Go to Netlify dashboard
   - Site settings → Domain management
   - Add custom domain `rankwire.ai`
   - Follow DNS configuration instructions

### Database Setup

The application uses MySQL/TiDB. You can use:

1. **Vercel Postgres** (if using Vercel)
2. **PlanetScale** (MySQL-compatible)
3. **Railway MySQL** (if using Railway)
4. **Any MySQL 8.0+ database**

**Database Migration**:
```bash
pnpm db:push
```

This will create all necessary tables.

### RSS Feed Configuration

The public RSS feed is available at:
- `https://rankwire.ai/feed`

This endpoint returns all published press releases in RSS 2.0 format.

To update the base URL in RSS feed generation, the code already uses `https://rankwire.ai` as configured in `server/routers.ts`.

### Post-Deployment Configuration

1. **Update OAuth Callback URL**:
   - Update your OAuth app settings to include:
   - `https://rankwire.ai/api/oauth/callback`

2. **Test the RSS Feed**:
   - Visit `https://rankwire.ai/feed`
   - Should return XML RSS feed

3. **XPR Media RSS Submission**:
   - When you receive the actual XPR Media RSS endpoint URL
   - Update the endpoint in the submission function
   - Currently configured as test endpoint in `server/rss.ts`

### Application Features

#### For Users:
1. **Login**: OAuth authentication (configured in environment)
2. **Entities**: Manage companies/brands
   - Company information
   - PR contacts
   - Social media links
3. **Press Releases**: Create and manage press releases
   - WYSIWYG editor with character/word count
   - Headline (max 70 chars)
   - Subheadline (max 120 chars)
   - Body content (400-600 words recommended)
   - Status: Draft → Published → Reporting
4. **RSS Feed**: 
   - Download individual press release RSS
   - Submit to XPR Media RSS endpoint
   - Public feed at `/feed`

#### Status Workflow:
- **Draft**: Editable, not published
- **Published**: Submitted to RSS, read-only
- **Reporting**: Analytics/tracking phase

### Monitoring and Maintenance

1. **Check application logs** in your deployment platform
2. **Monitor database** for performance
3. **RSS Feed**: Accessible at `https://rankwire.ai/feed`
4. **Update XPR Media endpoint** when available

### Security Notes

- All user data is isolated (users only see their own entities and press releases)
- Public RSS feed only shows published press releases
- Authentication required for all management functions
- Environment variables should never be committed to git

### Support

For issues or questions:
- Check deployment platform logs
- Verify environment variables are set correctly
- Ensure database is accessible
- Confirm DNS records are propagated (can take up to 48 hours)

### Next Steps After Deployment

1. **Test the complete workflow**:
   - Create an entity
   - Create a press release
   - Publish it
   - Check the RSS feed at `/feed`

2. **Configure XPR Media**:
   - Get the actual RSS submission endpoint
   - Update `server/rss.ts` with the real endpoint
   - Test submission

3. **Customize branding**:
   - Update `VITE_APP_TITLE` and `VITE_APP_LOGO` environment variables
   - Restart the application

## Technical Stack

- **Frontend**: React 19 + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL (via Drizzle ORM)
- **Editor**: Tiptap (WYSIWYG)
- **Authentication**: OAuth (Manus Auth)
- **Deployment**: Vercel/Railway/Netlify compatible

## File Structure

```
press-release-app/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   └── lib/         # Utilities and tRPC client
├── server/              # Backend Express + tRPC
│   ├── routers.ts       # API routes
│   ├── db.ts           # Database queries
│   └── rss.ts          # RSS generation
├── drizzle/            # Database schema and migrations
└── shared/             # Shared types and constants
```

