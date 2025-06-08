# PRD Generation Prompt

When you receive the “Required Features List” below, generate the PRD “Functional Details and Requirements” section in
a **Task-oriented** manner.

- Number each Task as 1, 2, 3, … and number sub-items as `TaskNumber-1`, `TaskNumber-2`, etc.
- Remove any examples and keep only the structure.
- Scan the project root directory to identify which backend (BE) and frontend (FE) files need modification. Based on
  that, extract a list of work items and create one PRD file per Task.
- Save all generated PRD files under the `.prd/${TaskName}` folder in Markdown format.
- When JSON data is required, include it inside a fenced code block.
- IMPORTANT!! Do not modify any code; the purpose is only to produce PRD documents, so do not include any commit or
  branch
  instructions.

---

## Input Format

[Required Features List]

## (If there are additional features, continue listing them)

## Requirements

1. **Analyze Project Structure**
    - **Identify BE/FE Roots**
        - Before searching, define a list of candidate backend root directories (e.g., `/backend`, `/server`, `/api`)
          and candidate frontend root directories (e.g., `/frontend`, `/client`, `/web`).
        - Verify which of these directories actually exist and determine the “backend project root” and “frontend
          project root.”

    - **Feature Keyword–Based Module Exploration**
        - Extract each feature name listed in the “Required Features List” (e.g., “User Signup,” “Payment Processing,”
          “Dashboard creation”).
        - Within the backend directory, locate directories or files that match or are related to the feature name (for
          example, controllers, services, routes).
            - Example patterns: `controllers/<featureName>`, `services/<featureName>`, `routes/<featureName>.ts`, etc.
        - Within the frontend directory, similarly search for components, pages, or state management (store or slice)
          files using the same keyword.
            - Example patterns: `components/<FeatureName>`, `pages/<featureName>.tsx`, `store/<featureName>.ts`, etc.

    - **Identify Relationships and Determine Scope of Changes**
        - Compare the discovered backend modules (controllers, services, routes, etc.) with the frontend modules (
          components, stores, etc.) to select which files actually need modification to implement the requested feature.
        - Ensure that for each feature, the required changes in both BE and FE are isolated into minimal, independent
          units.
        - For example, for the “Payment Processing” feature:
            - **BE:** `/backend/controllers/payment.ts`, `/backend/services/paymentService.ts`,
              `/backend/routes/payment.ts`
            - **FE:** `/frontend/components/PaymentForm.tsx`, `/frontend/store/paymentSlice.ts`
        - Use these identified files as the basis for constructing individual Tasks.

2. **Extract Tasks and Define Order**

    - Treat each feature (e.g., “Implement Signup”) as an independent unit and split BE/FE modification points into
      individual Tasks.
    - **Each Task must be independently implementable.** In other words, design every Task so that it can be fully
      implemented without requiring simultaneous changes in other Tasks on either the server (BE) or client (FE).
    - Number Tasks sequentially.
    - Structure (adjust according to actual project files):

        1. Task 1: [Signup – BE]  
           1-1. Core functionality list  
           1-2. BE requirements  
           1-2-1. Define User entity and database migration  
           1-2-2. Implement signup API endpoint (`POST /api/v1/users/signup`)  
           1-2-3. Password hashing (e.g., bcrypt) and input validation  
           1-2-4. **Specify data structures and communication methods for BE–FE**
            - Present the request/response JSON schema in a code block
            - If needed, describe headers, authentication mechanisms, and transport protocol (e.g., REST, GraphQL) in
              detail  
              1-3. API specification  
              1-3-1. Endpoint: `POST /api/v1/users/signup`  
              1-3-2. Request parameters:

           ```json
           { "email": "string", "password": "string", "name": "string" }
           ```

           1-3-3. Response format:

           ```json
           { "userId": "string", "createdAt": "string" }
           ```

           1-3-4. Error cases and codes

        2. Task 2: [Signup – FE]  
           2-1. Core functionality list  
           2-2. Frontend requirements  
           2-2-1. UI/component structure: `Signup.tsx` (email, password, name fields)  
           2-2-2. State management and data binding: Redux Toolkit slice (`store/user.ts`) for signup state  
           2-2-3. Interaction flow: fill form → call API (using axios) → redirect to login on success  
           2-2-4. Style/design guidelines: use Material-UI or Styled Components for validation, button states  
           2-2-5. **Specify data structures and communication methods for BE–FE**
            - Define TypeScript interfaces that map to the JSON schema provided by the BE
            - Show an axios request example alongside explanation of request/response handling  
              2-3. API specification  
              2-3-1. Endpoint: `POST /api/v1/users/signup`  
              2-3-2. Request parameters:

           ```json
           { "email": "string", "password": "string", "name": "string" }
           ```

           2-3-3. Response format:

           ```json
           { "userId": "string", "createdAt": "string" }
           ```

           2-3-4. Error cases and codes

        3. Task 3: [Login – BE]  
           3-1. Core functionality list  
           3-2. BE requirements  
           3-2-1. Implement login API endpoint (`POST /api/v1/users/login`)  
           3-2-2. Issue JWT token and set an HttpOnly cookie  
           3-2-3. Input validation and error handling  
           3-2-4. **Specify data structures and communication methods for BE–FE**
            - Present login request/response JSON schema
            - Describe token storage strategy (cookie vs. localStorage) and corresponding BE configuration  
              3-3. API specification  
              3-3-1. Endpoint: `POST /api/v1/users/login`  
              3-3-2. Request parameters:

           ```json
           { "email": "string", "password": "string" }
           ```

           3-3-3. Response format:

           ```json
           { "accessToken": "string", "expiresIn": "number" }
           ```

           3-3-4. Error cases and codes

        4. Task 4: [Login – FE]  
           4-1. Core functionality list  
           4-2. Frontend requirements  
           4-2-1. UI/component structure: `Login.tsx` (email, password fields, login button)  
           4-2-2. State management and data binding: Redux Toolkit slice (`store/auth.ts`) for storing accessToken  
           4-2-3. Interaction flow: fill form → call API (using axios) → store token in localStorage → redirect to main
           page  
           4-2-4. Style/design guidelines: use Material-UI or Styled Components for error messages and loading spinner  
           4-2-5. **Specify data structures and communication methods for BE–FE**
            - Define frontend types/interfaces that match the BE’s JSON schema
            - Show an axios request example and explain token storage/refresh logic  
              4-3. API specification  
              4-3-1. Endpoint: `POST /api/v1/users/login`  
              4-3-2. Request parameters:

           ```json
           { "email": "string", "password": "string" }
           ```

           4-3-3. Response format:

           ```json
           { "accessToken": "string", "expiresIn": "number" }
           ```

           4-3-4. Error cases and codes

    - Adjust details based on actual file paths and code context.

3. **Save Files under `.prd/${TaskName}/`**

    - Create one Markdown file per Task.
        - Example:
            - `.prd/TASK-1-Signup-BE.md`
            - `.prd/TASK-2-Signup-FE.md`
            - `.prd/TASK-3-Login-BE.md`
            - `.prd/TASK-4-Login-FE.md`
    - Preserve the numbering and sub-item structure exactly as shown above.

4. **Final Output Format**

    - Without including any commit or branch instructions, return a JSON array listing all generated Markdown file paths
      under `.prd/`.
    - Example:

      ```json
      [
        ".prd/TASK-1-Signup-BE.md",
        ".prd/TASK-2-Signup-FE.md",
        ".prd/TASK-3-Login-BE.md",
        ".prd/TASK-4-Login-FE.md"
      ]
      ```