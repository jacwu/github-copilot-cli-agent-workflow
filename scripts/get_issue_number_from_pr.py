#!/usr/bin/env python3
"""
Get the linked issue numbers for a PR using the GitHub GraphQL API.

Default behavior:
1. Auto-resolve owner/repo from the git remote origin URL
2. Read token from CLI argument or GITHUB_TOKEN environment variable
3. Parse PR body for Issue: #N or Refs: #N patterns first
4. Fall back to parsing the PR title and branch names for #N patterns
5. Fall back to closingIssuesReferences from GraphQL
6. Fall back to parsing Fixes/Closes/Resolves keywords from the PR body
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from typing import Any
from urllib import error, parse, request


API_VERSION = "2022-11-28"
GITHUB_GRAPHQL_API = "https://api.github.com/graphql"


def get_git_remote_url() -> str:
    result = subprocess.run(
        ["git", "config", "--get", "remote.origin.url"],
        capture_output=True,
        text=True,
        check=False,
    )

    if result.returncode != 0 or not result.stdout.strip():
        raise ValueError("Failed to read git remote.origin.url. Make sure the current directory is a Git repository")

    return result.stdout.strip()


def parse_owner_repo(remote_url: str) -> tuple[str, str]:
    cleaned = remote_url.strip()
    if cleaned.endswith(".git"):
        cleaned = cleaned[:-4]

    if cleaned.startswith("git@github.com:"):
        path = cleaned.split(":", 1)[1]
    else:
        parsed = parse.urlparse(cleaned)
        if parsed.netloc.lower() != "github.com":
            raise ValueError(f"Remote is not a GitHub URL: {remote_url}")
        path = parsed.path.lstrip("/")

    parts = [part for part in path.split("/") if part]
    if len(parts) != 2:
        raise ValueError(f"Failed to parse owner/repo from remote: {remote_url}")

    return parts[0], parts[1]


def graphql_request(query: str, variables: dict[str, Any], token: str) -> dict[str, Any]:
    payload = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    req = request.Request(
        url=GITHUB_GRAPHQL_API,
        data=payload,
        method="POST",
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": API_VERSION,
            "Content-Type": "application/json",
        },
    )

    with request.urlopen(req) as response:
        result = json.loads(response.read().decode("utf-8"))

    if "errors" in result:
        raise ValueError(f"GraphQL query failed: {result['errors']}")

    return result


def parse_explicit_issue_reference(body: str) -> list[int]:
    """Parse Issue: #N or Refs: #N patterns from PR body (highest priority)."""
    pattern = re.compile(r"(?im)^\s*(?:Issue|Refs)\s*:\s*#(\d+)")
    issue_numbers: list[int] = []
    for match in pattern.finditer(body):
        num = int(match.group(1))
        if num not in issue_numbers:
            issue_numbers.append(num)
    return issue_numbers


def parse_issue_numbers_from_title(title: str) -> list[int]:
    pattern = re.compile(r"#(\d+)")
    issue_numbers: list[int] = []
    for match in pattern.finditer(title):
        issue_number = int(match.group(1))
        if issue_number not in issue_numbers:
            issue_numbers.append(issue_number)
    return issue_numbers


def parse_issue_numbers_from_branch_names(*branch_names: str) -> list[int]:
    pattern = re.compile(r"(?:^|/|-)feature/(\d+)(?:$|/|-)|(?:^|/|-)(\d+)(?:$|/|-)")
    issue_numbers: list[int] = []

    for branch_name in branch_names:
        if not branch_name:
            continue

        if branch_name.startswith("feature/"):
            feature_match = re.match(r"feature/(\d+)(?:$|-)", branch_name)
            if feature_match:
                issue_number = int(feature_match.group(1))
                if issue_number not in issue_numbers:
                    issue_numbers.append(issue_number)
                continue

        for match in pattern.finditer(branch_name):
            candidate = match.group(1) or match.group(2)
            if not candidate:
                continue
            issue_number = int(candidate)
            if issue_number not in issue_numbers:
                issue_numbers.append(issue_number)

    return issue_numbers


def parse_issue_numbers_from_body(
    body: str,
    owner: str,
    repo: str,
) -> list[int]:
    """Parse Fixes/Closes/Resolves keywords from PR body (lowest priority)."""
    pattern = re.compile(
        r"(?i)\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s*:?\s+"
        r"(?:(?P<owner>[A-Za-z0-9_.-]+)/(?P<repo>[A-Za-z0-9_.-]+))?#(?P<number>\d+)"
    )

    issue_numbers: list[int] = []
    for match in pattern.finditer(body):
        match_owner = match.group("owner")
        match_repo = match.group("repo")

        if match_owner and match_repo:
            if match_owner.lower() != owner.lower() or match_repo.lower() != repo.lower():
                continue

        issue_number = int(match.group("number"))
        if issue_number not in issue_numbers:
            issue_numbers.append(issue_number)

    return issue_numbers


def get_issue_numbers_from_pr(
    owner: str,
    repo: str,
    token: str,
    pr_number: int,
) -> tuple[list[int], str, dict[str, Any]]:
    query = """
    query($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) {
          number
          title
          body
                    headRefName
                    baseRefName
          closingIssuesReferences(first: 20) {
            nodes {
              number
              repository {
                name
                owner {
                  login
                }
              }
            }
          }
        }
      }
    }
    """

    result = graphql_request(
        query=query,
        variables={"owner": owner, "repo": repo, "number": pr_number},
        token=token,
    )

    pr_data = result.get("data", {}).get("repository", {}).get("pullRequest")
    if not pr_data:
        raise ValueError(f"PR #{pr_number} not found in repository {owner}/{repo}")

    body = pr_data.get("body", "") or ""
    title = pr_data.get("title", "") or ""
    head_ref_name = pr_data.get("headRefName", "") or ""
    base_ref_name = pr_data.get("baseRefName", "") or ""

    # Priority 1: Explicit Issue: #N or Refs: #N in PR body
    explicit_numbers = parse_explicit_issue_reference(body)
    if explicit_numbers:
        return explicit_numbers, "explicit-reference", pr_data

    # Priority 2: Issue number in PR title
    title_issue_numbers = parse_issue_numbers_from_title(title)
    if title_issue_numbers:
        return title_issue_numbers, "title", pr_data

    # Priority 3: Issue number inferred from head/base branch names
    branch_issue_numbers = parse_issue_numbers_from_branch_names(head_ref_name, base_ref_name)
    if branch_issue_numbers:
        return branch_issue_numbers, "branch", pr_data

    # Priority 4: closingIssuesReferences from GraphQL
    issue_numbers: list[int] = []
    for node in pr_data.get("closingIssuesReferences", {}).get("nodes", []):
        node_repo = node.get("repository", {})
        node_owner = node_repo.get("owner", {}).get("login", "")
        node_name = node_repo.get("name", "")
        if node_owner.lower() == owner.lower() and node_name.lower() == repo.lower():
            issue_number = node.get("number")
            if isinstance(issue_number, int) and issue_number not in issue_numbers:
                issue_numbers.append(issue_number)

    if issue_numbers:
        return issue_numbers, "closingIssuesReferences", pr_data

    # Priority 5: Fixes/Closes/Resolves keywords in PR body
    body_issue_numbers = parse_issue_numbers_from_body(body, owner, repo)
    if body_issue_numbers:
        return body_issue_numbers, "body", pr_data

    return [], "not-found", pr_data


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Get linked issue numbers for a PR using the GitHub API"
    )
    parser.add_argument("number", type=int, help="PR number")
    parser.add_argument(
        "-r",
        "--repo",
        help="Target repository in owner/repo format; auto-resolved from git origin if omitted",
    )
    parser.add_argument(
        "-t",
        "--token",
        help="GitHub token; falls back to GITHUB_TOKEN env var if omitted",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output full JSON result",
    )
    return parser


def resolve_owner_repo(repo_arg: str | None) -> tuple[str, str]:
    if repo_arg:
        parts = repo_arg.split("/")
        if len(parts) != 2 or not all(parts):
            raise ValueError("--repo format should be owner/repo")
        return parts[0], parts[1]

    return parse_owner_repo(get_git_remote_url())


def main() -> int:
    args = build_parser().parse_args()

    token = args.token or os.getenv("GITHUB_TOKEN")
    if not token:
        print("Error: Missing GitHub token. Provide via --token or GITHUB_TOKEN environment variable", file=sys.stderr)
        return 1

    owner = ""
    repo = ""

    try:
        owner, repo = resolve_owner_repo(args.repo)
        issue_numbers, source, pr_data = get_issue_numbers_from_pr(
            owner=owner,
            repo=repo,
            token=token,
            pr_number=args.number,
        )
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    except error.HTTPError as exc:
        response_body = exc.read().decode("utf-8", errors="replace")
        try:
            parsed_body = json.loads(response_body)
        except json.JSONDecodeError:
            parsed_body = response_body

        if exc.code == 401:
            print("Error: Authentication failed. Check your GitHub token", file=sys.stderr)
        elif exc.code == 403:
            print("Error: Insufficient permissions. Token may lack repo or pull requests read access", file=sys.stderr)
        elif exc.code == 404:
            print(f"Error: Repository {owner}/{repo} or PR #{args.number} not found, or token lacks access", file=sys.stderr)
        else:
            print(f"HTTP error {exc.code}", file=sys.stderr)

        print(parsed_body, file=sys.stderr)
        return 1
    except error.URLError as exc:
        print(f"Error: Failed to connect to GitHub API: {exc.reason}", file=sys.stderr)
        return 1

    output = {
        "repository": f"{owner}/{repo}",
        "pull_request": args.number,
        "title": pr_data.get("title", ""),
        "issue_numbers": issue_numbers,
        "source": source,
    }

    if args.json:
        print(json.dumps(output, indent=2, ensure_ascii=False))
        return 0

    if issue_numbers:
        print(f"PR #{args.number} linked issue numbers: {', '.join(str(number) for number in issue_numbers)}")
        print(f"Repository: {owner}/{repo}")
        print(f"Source: {source}")
    else:
        print(f"No linked issues found for PR #{args.number}")
        print(f"Repository: {owner}/{repo}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
