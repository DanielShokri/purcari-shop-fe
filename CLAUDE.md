# Hebrew Admin Dashboard - AI Guide

## Project Context
A Hebrew RTL admin dashboard for e-commerce management. Admin-only access via Appwrite.

## Technology Stack
- **Frontend**: React 19 + TypeScript + Vite 6
- **UI**: Chakra UI v3 (Emotion)
- **State**: Redux Toolkit (RTK Query)
- **Backend**: Appwrite SDK
- **Charts**: Recharts

## Commands
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Code Style & Conventions
- **Component Style**: Functional components with `export default function ComponentName()`.
- **Prop Typing**: Inline prop definitions for simple components.
- **RTL Standards**: 
  - HTML has `dir="rtl"`.
  - Use Hebrew for UI labels.
  - Wrap LTR content (dates, emails) in `dir="ltr"`.
  - Charts need `style={{ direction: 'ltr' }}`.
- **Naming**: 
  - PascalCase for components.
  - camelCase for hooks and utilities.
  - `*.types.ts` for type files.
- **State Management**: Use RTK Query for all API interactions. Wrap Appwrite calls in `queryFn`.
- **Appwrite**: Always use `APPWRITE_CONFIG` constants. Never hardcode IDs.

## Hebrew Text Standards
- **Errors**: `'שגיאה בהתחברות'`, `'שדה חובה'`
- **Loading**: `'טוען נתונים...'`
- **Buttons**: `'שמור'`, `'ביטול'`, `'מחק'`
