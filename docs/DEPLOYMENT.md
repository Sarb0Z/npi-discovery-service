# Deployment

This repository uses Terraform to provision production infrastructure and GitHub Actions to orchestrate deployments.

## Production Topology

- Render hosts the NestJS API as a Docker-based web service.
- Render Key Value provides the Redis-compatible cache/pub-sub layer.
- Vercel hosts the Next.js frontend.
- GitHub Actions is the only deploy orchestrator for `main`.

## Directory Layout

```text
infra/terraform/
├── modules/
│   ├── render-api/
│   ├── render-keyvalue/
│   └── vercel/
└── environments/
    └── production/
```

## GitHub Secrets

Add these repository secrets in GitHub:

- `RENDER_API_KEY`
- `RENDER_OWNER_ID`
- `RENDER_API_SERVICE_ID`
- `VERCEL_API_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Notes:

- `RENDER_OWNER_ID` is the Render user or team owner ID, such as `usr-...` or `tea-...`.
- `VERCEL_ORG_ID` should be the Vercel org or account ID used in `.vercel/project.json`, not just a display name.
- `RENDER_API_SERVICE_ID` and `VERCEL_PROJECT_ID` should be stored as repository secrets for routine application deploys.
- If you want manual approval or deployment protection later, add a `production` GitHub environment and move the same secrets there before reintroducing job-level `environment` bindings.

## Local Infrastructure Commands

```bash
bun run infra:plan:production
bun run infra:apply:production
bun run infra:output:production
```

Terraform reads provider credentials from environment variables:

- `RENDER_API_KEY`
- `RENDER_OWNER_ID`
- `VERCEL_API_TOKEN`

The Vercel Terraform provider is currently configured to create resources in whatever account the `VERCEL_API_TOKEN` belongs to. If you later move this to a team-scoped token, reintroduce an explicit provider team setting.

If you want to override production defaults locally, copy [infra/terraform/environments/production/terraform.tfvars.example](/home/sarvz/Projects/npi-discovery-service/infra/terraform/environments/production/terraform.tfvars.example) to `terraform.tfvars` in the same directory.

## Deployment Order

On successful CI for `main`, the deploy workflow runs in this order:

1. Resolve the existing Render and Vercel production targets.
2. Trigger a Render API deploy.
3. Build and deploy the frontend to Vercel.
4. Run smoke checks against Render and Vercel.

When you need to reprovision infrastructure, run the `Deploy` workflow manually with `apply_infra=true`. That path runs Terraform first, then deploys the updated services in the same workflow.

## Render Notes

- The API uses `docker/api.Dockerfile` through the Render Terraform provider.
- Render auto-deploy is disabled in Terraform so GitHub Actions stays in control of production releases.
- The API gets a persistent disk mounted at `/var/data/providers`, and `PROVIDERS_OUTPUT_DIR` is set to the same path.
- Redis is provisioned as Render Key Value and wired into the API via `REDIS_URL`.

## Vercel Notes

- Terraform creates the Vercel project and injects `API_URL` and `NEXT_PUBLIC_API_URL`.
- GitHub Actions writes `apps/frontend/.vercel/project.json` at runtime using the stored `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` secrets.
- The deploy job uses `vercel pull`, `vercel build`, and `vercel deploy --prebuilt` so GitHub Actions remains the release gate.

## First Run Checklist

1. Add the required repository secrets in GitHub.
2. Review [infra/terraform/environments/production/terraform.tfvars.example](/home/sarvz/Projects/npi-discovery-service/infra/terraform/environments/production/terraform.tfvars.example) and create a local `terraform.tfvars` only if you need overrides.
3. Run `bun run infra:plan:production` locally.
4. Run `bun run infra:apply:production` locally or trigger the GitHub `Deploy` workflow manually with `apply_infra=true` for the first apply.
5. Push to `main` and watch the `Deploy` workflow.

## Current Limitation

The repository is now configured for Terraform-managed provisioning and GitHub-driven deployments, but an actual live deployment still requires your platform credentials. Without the Render and Vercel secrets in GitHub, the workflow cannot provision or release anything.