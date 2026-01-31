# Plan 04-01: Fix Admin Dependency Resolution

This plan addresses LSP errors and dependency resolution issues in the Admin application following its integration into the pnpm monorepo.

## Objective
Ensure the Admin application correctly resolves all dependencies, types, and workspace paths, and successfully builds within the monorepo environment.

## Context
- **Issue:** Admin app files (e.g., `Dashboard.tsx`) report missing modules (`@chakra-ui/react`, `react-router-dom`).
- **Cause:** Potential workspace configuration issues, missing `pnpm install`, or misconfigured `tsconfig.json`.
- **Constraint:** Use pnpm workspaces, Chakra UI v3, Convex.

## Tasks
- [ ] **Task 1: Verify Monorepo Configuration**
  - Check `pnpm-workspace.yaml` includes `apps/admin`.
  - Check root `package.json` and `apps/admin/package.json`.
  - Run `pnpm install` from the root to ensure all symlinks and dependencies are created.
- [ ] **Task 2: Align Admin Dependencies**
  - Ensure `@chakra-ui/react`, `@emotion/react`, `@emotion/styled`, `framer-motion`, `react-router-dom` are correctly listed in `apps/admin/package.json`.
  - Verify versions match the rest of the monorepo where applicable.
- [ ] **Task 3: Configure TypeScript for Monorepo**
  - Update `apps/admin/tsconfig.json` to handle workspace paths (`@shared`, `@convex`).
  - Ensure `moduleResolution` is set correctly (e.g., `"bundler"`).
- [ ] **Task 4: Fix Workspace Exports (if needed)**
  - Ensure `packages/shared` is correctly exported and consumable by `apps/admin`.
- [ ] **Task 5: Smoke Test & Build**
  - Run `pnpm run build` in `apps/admin` and verify success.
  - Check that LSP errors in `apps/admin/pages/Dashboard.tsx` are resolved.

## Verification
- `pnpm install` completes without errors.
- `pnpm -F admin run build` succeeds.
- `npx tsc -p apps/admin/tsconfig.json --noEmit` passes.

## Success Criteria
- [ ] No "Module not found" errors in Admin source files.
- [ ] Admin application builds successfully in the monorepo.
- [ ] Workspace packages (`@shared`) are correctly resolved.
