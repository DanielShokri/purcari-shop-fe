# Project State: Appwrite to Convex Migration

## Current Status
- **Phase:** Phase 2: Core Functions & Data
- **Overall Progress:** 20%
- **Current Sprint:** Sprint 2: Convex Functions
- **Last Updated:** Sat Jan 31 2026

## Project Summary
Migrating the Purcari Israel monorepo (Storefront + Admin) from Appwrite to Convex. This is a "clean slate" migration as the project is not yet live.

## Technical Context
- **Backend:** Moving from Appwrite to Convex.
- **Frontend:** React + Redux (RTK Query).
- **Architecture:** Monorepo with `apps/storefront`, `apps/admin`, and several `packages/`.
- **Primary Goal:** Replace Appwrite SDK calls (via RTK Query `fakeBaseQuery`) with Convex queries, mutations, and actions.

## Key Metrics
- **Tables to Migrate:** 9
- **RTK Query Slices to Replace:** 18
- **Files Affected (Estimated):** 50+

## Recent Achievements
- [x] Initialized `.planning` directory.
- [x] Analyzed `CONVEX_MIGRATION_TECHNICAL_BRIEF.md`.
- [x] Phase 1 Completed: Infrastructure and Schema initialized.

## Progress
Progress: [██░░░░░░░░] 20%

## Immediate Blockers
- None identified.

## Risk Assessment
- **Hebrew Search:** Ensuring Convex search indexes correctly replace the current client-side Hebrew filtering.
- **Auth Transition:** Seamlessly moving from Appwrite Auth to Convex native Auth.
- **Complex Logic:** Accurately porting the 12-step coupon validation sequence to Convex actions.

## Team
- **Agent:** SuperClaude (Orchestrator + Implementer)
- **Stakeholder:** Daniel Shmuel Mirshukri
