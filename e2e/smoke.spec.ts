import { test, expect } from '@playwright/test'

function randEmail() {
  const id = Math.random().toString(36).slice(2, 10)
  return `user_${id}@example.com`
}

test('signup -> create escrow (smoke)', async ({ page }) => {
  const email = randEmail()
  const password = 'Password123!'

  // Sign up
  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign Up' }).click()
  await page.getByLabel('Full Name').fill('Test User')
  await page.getByLabel('Email Address').fill(email)
  await page.locator('#password').fill(password)
  await page.locator('#confirmPassword').fill(password)
  await page.getByRole('button', { name: /create account/i }).click()

  // Redirects to home after signup
  await page.waitForURL('/')
  await expect(page.getByText('Escrow Platform')).toBeVisible()

  // Go to create escrow
  await page.goto('/create')
  await expect(page.getByText('Create Escrow')).toBeVisible()

  // Step 1
  await page.getByLabel(/escrow title/i).fill('E2E Smoke Escrow')
  await page.getByLabel(/escrow type/i).selectOption('one-time')
  await page.getByRole('button', { name: /next/i }).click()

  // Step 2 (Parties)
  const payee = `0x${'1'.repeat(40)}`
  await page.locator('#payeeAddress').fill(payee)
  await page.getByRole('button', { name: /next/i }).click()

  // Step 3 (Payment)
  await page.locator('#amount').fill('1')
  await page.getByRole('button', { name: /next/i }).click()

  // Step 4 (Release)
  await page.locator('input[name="releaseCondition"][value="manual"]').check()
  await page.getByRole('button', { name: /next/i }).click()

  // Step 5 (Work)
  await page.locator('#description').fill('Deliver E2E smoke test work')
  await page.getByRole('button', { name: /next/i }).click()

  // Step 6 (Dispute)
  await page.getByRole('button', { name: /next/i }).click()

  // Step 7 (Review)
  await page.getByText(/i agree to the escrow terms and conditions/i).click()
  await page.getByRole('button', { name: /create escrow/i }).click()

  // Should end up on details page
  await page.waitForURL(/\/escrows\/.+/)
  await expect(page.getByText(/escrow details/i)).toBeVisible()
})


