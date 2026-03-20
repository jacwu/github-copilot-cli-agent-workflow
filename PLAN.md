# Plan: github-coding-agent

## TL;DR

创建一个新项目 `github-coding-agent`，复用 test-coding-agent 的四阶段工作流（design → design-revise → implement → implement-revise），但将执行引擎从 GitHub 原生 coding agent 替换为 GitHub Copilot CLI（v1.0.9）。CLI 只负责修改文件，workflow 自行处理 git commit/push/create PR。操作自身仓库，共用 `feature/<issue-number>` 分支，无需 MCP。

## Design Decisions

1. **方案 B**: CLI 只改代码，workflow 负责 git add/commit/push/create PR
2. **共用分支**: `feature/<issue-number>`，四个阶段复用
3. **操作自身仓库**: workflow checkout 后 CLI 直接在当前目录工作
4. **Token**: 用户提供 `COPILOT_ACTION_TOKEN` (secret) — 同时用于 Copilot CLI 认证和 GitHub API 操作
5. **必须有产出**: 每个阶段必须更新其产出文件（task.md 或 implement.md），否则视为失败
6. **无需 MCP**: 不配置 MCP server
7. **CLI 参数**: 使用 `--agent`（不是 `--custom-agent`），基于 Copilot CLI 1.0.9
8. **Node**: 24
9. **PR body**: 使用 `Refs #<issue-number>` 关联 issue

## Stage Configuration

| Stage | Label | Model | Agent | Output |
|---|---|---|---|---|
| Design | `ai-design` | gpt-5.4 | ai-design.agent.md | task.md |
| Design Revise | `ai-design-revise` | claude-opus-4.6 | ai-design-revise.agent.md | task.md |
| Implement | `ai-implement` | claude-opus-4.6 | ai-implement.agent.md | implement.md |
| Implement Revise | `ai-implement-revise` | gpt-5.4 | ai-implement-revise.agent.md | implement.md |

## Project Structure

```
github-coding-agent/
├── .github/
│   ├── agents/
│   │   ├── ai-design.agent.md
│   │   ├── ai-design-revise.agent.md
│   │   ├── ai-implement.agent.md
│   │   └── ai-implement-revise.agent.md
│   └── workflows/
│       ├── ai-design.yml
│       ├── ai-design-revise.yml
│       ├── ai-implement.yml
│       ├── ai-implement-revise.yml
│       └── stage-router.yml
├── scripts/
│   ├── comment_on_issue.py
│   ├── add_label_to_issue.py
│   ├── get_issue_labels.py
│   ├── get_issue_number_from_pr.py
│   ├── create_branch.py
│   ├── create_pr.py
│   └── fetch_issue.py
├── docs/
│   ├── requirements.md
│   ├── design.md
│   ├── tasks.md
│   └── tasks/
├── AGENTS.md
├── PLAN.md
└── README.md
```

## Workflow Pattern

Each stage workflow follows this pattern:

1. Checkout repository
2. Setup Python 3.11 + Node.js 24
3. Install Copilot CLI (`npm install -g @github/copilot`)
4. Comment issue: "Stage X started"
5. Create/switch to `feature/<issue-number>` branch
6. Configure git identity (`"GitHub Copilot CLI"` / `"cli@githubcopilot.com"`)
7. Fetch issue context via `fetch_issue.py`
8. Build prompt (stage instruction + issue context)
9. Run Copilot CLI with `--agent`, `--prompt`, `--model`, `--allow-all`, `--no-ask-user`, `--silent`
10. Post CLI output as issue comment (inside `<details>` tag, truncated to 60KB)
11. Verify output file exists and was modified
12. Commit and push
13. Create PR via `create_pr.py`
14. Comment issue: "Stage X completed"

## CLI Invocation

```bash
copilot \
  --agent .github/agents/<stage>.agent.md \
  --prompt "$(cat copilot-prompt.txt)" \
  --model "$MODEL" \
  --allow-all \
  --no-ask-user \
  --silent \
  2>&1 | tee copilot-output.txt
```

## Git Identity

- Name: `GitHub Copilot CLI`
- Email: `cli@githubcopilot.com`

## Branch Strategy

- Shared `feature/<issue-number>` branch across all stages
- Design stage creates the branch via `create_branch.py`
- Subsequent stages fetch and checkout the existing branch, then merge `origin/main`

## PR Strategy

- Title: `[<Stage>] #<issue-number>: <issue-title>`
- Body: `Stage: <label>\nRefs #<issue-number>\n\nAutomated PR created by GitHub Copilot CLI for the <stage> stage.`
- Base: `main`
- Head: `feature/<issue-number>`

## Output Verification

Each stage verifies its expected output file after CLI execution:
- Design / Design Revise: `docs/tasks/<issue-number>/task.md`
- Implement / Implement Revise: `docs/tasks/<issue-number>/implement.md`

If the output file doesn't exist or wasn't modified, the workflow comments a failure message on the issue and exits with error.

## Scripts

### Reused from test-coding-agent
- `comment_on_issue.py` — Add comments to GitHub issues
- `add_label_to_issue.py` — Add labels to GitHub issues
- `get_issue_labels.py` — Get labels of a GitHub issue
- `create_branch.py` — Create a branch from the default branch

### Modified
- `get_issue_number_from_pr.py` — Extended with `Issue: #N` / `Refs: #N` parsing (priority over closingIssuesReferences)

### New
- `fetch_issue.py` — Fetch issue title, body, and comments (filters out bot comments)
- `create_pr.py` — Create pull requests via GitHub REST API

## Secrets

| Secret | Purpose |
|---|---|
| `COPILOT_ACTION_TOKEN` | PAT with repo scope + Copilot access. Used as `GH_TOKEN` for CLI and `GITHUB_TOKEN` for scripts. |
