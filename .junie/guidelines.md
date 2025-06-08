# Project Guidelines
## Documentation
- Use Markdown for all documentation: Ensure all documentation is written in Markdown for consistency and readability.
- Follow clean documentation principles: Keep documentation concise, clear, and well-structured.
- Prefer clear, concise language: Avoid jargon and overly technical terms unless necessary.
- Write comprehensive explanations for functions, classes, and modules: Include detailed descriptions of what each component does, its props, and usage examples.
- Provide examples for complex concepts: Show how to use components in real-world scenarios.
- Write in Korean but keep technical terms in their original English form.

## Code Style and Structure
- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.
- Never use the 'any' type in TypeScript - use proper typing.
- Prefer arrow functions for component and function definitions.
- Follow the project's code style and conventions.
- Maintain consistent naming conventions across the codebase.

## Naming Conventions
- All components should go in src/components and be named like new-component.tsx
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.
- Each React component should be in its own directory with PascalCase naming (e.g., Button, TextField)

## TypeScript Usage
- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.
- Define proper TypeScript interfaces for component props.

## Syntax and Formatting
- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.

## Performance Optimization
- Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC).
- Wrap client components in Suspense with fallback.
- Use dynamic loading for non-critical components.
- Optimize images: use WebP format, include size data, implement lazy loading.

## Components Organization
Within the /src/components folder, consider organizing components by type or feature:

By Type: Group components like forms, buttons, layout elements, etc.

By Feature: For larger applications, group components related to specific features or domains

For example:
```
/src/components
├── /ui
│   ├── /Button
│   ├── /Modal
│   └── /Card
├── /forms
│   ├── /TextField
│   └── /Select
└── /layout
    ├── /Navbar
    └── /Footer
```

- Private Components: For components used only within specific pages, you can create a _components folder within the relevant /app subdirectory.
- Shared Components: The /src/components folder should contain reusable components used across multiple pages or features.
- Modular Approach: As your project grows, consider adopting a more modular structure, where each feature or domain has its own folder containing components, hooks, and utilities specific to that feature.

## Best Practices
- Create reusable helper functions for common transformation patterns
- Handle edge cases and optional properties gracefully
- Add descriptive comments for complex transformations
- Consider performance implications for deeply nested components
- Ensure type safety throughout the transformation process

## Using the Think Tool
Before taking any action or responding to the user after receiving tool results, use the think tool as a scratchpad to:
- List the specific rules that apply to the current request
- Check if all required information is collected
- Verify that the planned action complies with all policies
- Iterate over tool results for correctness

Here are some examples of what to iterate over inside the think tool:

Example 1:
```
User wants to cancel flight ABC123
- Need to verify: user ID, reservation ID, reason
- Check cancellation rules:
  * Is it within 24h of booking?
  * If not, check ticket class and insurance
- Verify no segments flown or are in the past
- Plan: collect missing info, verify rules, get confirmation
```

Example 2:
```
User wants to book 3 tickets to NYC with 2 checked bags each
- Need user ID to check:
  * Membership tier for baggage allowance
  * Which payments methods exist in profile
- Baggage calculation:
  * Economy class × 3 passengers
  * If regular member: 1 free bag each → 3 extra bags = $150
  * If silver member: 2 free bags each → 0 extra bags = $0
  * If gold member: 3 free bags each → 0 extra bags = $0
- Payment rules to verify:
  * Max 1 travel certificate, 1 credit card, 3 gift cards
  * All payment methods must be in profile
  * Travel certificate remainder goes to waste
- Plan:
1. Get user ID
2. Verify membership level for bag fees
3. Check which payment methods in profile and if their combination is allowed
4. Calculate total: ticket price + any bag fees
5. Get explicit confirmation for booking
```
