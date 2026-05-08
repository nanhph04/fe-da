# Distributed Media System - Frontend

This is a Next.js frontend application for the Distributed Media System platform, featuring Studio Wallet functionality with comprehensive design system, API integration, and testing infrastructure.

## 🎯 Features

- **Studio Wallet Management**: Complete wallet system with balance tracking, earnings, and payouts
- **Video Monetization**: Track and manage video revenue streams
- **Responsive Design**: Mobile-first approach with Cinematic Canvas aesthetic
- **Performance Optimized**: Lazy loading, virtual scrolling, and optimized bundles
- **Accessibility First**: WCAG 2.1 compliant with full keyboard navigation
- **Real-time Updates**: React Query with caching and optimistic updates
- **Comprehensive Testing**: Unit, integration, performance, and accessibility tests

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fe
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── studio/            # Studio routes
│   │   └── wallet/       # Wallet pages
│   └── layout.tsx        # Root layout
├── features/              # Feature-based modules
│   ├── studio-wallet/    # Studio wallet feature
│   │   ├── components/   # Feature components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   └── auth/             # Authentication feature
├── design-system/        # Design system
│   ├── tokens/           # Design tokens
│   └── components/       # Reusable UI components
└── shared/               # Shared utilities
    └── utils/            # Utility functions
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing
npm test            # Run all tests
npm run test:unit    # Run unit tests only
npm run test:component # Run component tests only
npm run test:integration # Run integration tests only
npm run test:accessibility # Run accessibility tests only
npm run test:performance # Run performance tests only
npm run test:coverage # Run tests with coverage

# CI/CD
npm run validate     # Run all validation checks
```

### Testing

The project uses Jest with React Testing Library for comprehensive testing:

- **Unit Tests**: Test individual functions and services
- **Component Tests**: Test UI components with user interactions
- **Integration Tests**: Test data flow and API integration
- **Performance Tests**: Measure performance metrics
- **Accessibility Tests**: Verify WCAG compliance

### Design System

The project uses a custom design system built on:

- **Cinematic Canvas Theme**: Dark mode with Crimson (#ff8e80) and Gold (#fdc003) accents
- **TailwindCSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **TypeScript**: Type-safe development

## 🚀 Deployment

### GitHub Actions

The project includes a CI/CD pipeline that:

1. Runs tests on multiple Node.js versions
2. Checks code quality (linting, type checking)
3. Builds the application
4. Runs security scans
5. Deploys to staging and production environments

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 📊 Performance

The application is optimized for:

- **Fast Initial Load**: Code splitting and lazy loading
- **Smooth Interactions**: Optimized state management
- **Efficient Caching**: React Query with smart caching
- **Memory Management**: Proper cleanup and garbage collection
- **Bundle Optimization**: Tree shaking and dynamic imports

## ♿ Accessibility

The application meets WCAG 2.1 AA standards with:

- Full keyboard navigation
- Screen reader support
- Proper color contrast
- Focus management
- ARIA labels and descriptions

## 🔒 Security

- Input validation with Zod
- XSS protection
- CSRF protection
- Secure API communication
- Error boundary handling

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.
