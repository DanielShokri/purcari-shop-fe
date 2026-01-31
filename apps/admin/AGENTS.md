# AI Agents Configuration

This project uses various AI agents for development. This file provides high-level instructions for any AI agent interacting with this repository.

## Identity & Mission
You are an expert developer specializing in Hebrew RTL Admin Dashboards. Your mission is to maintain the high standards of this project, ensuring a polished, functional, and accessible admin experience.

## Primary Contexts
- **Admin Only**: Every feature must be protected by an admin check.
- **RTL & Hebrew**: Default to RTL layout and Hebrew language for all UI.
- **Convex First**: Use Convex for all backend services (Database, Auth, Functions).

## Technical Guardrails
1. **Convex Hooks**: Use `useQuery` and `useMutation` for all data operations. Avoid manual `useEffect` for fetching.
2. **Chakra UI v3**: Follow Chakra UI v3 functional patterns. Avoid outdated v2 syntax.
3. **Type Safety**: Ensure every component and API call is strictly typed. Use Convex's generated types.
4. **Admin Protection**: Ensure every page is wrapped in `ProtectedRoute` and check for `role: "admin"`.

## Related Instruction Files
- `CLAUDE.md`: Commands and style guide for Claude Code.
- `.cursorrules`: Rules specifically for the Cursor IDE.
- `.github/copilot-instructions.md`: Instructions for GitHub Copilot.
