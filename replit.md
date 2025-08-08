# Overview

This is a modern e-commerce checkout application built with React and Express.js. The application provides a secure payment gateway integration supporting multiple payment methods including UPI, card payments, and cash on delivery (COD). It features a clean, responsive interface for order management and billing address collection.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built with React and TypeScript, using a modern component-based architecture:

- **Component Library**: Shadcn/ui components with Radix UI primitives for accessible, customizable UI elements
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack React Query for server state management and API caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

The frontend follows a modular structure with reusable components for payment methods, order summaries, and billing address forms. The design system uses a neutral color palette with blue primary and green secondary colors.

## Backend Architecture

The server-side uses Express.js with TypeScript in a RESTful API pattern:

- **Runtime**: Node.js with ES modules for modern JavaScript features
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Session Management**: In-memory storage for development, designed to scale to PostgreSQL
- **API Design**: RESTful endpoints with JSON request/response format
- **Error Handling**: Centralized error middleware with proper HTTP status codes

The backend implements a layered architecture with clear separation between routes, business logic, and data access layers. Mock implementations are provided for development while maintaining production-ready interfaces.

## Data Storage

- **Database**: PostgreSQL (configured via Drizzle) with support for Neon serverless database
- **Schema**: Well-defined tables for users, orders, and order items with proper relationships
- **Migrations**: Drizzle Kit for database schema versioning and migrations
- **Development Storage**: In-memory storage implementation for local development

The database schema supports user management, order tracking with multiple statuses, and detailed order item records. Decimal precision is maintained for financial calculations.

## Authentication and Authorization

The application is designed with authentication hooks in place:

- Session-based authentication infrastructure ready for implementation
- User management schema with secure password storage design
- API routes structured to support protected endpoints
- Frontend components prepared for user state management

Currently operating in demo mode with mock user data for development purposes.

# External Dependencies

## Payment Gateway Integration

- **Razorpay**: Primary payment processor supporting UPI, cards, and digital wallets
- **Payment Methods**: UPI (instant), card payments, and cash on delivery with configurable fees
- **Security**: HTTPS required for production payment processing
- **Webhooks**: Infrastructure ready for payment status callbacks

## Database Services

- **Neon Database**: Serverless PostgreSQL for production deployment
- **Connection Pooling**: Built-in connection management via @neondatabase/serverless

## Development Tools

- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Hot Reload**: Vite HMR for fast development cycles
- **Error Overlay**: Runtime error handling with user-friendly error modals

## UI and Styling

- **Google Fonts**: Inter font family for modern typography
- **Font Awesome**: Icon library for payment method indicators
- **Unsplash**: Placeholder images for product demonstrations
- **Radix UI**: Accessible component primitives for form controls and overlays

## Build and Deployment

- **ESBuild**: Fast bundling for server-side code in production
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **TypeScript**: Full type safety across frontend and backend with shared schemas