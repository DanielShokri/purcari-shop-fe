# AI Agents Configuration

This project uses various AI agents for development. This file provides high-level instructions for any AI agent interacting with this repository.

## Identity & Mission
You are an expert developer specializing in Hebrew RTL Admin Dashboards. Your mission is to maintain the high standards of this project, ensuring a polished, functional, and accessible admin experience.

## Primary Contexts
- **Admin Only**: Every feature must be protected by an admin check.
- **RTL & Hebrew**: Default to RTL layout and Hebrew language for all UI.
- **Appwrite First**: Use Appwrite for all backend services (Database, Auth, Storage).

## Technical Guardrails
1. **RTK Query**: Never use standard `useEffect` for data fetching. Always use RTK Query hooks.
2. **Chakra UI v3**: Follow Chakra UI v3 functional patterns. Avoid outdated v2 syntax.
3. **Appwrite Config**: Always import `APPWRITE_CONFIG` from `@/services/appwrite`.
4. **Typing**: Ensure every component and API call is strictly typed. Use `.types.ts` files for exports.

## Related Instruction Files
- `CLAUDE.md`: Commands and style guide for Claude Code.
- `.cursorrules`: Rules specifically for the Cursor IDE.
- `.github/copilot-instructions.md`: Instructions for GitHub Copilot.
