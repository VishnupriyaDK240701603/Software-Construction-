# Azure DevOps Pipeline — Overview

## About

The Product Price Comparison System uses **Azure DevOps Pipelines** for Continuous Integration (CI). The pipeline is defined in the `azure-pipelines.yml` file located at the root of the repository.

## Pipeline Configuration

| Setting | Value |
|---|---|
| **Trigger Branch** | `main` |
| **Build Agent** | Ubuntu Latest (Hosted) |
| **Runtime** | Node.js 18.x LTS |
| **Repository** | `VishnupriyaDK240701603/Software-Construction` |

## Pipeline File

The pipeline is configured in [`azure-pipelines.yml`](../../azure-pipelines.yml):

```yaml
trigger:
  - main  # Trigger pipeline when changes are pushed to the main branch

pool:
  vmImage: ubuntu-latest  # Use a hosted Ubuntu agent
```

## Pipeline Steps Summary

| Step | Task | Description |
|---|---|---|
| 1 | `checkout: self` | Checkout code from GitHub |
| 2 | `NodeTool@0` | Set up Node.js 18.x environment |
| 3 | `npm install` (backend) | Install backend dependencies |
| 4 | `npm install` (frontend) | Install frontend dependencies |
| 5 | `npm run build` (frontend) | Build frontend production bundle |
| 6 | `node -e "..."` | Run verification script |

## Related Docs

- [Pipeline Tasks — Detailed](pipeline-tasks.md)
- [Run & Monitor Pipeline](run-and-monitor.md)
