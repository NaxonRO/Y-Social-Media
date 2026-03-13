# Contributing to Y-Social-Media

Thank you for contributing! Please follow the guidelines below to keep the project stable.

## Branch protection rules

The `main` branch is **protected**:
- Direct pushes to `main` are **blocked**.
- All changes must come through a **Pull Request** (PR).
- Every PR requires **at least 1 approving review** before it can be merged.
- The PR must be up to date with `main` before merging.

## Workflow for contributors

1. **Create a new branch** from the latest `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit them with clear messages:
   ```bash
   git add .
   git commit -m "feat: describe what you did"
   ```

3. **Push your branch** to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a Pull Request** on GitHub:
   - Go to the repository on GitHub.
   - Click **Compare & pull request**.
   - Fill in the PR template (description, type of change, checklist).
   - Request a review from a team member.

5. **Wait for approval** — at least one reviewer must approve before merging.

6. **Merge** the PR once approved (squash & merge is preferred).

## Branch naming conventions

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<name>` | `feature/user-auth` |
| Bug fix | `fix/<name>` | `fix/login-crash` |
| Hotfix | `hotfix/<name>` | `hotfix/typo-in-readme` |
| Refactor | `refactor/<name>` | `refactor/db-queries` |

## One-time admin setup (repository owner only)

The `setup-branch-protection` workflow applies branch protection rules automatically,
but it requires a Personal Access Token (PAT) stored as a repository secret:

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**.
2. Click **Generate new token (classic)**, give it a descriptive name (e.g. `branch-protection-token`),
   and select the **`repo`** scope.
3. Copy the generated token.
4. In *this* repository: **Settings → Secrets and variables → Actions → New repository secret**.
   - **Name:** `ADMIN_TOKEN`
   - **Value:** paste the token from step 3.
5. Go to the **Actions** tab, select **Setup Branch Protection**, and click **Run workflow**.

After the workflow succeeds, the `main` branch will be protected automatically on every merge.

## Questions?

Open an issue or reach out to [@NaxonRO](https://github.com/NaxonRO).
