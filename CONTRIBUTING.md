# Contributing to Scorito Classics 2026

Thank you for considering contributing to Scorito Classics 2026! This document outlines the process for contributing to this project.

## Table of Contents

-   [Code of Conduct](#code-of-conduct)
-   [Getting Started](#getting-started)
-   [Development Workflow](#development-workflow)
-   [Commit Guidelines](#commit-guidelines)
-   [Pull Request Process](#pull-request-process)
-   [Reporting Bugs](#reporting-bugs)
-   [Suggesting Features](#suggesting-features)

## Code of Conduct

Please be respectful and constructive in all interactions. We follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

## Getting Started

1.  **Fork** the repository on GitHub.
2.  **Clone** your fork locally:
    ```bash
    git clone https://github.com/<your-username>/scorito-classics-2026.git
    cd scorito-classics-2026
    ```
3.  Follow the [Installation](README.md#installation) steps in the README to set up your local development environment.

## Development Workflow

1.  Create a **feature branch** from `main`:
    ```bash
    git checkout -b feature/your-feature-name
    ```

2.  Make your changes, keeping them focused and minimal.

3.  **Lint and format** your code:
    ```bash
    pnpm lint
    pnpm format
    ```

4.  **Build** to verify no compilation errors:
    ```bash
    pnpm build
    ```

5.  **Test** your changes (if applicable):
    ```bash
    pnpm test
    ```

## Commit Guidelines

-   Use clear, concise commit messages in the imperative mood (e.g., `Add race filtering`, not `Added race filtering`).
-   Keep commits focused on a single logical change.
-   Reference related issues in commit messages where applicable (e.g., `Fix startlist sync #42`).

## Pull Request Process

1.  Ensure your branch is up-to-date with `main`:
    ```bash
    git fetch origin
    git rebase origin/main
    ```

2.  **Push** your branch and open a Pull Request on GitHub.

3.  Fill in the pull request template, describing:
    -   What changes were made and why
    -   How to test the changes
    -   Any relevant screenshots or output

4.  A maintainer will review your PR. Please be responsive to feedback and make requested changes promptly.

5.  Once approved, your PR will be merged.

## Reporting Bugs

If you find a bug, please [open an issue](https://github.com/JanSparnaaij/scorito-classics-2026/issues/new) with:

-   A clear, descriptive title
-   Steps to reproduce the problem
-   Expected vs. actual behavior
-   Your environment (OS, Node.js version, browser if applicable)
-   Any relevant logs or screenshots

## Suggesting Features

Feature suggestions are welcome! Please [open an issue](https://github.com/JanSparnaaij/scorito-classics-2026/issues/new) and include:

-   A clear description of the feature and its motivation
-   Any examples or mockups that illustrate the idea

---

Built with ❤️ for the Scorito Classics 2026 game 🚴‍♂️
