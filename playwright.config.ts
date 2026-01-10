import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Testing Configuration
 * Tests the complete user journey: Upload CV → Cart → Checkout → Payment → Analysis
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Test timeout
  timeout: 60 * 1000, // 60 seconds per test
  expect: {
    timeout: 10 * 1000 // 10 seconds for assertions
  },

  // Run tests in parallel
  fullyParallel: false, // Sequential for DB consistency
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Number of parallel workers
  workers: process.env.CI ? 1 : 1,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['list']
  ],

  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3000',
    
    // Collect trace on first retry
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
