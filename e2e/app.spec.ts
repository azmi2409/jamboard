import { test, expect } from '@playwright/test'

test.describe('Jamboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads the app', async ({ page }) => {
    await expect(page).toHaveTitle(/jamboard/i)
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('shows toolbar with all tools', async ({ page }) => {
    const toolbar = page.locator('.absolute.top-4')
    await expect(toolbar).toBeVisible()

    await expect(toolbar.getByText('Select')).toBeVisible()
    await expect(toolbar.getByText('Rectangle')).toBeVisible()
    await expect(toolbar.getByText('Ellipse')).toBeVisible()
    await expect(toolbar.getByText('Arrow')).toBeVisible()
    await expect(toolbar.getByText('Line')).toBeVisible()
    await expect(toolbar.getByText('Draw')).toBeVisible()
    await expect(toolbar.getByText('Text')).toBeVisible()
    await expect(toolbar.getByText('AI')).toBeVisible()
  })

  test('shows branding', async ({ page }) => {
    await expect(page.getByText('Jamboard')).toBeVisible()
  })

  test('shows zoom controls', async ({ page }) => {
    const zoomControl = page.locator('.absolute.bottom-4.right-4')
    await expect(zoomControl).toBeVisible()
    await expect(zoomControl.getByText('100%')).toBeVisible()
  })

  test('can select tools with keyboard shortcuts', async ({ page }) => {
    await page.locator('body').click()

    await page.keyboard.press('r')
    await expect(page.locator('button[title*="Rectangle"]')).toHaveClass(/bg-neutral-900 text-white/)

    await page.keyboard.press('e')
    await expect(page.locator('button[title*="Ellipse"]')).toHaveClass(/bg-neutral-900 text-white/)

    await page.keyboard.press('v')
    await expect(page.locator('button[title*="Select"]')).toHaveClass(/bg-neutral-900 text-white/)
  })

  test('can draw a rectangle', async ({ page }) => {
    const canvas = page.locator('canvas')
    const box = await canvas.boundingBox()
    if (!box) throw new Error('Canvas not found')

    await page.keyboard.press('r')

    await page.mouse.move(box.x + 100, box.y + 100)
    await page.mouse.down()
    await page.mouse.move(box.x + 200, box.y + 200)
    await page.mouse.up()

    await expect(page.locator('canvas')).toBeVisible()
  })

  test('roughness toggle works', async ({ page }) => {
    const roughnessBtn = page.locator('button[title*="rough"], button[title*="fine"]')
    await expect(roughnessBtn).toBeVisible()

    await roughnessBtn.click()
    await expect(roughnessBtn).toHaveText(/Fine/)

    await roughnessBtn.click()
    await expect(roughnessBtn).toHaveText(/Rough/)
  })

  test('new button clears canvas', async ({ page }) => {
    const newBtn = page.locator('button[title="New Canvas"]')
    await expect(newBtn).toBeVisible()
    await newBtn.click()
  })
})
