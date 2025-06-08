# Work Instruction Prompt

Assume that the `.prd/` folder already contains Task-specific PRD files. Now the AI should perform **feature-based
commits** based on those PRD files.

- For each feature (e.g., signup, login), create a separate branch.
- When a related PRD is attached, perform only that task.
- Within the same feature branch, commit each task as frequently as possible, ideally after every small change.
- After applying each Task’s changes, run pnpm build (or npm run build), resolve all ESLint or compilation errors.

---

## Requirements

1. **Branch Naming**

    - For the “signup” feature:
      ```bash
      git checkout -b feature/signup
      ```
    - For the “login” feature:
      ```bash
      git checkout -b feature/login
      ```

2. **Commit Message Format**

You are a Git commit message writing expert. Use the following input to create a one-line summary using Conventional Commits type format, followed by a list of changes using `-` bullets.

**Input Format (JSON):**
```json
{
  "type": "<feat|fix|chore|docs|refactor|test|perf>",
  "scope": "<optional: scope name>",
  "summary": "<one-line brief summary>",
  "changes": [
    "<first change description>",
    "<second change description>",
    "..."
  ]
}
```

**Output Example:**
feat(auth): Improve login error messages
- Add user-friendly error guidance for 401 responses
- Standardize existing error codes to `ERR_INVALID_CREDENTIALS`

**Granular Commit Guidelines:**
- Commit frequently in small units for each feature (commit at minimum viable functionality)
- Separate commits for UI component creation, state management logic, API integration, etc.
- Even when modifying a single file, divide changes into multiple commits if they're logically separable
- Each commit should be in a testable state

**Granular Commit Guidelines:**
- Commit frequently in small units for each feature (commit at minimum viable functionality)
- Separate commits for UI component creation, state management logic, API integration, etc.
- Even when modifying a single file, divide changes into multiple commits if they're logically separable
- Each commit should be in a testable state

3. **Commit Sequence**
1. Create a feature branch from the main branch (main or develop):
   ```bash
   git checkout -b feature/signup
   ```
1. Stage and commit Task-1 changes (code files and PRD files):
   ```bash
   git add backend/src/models/User.ts
   git add backend/src/migrations/20250606-create-user.ts
   git add .prd/TASK-1-signup-BE.md
   git commit -m "feat(backend): Add user entity and migration
   - Create User.ts model file
   - Add user table migration file
   - Update Task-1 PRD documentation"
   ```
1. Stage and commit Task-2 changes:

   ```bash
   git add src/components/Signup.tsx
   git add src/store/user.ts
   git add .prd/TASK-2-signup-FE.md
   git commit -m "feat(frontend): Implement signup form and Redux slice
   - Create Signup.tsx form component
   - Add Redux Toolkit user slice
   - Update Task-2 PRD documentation"
   ```
