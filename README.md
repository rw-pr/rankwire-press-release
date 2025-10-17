# RankWire Press Release Management System

A comprehensive press release management application with entity management, WYSIWYG editor, and RSS feed generation capabilities.

## Features

### 🏢 Entity Management
- Create and manage companies/brands
- Store complete company information:
  - Company details (name, address, industry)
  - Website and Google Business Profile links
  - PR contact information
  - Social media URLs (Facebook, Twitter/X, Reddit)
- User-specific entities (each user manages their own)

### 📝 Press Release Creation
- Advanced WYSIWYG editor with rich text formatting
- Character count validation:
  - Headline: max 70 characters
  - Subheadline: max 120 characters
- Word count validation for body content (400-600 words recommended)
- Comprehensive fields following XPR Media guidelines:
  - Dateline (City, State, Date)
  - Lead paragraph (Who, What, When, Where, Why)
  - Body content with formatting
  - Boilerplate
  - Call to action
  - Media contact information
  - Author and metadata

### 📊 Status Management
- **Draft**: Work in progress, fully editable
- **Published**: Submitted to RSS feed, read-only
- **Reporting**: Analytics and tracking phase

### 📡 RSS Feed Generation
- Generate RSS 2.0 compliant feeds
- Individual press release RSS download
- Submit to XPR Media RSS endpoint
- **Public RSS feed** at `/feed` (https://rankwire.ai/feed)
- Includes all published press releases from all users

### 🔐 Authentication & Security
- OAuth-based user authentication
- User data isolation
- Protected API routes
- Secure session management

## Technology Stack

- **Frontend**: React 19, Tailwind CSS 4, Tiptap Editor
- **Backend**: Express 4, tRPC 11
- **Database**: MySQL (Drizzle ORM)
- **Authentication**: OAuth (Manus Auth)
- **Deployment**: Vercel/Railway/Netlify compatible

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)
- MySQL database

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd press-release-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables (create `.env` file):
   ```env
   DATABASE_URL=mysql://user:password@host:port/database
   JWT_SECRET=your-secret-key
   VITE_APP_ID=oauth-app-id
   OAUTH_SERVER_URL=oauth-server-url
   VITE_OAUTH_PORTAL_URL=oauth-portal-url
   OWNER_OPEN_ID=owner-id
   OWNER_NAME=owner-name
   VITE_APP_TITLE=RankWire Press Release Manager
   VITE_APP_LOGO=logo-url
   ```

4. Run database migrations:
   ```bash
   pnpm db:push
   ```

5. Start development server:
   ```bash
   pnpm dev
   ```

6. Open http://localhost:3000

## Usage

### Creating an Entity

1. Navigate to **Entities** in the sidebar
2. Click **Add Entity**
3. Fill in company information
4. Save the entity

### Creating a Press Release

1. Navigate to **Press Releases**
2. Click **New Press Release**
3. Select an entity (company/brand)
4. Fill in the press release details:
   - Headline (required, max 70 chars)
   - Subheadline (optional, max 120 chars)
   - Dateline information
   - Lead paragraph
   - Body content (use WYSIWYG editor)
   - Boilerplate
   - Contact information
   - Metadata
5. Save as **Draft** or **Publish** immediately

### Publishing a Press Release

1. Open a draft press release
2. Click **Publish**
3. The press release status changes to "Published"
4. It becomes available in the RSS feed

### Accessing the RSS Feed

- **Public feed**: https://rankwire.ai/feed
- **Individual press release**: Click "Download RSS" on published press releases
- **Submit to XPR Media**: Click "Submit to RSS" on published press releases

## XPR Media Guidelines Compliance

The application follows XPR Media/Gannett content guidelines:

### Structural Requirements ✅
- Headline: ≤70 characters, title case
- Subheadline: ≤120 characters, sentence case
- Dateline: CITY, State - Month Day, Year format
- Lead paragraph: 1-2 sentences covering 5 W's
- Body: Inverted pyramid, 2-4 sentences per paragraph
- Word count: 400-600 words
- Boilerplate: Brief company description

### SEO & Syndication ✅
- Keywords in headline, subhead, lead, body
- 3-5 embedded hyperlinks support
- Meta title and description fields
- Category/tag support via keywords

### Content Validation ✅
- Character count enforcement
- Word count tracking
- No advertorial language enforcement (user responsibility)
- Author attribution fields
- Media contact block

## API Routes

### Entities
- `GET /api/trpc/entities.list` - List user entities
- `POST /api/trpc/entities.create` - Create entity
- `GET /api/trpc/entities.get` - Get entity by ID
- `PUT /api/trpc/entities.update` - Update entity
- `DELETE /api/trpc/entities.delete` - Delete entity

### Press Releases
- `GET /api/trpc/pressReleases.list` - List user press releases
- `POST /api/trpc/pressReleases.create` - Create press release
- `GET /api/trpc/pressReleases.get` - Get press release by ID
- `PUT /api/trpc/pressReleases.update` - Update press release
- `DELETE /api/trpc/pressReleases.delete` - Delete press release
- `POST /api/trpc/pressReleases.publish` - Publish press release

### RSS Feed
- `GET /api/trpc/rss.publicFeed` - Public RSS feed (all published)
- `GET /api/trpc/rss.generate` - Generate user's RSS feed
- `POST /api/trpc/rss.submit` - Submit to XPR Media endpoint

## Database Schema

### Users
- Authentication and profile information

### Entities
- Company/brand information
- User-specific (foreign key to users)

### Press Releases
- Complete press release content
- Status tracking (draft/published/reporting)
- Foreign keys to users and entities

### Media Files
- Logo, images, videos (future enhancement)
- Foreign key to press releases

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

```bash
vercel
```

### Custom Domain Setup
1. Add `rankwire.ai` in your deployment platform
2. Update DNS records at your registrar
3. Configure environment variables
4. RSS feed will be available at `https://rankwire.ai/feed`

## Development

### Project Structure
```
press-release-app/
├── client/               # Frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   └── lib/         # Utilities
├── server/              # Backend
│   ├── routers.ts       # tRPC routes
│   ├── db.ts           # Database queries
│   └── rss.ts          # RSS generation
├── drizzle/            # Database schema
└── shared/             # Shared types
```

### Adding New Features

1. **Database**: Update `drizzle/schema.ts`
2. **Queries**: Add to `server/db.ts`
3. **API**: Add routes to `server/routers.ts`
4. **UI**: Create components in `client/src/`

### Running Tests

```bash
pnpm test
```

## RSS Feed Format

The RSS feed follows RSS 2.0 specification with:
- Channel metadata
- Item per published press release
- Full content in `<content:encoded>`
- Author attribution in `<dc:creator>`
- Categories from industry and keywords
- Proper CDATA escaping

## Future Enhancements

- [ ] Media file upload (logos, images, videos)
- [ ] Press release versioning
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Template library
- [ ] AI content suggestions
- [ ] Multi-language support
- [ ] Advanced search and filtering

## Support

For issues or questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review application logs
- Verify environment variables
- Ensure database connectivity

## License

[Your License Here]

## Credits

Built with modern web technologies and following industry best practices for press release distribution.

