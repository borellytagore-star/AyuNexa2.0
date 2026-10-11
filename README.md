# AyuNexa — Connected Care. Smarter Health.

AyuNexa is a patient-centered healthcare companion designed to help people organize everyday medication routines and coordinate care with authorized caregivers and healthcare professionals.

## Project Links

- **Prototype:** https://medicare-ai-2.ai.studio/
- **GitHub repository:** https://github.com/borellytagore-star/AyuNexa2.0

## The Problem

Care continues between clinic visits, but medication schedules, stock levels, refill needs, caregiver updates, and health information are often spread across separate tools. This fragmentation can make everyday care harder for patients and families.

## Our Approach

AyuNexa aims to bring these workflows together in one accessible platform, helping patients manage daily routines and share relevant information with authorized caregivers.

## Key Capabilities

- Medication profiles, schedules, and reminders
- Dose confirmation and medication history
- Medicine stock monitoring and estimated remaining-days runway
- Low-stock and refill assistance workflows
- Patient–caregiver coordination with consent-based permissions
- Medication reports and care-journey information
- AI-assisted support for non-clinical tasks
- Voice interaction and an Assisted Mode for accessibility
- Emergency-support workflow
- Offline-first support for essential medication workflows, where implemented

> **Important:** Features may vary by prototype version. Pharmacy ordering, live inventory/pricing, emergency-service dispatch, and other external integrations must not be assumed to be live unless explicitly configured and verified.

## Technology

The repository currently includes a React/Vite frontend, TypeScript source, a Node.js/Express server, and Android project scaffolding. Check the source files and `package.json` for the exact current dependencies and scripts.

## Getting Started

### Prerequisites

- Node.js compatible with the project's dependencies
- npm, or Bun if you choose to use the included Bun lockfile
- Git

### Setup

```bash
git clone https://github.com/borellytagore-star/AyuNexa2.0.git
cd AyuNexa2.0
npm install
```

Copy `.env.example` to `.env` and fill in only the environment variables required for the features you intend to run. Never commit API keys, passwords, tokens, or real patient information.

### Run locally

Inspect the scripts in `package.json` first. For a project with a `dev` script, run:

```bash
npm run dev
```

If the command differs in your checkout, use the script names defined in `package.json`. The frontend and backend may require separate commands depending on the current configuration.

## Responsible Healthcare Design

AyuNexa is intended to support care organization, not replace qualified healthcare professionals.

- AI assistance must not independently diagnose, prescribe, or change a medicine plan.
- Medication changes must be authorized by an appropriate healthcare professional.
- A user tapping “Taken” is a recorded report, not proof that a dose was swallowed.
- A no-response event must not be automatically treated as a confirmed missed dose.
- Patient information should be shared only with appropriate authorization and consent.
- Never claim an emergency service has been contacted or dispatched unless that status is confirmed by the relevant service.
- Real pharmacy, payment, and emergency integrations require authorization, testing, and appropriate review.

## Development Status

AyuNexa is under active development. This README describes the intended product and general repository setup; it does not claim that every feature is production-ready. Confirm current functionality, test results, external integrations, and deployment status in the source code before relying on them.

## Contributing

Contributions and feedback are welcome. Before submitting changes, describe the problem, explain the implementation, and include relevant tests. Do not include real patient data or secrets in issues, commits, or test fixtures.

## Project

**AyuNexa**  
*Connected Care. Smarter Health.*
