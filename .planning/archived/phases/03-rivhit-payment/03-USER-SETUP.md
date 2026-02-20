# Phase 03: Rivhit Payment - User Setup Required

**Status:** Incomplete

This phase requires manual configuration of external services that cannot be automated.

---

## Rivhit Payment Gateway

**Why needed:** Payment processing and invoice generation for Israeli market

### Environment Variables

Add these to your Convex deployment:

| Variable | Source | Description |
|----------|--------|-------------|
| `RIVHIT_API_TOKEN` | Rivhit Dashboard or API | Authentication token for Rivhit API |
| `RIVHIT_ENVIRONMENT` | Set to `test` or `production` | Controls API environment (default: `test`) |
| `CONVEX_SITE_URL` | Convex Dashboard | Your Convex HTTP site URL for callbacks |
| `VITE_STOREFRONT_URL` | Your deployment | Storefront URL for post-payment redirect |

### Account Setup Checklist

- [ ] Create a Rivhit account at [rivhit.co.il](https://rivhit.co.il) if you don't have one
- [ ] Obtain your Company ID from the Rivhit dashboard
- [ ] Generate an API token (see below)

### Get/Generate API Token

**Option 1: Via Rivhit Dashboard**
1. Log in to your Rivhit account
2. Navigate to Settings > API Settings
3. Copy your API token

**Option 2: Via API Call**
```bash
curl -X POST https://api.rivhit.co.il/online/RivhitOnlineAPI.svc/ApiToken.Get \
  -H "Content-Type: application/json" \
  -d '{
    "username": "YOUR_USERNAME",
    "password": "YOUR_PASSWORD",
    "company_id": YOUR_COMPANY_ID
  }'
```

### Configure Convex Environment Variables

```bash
# Set via CLI
npx convex env set RIVHIT_API_TOKEN "your-api-token-here"
npx convex env set RIVHIT_ENVIRONMENT "test"  # or "production"

# CONVEX_SITE_URL is typically auto-set by Convex
# If not, get it from the Convex dashboard under Settings > Site URL
```

### Local Development

For local development:

1. Copy `.env.local.example` to `.env.local` (if it exists)
2. Add the Rivhit token to Convex environment (see above)
3. The storefront URL defaults to `http://localhost:3000`

### Verification Commands

After setup, verify the configuration:

```bash
# Check env vars are set
npx convex env get RIVHIT_API_TOKEN
npx convex env get RIVHIT_ENVIRONMENT

# Test the Rivhit API connection (should return test response)
curl -X POST https://api.rivhit.co.il/online/RivhitOnlineAPI.svc/test
```

---

## Document Types Reference

The integration uses these standard Israeli document types:

| Code | Type | Hebrew | Use Case |
|------|------|--------|----------|
| 305 | Invoice-Receipt | חשבונית מס / קבלה | E-commerce transactions (default) |
| 300 | Invoice | חשבונית מס | Tax invoice only |
| 400 | Receipt | קבלה | Receipt only |
| 100 | Order | הזמנה | Quote/Order confirmation |

---

*Generated: 2026-02-15*
*Phase: 03-rivhit-payment*
