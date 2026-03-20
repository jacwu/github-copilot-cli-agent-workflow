# GitHub Coding Agent

A four-stage AI coding pipeline that uses **GitHub Copilot CLI** to automate software development tasks through GitHub Actions workflows.

## Architecture

When a GitHub issue receives a stage label, the corresponding workflow triggers and runs the Copilot CLI to produce or revise design documents and code. After each stage completes, a PR is created. When the PR is merged, a stage-router workflow automatically advances the issue to the next stage.

### Four-Stage Pipeline

| Stage | Label | Model | Agent | Output |
|---|---|---|---|---|
| Design | `ai-design` | gpt-5.4 | ai-design.agent.md | `docs/tasks/<issue-number>/task.md` |
| Design Revise | `ai-design-revise` | claude-opus-4.6 | ai-design-revise.agent.md | `docs/tasks/<issue-number>/task.md` |
| Implement | `ai-implement` | claude-opus-4.6 | ai-implement.agent.md | `docs/tasks/<issue-number>/implement.md` |
| Implement Revise | `ai-implement-revise` | gpt-5.4 | ai-implement-revise.agent.md | `docs/tasks/<issue-number>/implement.md` |

### Flow

```
Issue created
  → Add `ai-design` label
    → Design workflow runs Copilot CLI → creates PR
      → Merge PR → stage-router adds `ai-design-revise` label
        → Design Revise workflow → creates PR
          → Merge PR → stage-router adds `ai-implement` label
            → Implement workflow → creates PR
              → Merge PR → stage-router adds `ai-implement-revise` label
                → Implement Revise workflow → creates PR
                  → Merge PR → Done
```

## Project Structure

```
.github/
  agents/           # Copilot CLI agent instruction files
    ai-design.agent.md
    ai-design-revise.agent.md
    ai-implement.agent.md
    ai-implement-revise.agent.md
  workflows/        # GitHub Actions workflow files
    ai-design.yml
    ai-design-revise.yml
    ai-implement.yml
    ai-implement-revise.yml
    stage-router.yml
scripts/            # Python helper scripts for GitHub API operations
docs/               # Project documentation
  requirements.md
  design.md
  tasks.md
  tasks/            # AI-generated output directory (by issue number)
```

## Setup

### Prerequisites

- A GitHub repository with GitHub Actions enabled
- A GitHub Personal Access Token (PAT) with:
  - `repo` scope (full control of private repositories)
  - Copilot access (for CLI authentication)

### Configuration

1. **Add the repository secret:**
   - Go to Settings → Secrets and variables → Actions
   - Add a secret named `COPILOT_ACTION_TOKEN` with your PAT

2. **Create the stage labels** in your repository:
   - `ai-design`
   - `ai-design-revise`
   - `ai-implement`
   - `ai-implement-revise`

3. **Prepare project documentation:**
   - Create `docs/requirements.md` with your product requirements
   - Create `docs/design.md` with your technical design decisions
   - Create `docs/tasks.md` with your development task checklist

### Usage

1. Create a GitHub issue describing the task
2. Add the `ai-design` label to the issue
3. The pipeline runs automatically through all four stages

## How It Works

Each stage workflow:

1. Checks out the repository
2. Sets up Python 3.11 and Node.js 24
3. Installs the Copilot CLI (`npm install -g @github/copilot`)
4. Fetches the issue context (title, body, comments)
5. Runs the Copilot CLI with the stage-specific agent file
6. Validates that the expected output file was produced
7. Commits and pushes changes to the `feature/<issue-number>` branch
8. Creates a PR linking back to the issue
9. Posts status comments on the issue

The CLI is invoked with:
```bash
copilot --agent <agent-file> --prompt <context> --model <model> --allow-all --no-ask-user --silent
```

The pipeline uses a shared base branch `feature/<issue-number>` plus stage branches derived from it: `feature/<issue-number>-design`, `feature/<issue-number>-design-revise`, `feature/<issue-number>-implement`, and `feature/<issue-number>-implement-revise`.

## Secrets

| Secret | Purpose |
|---|---|
| `COPILOT_ACTION_TOKEN` | Copilot CLI authentication + GitHub API operations (PAT with repo + Copilot access) |
