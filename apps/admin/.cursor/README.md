# AI Rules & Context (Agnostic)

This directory contains rules and context for AI agents (Cursor, Claude Code, GitHub Copilot, etc.) to ensure consistency across the codebase.

## Support Matrix
- **Cursor**: Uses `.cursor/rules/*.mdc` and `.cursorrules`.
- **Claude Code**: Uses `CLAUDE.md`.
- **GitHub Copilot**: Uses `.github/copilot-instructions.md` (Optional).
- **Universal**: `AI_INSTRUCTIONS.md` (General reference).

## Core Rules Summary
- **RTL/Hebrew**: All UI must be RTL and in Hebrew.
- **Tech Stack**: React 19, Chakra UI v3, Appwrite.
- **State**: Redux Toolkit + RTK Query.
- **Admin**: Only users with the `admin` label in Appwrite should have access.
