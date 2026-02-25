# Contributing to Aeternum

Thanks for considering contributing to Aeternum — the permanent, private, verifiable evidence vault.

This guide outlines how to contribute effectively.

## About the project

Aeternum is a zero-knowledge, blockchain-timestamped evidence vault: client-side encrypted storage (Arweave, optional IPFS) with Groth16 ZK proofs and immutable records on Base.

- Read the [README](README.md) for an overview and quick start.
- Contracts and ZK: see `packages/hardhat/README.md`.
- Frontend: see `packages/nextjs/`.

## How to contribute

- Report bugs or suggest features (open an issue).
- Fix open issues or improve docs.
- Follow existing code style and the project’s commit conventions.

**Guidelines**

- Search existing issues and PRs before opening a new one.
- One PR per concern (fix/add one thing, or style-only, not both).
- When reporting bugs: describe what you did, what you expected, and how to reproduce.
- Use the project’s Prettier/lint config; format before committing.
- Update README or relevant docs if you change behavior or setup.

## Issues

Use issues to report bugs, request features, or discuss changes before coding.

- **Picking up work:** Check open issues; comment if you’re working on one to avoid duplicate work.
- **Opening an issue:** Include context, steps to reproduce (for bugs), or rationale (for features). Screenshots or logs help.

## Pull requests

We use a fork-and-pull workflow:

1. Fork the repo and clone your fork.
2. Create a branch from the default branch (e.g. `main` or `temp`) with a clear name.
3. Make your changes, commit with a descriptive message.
4. Push to your fork and open a PR against the upstream branch.

**Commit messages**

Use a short prefix so history stays clear, for example:

- `[fix]: ...` — bug fix  
- `[feat]: ...` or `[update]: ...` — new or changed behavior  
- `[docs]: ...` — documentation only  
- `[chore]: ...` — tooling, config, or maintenance  

**PR quality**

- Title and description should clearly describe the change.
- Link any related issue.
- Keep the diff focused; avoid unrelated edits.

Maintainers may request changes or ask questions. Once approved, your PR will be merged (merge strategy may vary; we prefer keeping history clear when possible).

## Questions

Open an issue with the “question” or “discussion” label, or reach out to the maintainers as indicated in the repo.
