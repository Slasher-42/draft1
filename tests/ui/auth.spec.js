const { test, expect } = require("@playwright/test");

const BASE_URL = "http://localhost:5173";

const uniqueEmail = () => `user_${Date.now()}@test.com`;

test.describe("Login Flow", () => {
  test("Valid credentials — successful login redirects to dashboard", async ({ page }) => {
    const email = uniqueEmail();

    await page.goto(`${BASE_URL}/register`);
    await page.getByTestId("name-input").fill("Test User");
    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("role-select").selectOption("PATIENT");
    await page.getByTestId("register-button").click();

    await page.goto(`${BASE_URL}/login`);
    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("login-button").click();

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
  });

  test("Invalid credentials — shows error message", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByTestId("email-input").fill("wrong@test.com");
    await page.getByTestId("password-input").fill("wrongpassword");
    await page.getByTestId("login-button").click();

    await expect(page.getByTestId("login-error")).toBeVisible();
  });

  test("Empty form submission — shows error message", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByTestId("login-button").click();

    await expect(page.getByTestId("login-error")).toBeVisible();
  });

  test("Logout — redirects to login page", async ({ page }) => {
    const email = uniqueEmail();

    await page.goto(`${BASE_URL}/register`);
    await page.getByTestId("name-input").fill("Test User");
    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("role-select").selectOption("PATIENT");
    await page.getByTestId("register-button").click();

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

    await page.getByTestId("logout-button").click();

    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});

test.describe("Register Flow", () => {
  test("Valid registration redirects to dashboard", async ({ page }) => {
    const email = uniqueEmail();

    await page.goto(`${BASE_URL}/register`);
    await page.getByTestId("name-input").fill("New User");
    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("role-select").selectOption("PATIENT");
    await page.getByTestId("register-button").click();

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  test("Empty form submission — shows error message", async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.getByTestId("register-button").click();

    await expect(page.getByTestId("register-error")).toBeVisible();
  });

  test("Duplicate email — shows error message", async ({ page }) => {
    const email = uniqueEmail();

    await page.goto(`${BASE_URL}/register`);
    await page.getByTestId("name-input").fill("User One");
    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("role-select").selectOption("PATIENT");
    await page.getByTestId("register-button").click();

    await page.getByTestId("logout-button").click();

    await page.goto(`${BASE_URL}/register`);
    await page.getByTestId("name-input").fill("User Two");
    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("role-select").selectOption("PATIENT");
    await page.getByTestId("register-button").click();

    await expect(page.getByTestId("register-error")).toBeVisible();
  });
});
