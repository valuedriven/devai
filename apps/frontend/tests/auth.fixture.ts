import { test as base, Page } from '@playwright/test';
import { clerk } from '@clerk/testing/playwright';

type AuthFixtures = {
  loginAs: (email: string) => Promise<Page>;
};

export const test = base.extend<AuthFixtures>({
  loginAs: async ({ page }, use) => {
    const loginFn = async (email: string) => {
      await page.goto('/');
      await clerk.signIn({
        page,
        emailAddress: email,
      });
      return page;
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(loginFn);
  },
});

export { expect } from '@playwright/test';
