import { test, expect } from '@playwright/test';

test.describe('JewelFit 3D E2E Tests', () => {
    test('homepage loads correctly', async ({ page }) => {
        await page.goto('http://localhost:3000');

        await expect(page.locator('h1')).toContainText('JewelFit 3D');
        await expect(page.locator('text=Photo Mode')).toBeVisible();
        await expect(page.locator('text=3D Mode')).toBeVisible();
    });

    test('user can navigate to photo mode', async ({ page }) => {
        await page.goto('http://localhost:3000');

        await page.click('text=Try Photo Mode');
        await expect(page).toHaveURL(/.*photo/);
        await expect(page.locator('h1')).toContainText('Photo Mode');
    });

    test('user can navigate to 3D mode', async ({ page }) => {
        await page.goto('http://localhost:3000');

        await page.click('text=Explore 3D Mode');
        await expect(page).toHaveURL(/.*3d/);
        await expect(page.locator('h1')).toContainText('3D Model Mode');
    });

    test('user can view products', async ({ page }) => {
        await page.goto('http://localhost:3000/products');

        await expect(page.locator('h1')).toContainText('Our Collection');
        // Wait for products to load
        await page.waitForSelector('.card', { timeout: 5000 });
    });

    test('authentication flow works', async ({ page }) => {
        await page.goto('http://localhost:3000/auth/login');

        // Fill login form
        await page.fill('input[type="email"]', 'demo@jewelfit.test');
        await page.fill('input[type="password"]', 'Demo123!');

        // Submit form
        await page.click('button[type="submit"]');

        // Should redirect to homepage
        await expect(page).toHaveURL('http://localhost:3000/');
    });
});
