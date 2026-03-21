#!/usr/bin/env python3
"""
Fetch a GitHub issue's title and body using the REST API.

Output format: structured text suitable for passing as a prompt to Copilot CLI.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from typing import Any
from urllib import error, parse, request


API_VERSION = "2022-11-28"
GITHUB_API_BASE = "https://api.github.com"


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


def github_get(url: str, token: str) -> Any:
    req = request.Request(
        url=url,
        method="GET",
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": API_VERSION,
        },
    )
    with request.urlopen(req) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_issue(
    owner: str,
    repo: str,
    issue_number: int,
    token: str,
) -> dict[str, Any]:
    issue = github_get(
        f"{GITHUB_API_BASE}/repos/{owner}/{repo}/issues/{issue_number}",
        token,
    )

    return {
        "number": issue.get("number"),
        "title": issue.get("title", ""),
        "body": issue.get("body", "") or "",
    }


def format_as_prompt(data: dict[str, Any]) -> str:
    lines = [
        f"Issue number: {data['number']}",
        f"Issue title: {data['title']}",
        "",
        "Issue body:",
        data["body"],
    ]

    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Fetch a GitHub issue's title, body, and comments"
    )
    parser.add_argument("number", type=int, help="Issue number")
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
        help="Output as JSON instead of formatted text",
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

    try:
        owner, repo = resolve_owner_repo(args.repo)
        data = fetch_issue(
            owner=owner,
            repo=repo,
            issue_number=args.number,
            token=token,
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
        elif exc.code == 404:
            print(f"Error: Issue #{args.number} not found or token lacks access", file=sys.stderr)
        else:
            print(f"HTTP error {exc.code}", file=sys.stderr)
        print(parsed_body, file=sys.stderr)
        return 1
    except error.URLError as exc:
        print(f"Error: Failed to connect to GitHub API: {exc.reason}", file=sys.stderr)
        return 1

    if args.json:
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(format_as_prompt(data))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
