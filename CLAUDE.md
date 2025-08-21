# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Aperture Core agency website built with Astro + Tailwind CSS. It's a server-side rendered application with API endpoints, deployed on a VPS using Dokploy.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Architecture

### Core Structure
- **Framework**: Astro with TypeScript in SSR mode
- **Adapter**: Node.js adapter in standalone mode
- **Styling**: Tailwind CSS v4 (configured via Vite plugin)
- **Layout System**: `src/layouts/BaseLayout.astro` provides consistent page structure with Header/Footer
- **Components**: Reusable Astro components in `src/components/`
- **Pages**: Route-based pages in `src/pages/`
- **API Routes**: Server-side endpoints in `src/pages/api/`

### Contact Form System
- **Frontend**: `src/components/ContactForm.astro` with validation and honeypot protection
- **Backend**: `src/pages/api/contact.ts` TypeScript API endpoint with:
  - Rate limiting (10-second window per IP)
  - Input validation and sanitization
  - Honeypot spam protection
  - Timing attack prevention (minimum 3-second form fill)
- **Success Flow**: Redirects to `/gracias` page after successful submission

### Email Configuration
Environment variables for Resend integration:
- `RESEND_API_KEY`: Your Resend API key (required)
- `CONTACT_TO`: Recipient email (default: info@aperturecore.com)
- `CONTACT_FROM`: Sender email (default: noreply@aperturecore.com)

**Email Service**: Uses Resend API for reliable email delivery with both HTML and text versions

### Deployment Strategy
- **Target**: VPS with Dokploy
- **Container**: Docker-based deployment
- **Process**: 
  1. Build application with `npm run build`
  2. Docker containerization with multi-stage build
  3. Dokploy handles deployment and orchestration
- **Server**: Node.js standalone server on port 4321

## Key Files

- `src/layouts/BaseLayout.astro`: Main layout with SEO meta tags and structured data
- `src/components/ContactForm.astro`: Contact form component (supports compact mode)
- `src/pages/api/contact.ts`: TypeScript API endpoint for form submission
- `astro.config.mjs`: Astro configuration with Node.js adapter and sitemap
- `src/styles/global.css`: Single Tailwind import (uses Tailwind v4)
- `Dockerfile`: Multi-stage Docker build configuration
- `.dockerignore`: Docker build exclusions

## Content Strategy

The site focuses on:
- B2B software development services
- MVP development, dedicated teams, and modernization
- Spanish language content targeting Latin American market
- Technology stack: TypeScript, Node, Python, Astro/Next, AWS, PostgreSQL

## Development Notes

- No test suite or linting configuration detected
- Uses Astro's strict TypeScript configuration
- Tailwind CSS v4 with Vite integration (no separate config file)
- Server-side rendering with Node.js adapter
- SEO optimized with meta tags, structured data, and sitemap generation
- Plausible analytics integration via PUBLIC_PLAUSIBLE_DOMAIN environment variable
- Contact form uses Resend for email delivery (requires RESEND_API_KEY)

## Docker Deployment

- Multi-stage Docker build optimized for production
- Runs as non-root user (astro:nodejs)
- Exposes port 4321
- Uses `npm run preview` to serve the built application