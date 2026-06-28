## 1. Backend Integration & Tests

- [x] 1.1 Verify and expand backend controller tests for public products and categories endpoints (happy/sad paths)
- [x] 1.2 Run backend unit/integration tests to ensure coverage is >= 80%

## 2. Frontend Catalog Integration & UI

- [x] 2.1 Enhance shop home page (`(shop)/page.tsx`) to support search and category filters linked to backend query params
- [x] 2.2 Add "Out of stock" badge on product cards when stock equals 0 using design system CSS classes
- [x] 2.3 Verify page loading, responsiveness, and proper styling on mobile and desktop layout

## 3. End-to-End Testing

- [x] 3.1 Create Playwright E2E test plan for guest catalog browsing using `.agents/prompts/playwright-test-planner.md`
- [x] 3.2 Generate and run Playwright E2E tests using `.agents/prompts/playwright-test-generator.md`

## 4. Quality Gates & Verification

- [x] 4.1 Run linter in frontend and backend workspaces (`npm run lint`)
- [x] 4.2 Run unit, integration, and E2E test suites (`npm run test`)
