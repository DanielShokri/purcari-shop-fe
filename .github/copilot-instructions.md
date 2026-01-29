# GitHub Copilot Instructions

## Project Overview
Hebrew RTL Admin Dashboard for e-commerce. Built with React 19, Chakra UI v3, and Appwrite.

## Coding Standards
- **React**: Functional components, default exports.
- **TypeScript**: Strict typing, interfaces for Appwrite docs, `.types.ts` suffix.
- **RTL**: Use Hebrew labels, `dir="rtl"` by default, `dir="ltr"` for technical data.
- **State**: RTK Query for all API calls.

## Appwrite
- Use `APPWRITE_CONFIG` from `services/appwrite.ts`.
- Database operations must be wrapped in `try/catch`.
- Use Cloud Functions for user management.

## UI (Chakra UI v3)
- Use functional component patterns.
- Keep components small and modular.
