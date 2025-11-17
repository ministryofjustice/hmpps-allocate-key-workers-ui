# HMPPS Allocate Key Workers UI

[![Ministry of Justice Repository Compliance Badge](https://github-community.service.justice.gov.uk/repository-standards/api/hmpps-allocate-key-workers-ui/badge?style=flat)](https://github-community.service.justice.gov.uk/repository-standards/hmpps-allocate-key-workers-ui)
[![codecov](https://codecov.io/github/ministryofjustice/hmpps-allocate-key-workers-ui/graph/badge.svg?token=Y9DDNQZ1J1)](https://codecov.io/github/ministryofjustice/hmpps-allocate-key-workers-ui)
[![Docker Repository on ghcr](https://img.shields.io/badge/ghcr.io-repository-2496ED.svg?logo=docker)](https://ghcr.io/ministryofjustice/hmpps-allocate-key-workers-ui)

A frontend application for HMPPS prison staff to manage key worker and personal officer allocations to prisoners.

## Overview

This service allows prison staff to:
- View and manage key worker allocations
- Handle personal officer assignments
- View prisoner allocation history
- Access staff profiles and case notes
- Configure establishment-specific settings

## Tech Stack

- **Language**: TypeScript
- **Framework**: Express 5.x
- **Template Engine**: Nunjucks
- **Styling**: GOV.UK Frontend, SCSS
- **Testing**: Cypress
- **Monitoring**: Application Insights, Sentry
- **Authentication**: OAuth2

## Prerequisites

- Node.js 20.x (see `.nvmrc`)
- Docker

## Getting Started

### Installation
```bash
npm install
```

### Configuration
Create a copy of the `.env.example` file:
```bash
cp .env.example .env
```
Update the environment variables in `.env` to match your environment.

### Running Locally
Using Docker compose:
```bash
docker compose pull
docker compose up
```

Or run the application directly:
```bash
npm run start:dev
```
The application will be available at http://localhost:3000

## Development

### Build
```bash
npm run build
```

### Run Tests
```bash
npm run int-test-ui
```

### Code Quality
```bash
npm run lint

npm run lint-fix
```

### Syncing API Types With Swagger

Run `npm run swagger` to pull the latest typedefs from the api backend.

## Deployment
This application is deployed to the Cloud Platform using Helm charts located in `helm_deploy/`.
Environment configurations:
- Dev: [values-dev.yaml](helm_deploy/values-dev.yaml)
- Pre-production: [values-preprod.yaml](helm_deploy/values-preprod.yaml)
- Production: [values-prod.yaml](helm_deploy/values-prod.yaml)

## Project Structure
```
├── server/              # Server-side code
│   ├── routes/          # Route controllers and views
│   ├── services/        # Business logic
│   ├── data/            # Data access layer
│   ├── middleware/      # Express middleware
│   └── views/           # Nunjucks templates
├── assets/              # Frontend assets (JS, SCSS, images)
├── integration_tests/   # Cypress integration tests
└── helm_deploy/         # Kubernetes deployment configs
```

## License
MIT License — see [LICENSE](LICENSE) for more details.

## Support
For issues or questions, contact the HMPPS Digital team.
