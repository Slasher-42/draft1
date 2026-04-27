const { test, expect } = require("@playwright/test");

const BASE_URL = "http://localhost:5173";

const uniqueEmail = () => `user_${Date.now()}@test.com`;

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const dayAfterTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
};

const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

const registerAndLogin = async (page, role = "PATIENT") => {
  const email = uniqueEmail();
  await page.goto(`${BASE_URL}/register`);
  await page.getByTestId("name-input").fill("Test User");
  await page.getByTestId("email-input").fill(email);
  await page.getByTestId("password-input").fill("password123");
  await page.getByTestId("role-select").selectOption(role);
  await page.getByTestId("register-button").click();
  await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  return email;
};

test.describe("Create Appointment", () => {
  test("Fill and submit form — booking appears in dashboard", async ({ page }) => {
    await registerAndLogin(page);

    await page.getByTestId("create-appointment-button").click();
    await expect(page).toHaveURL(`${BASE_URL}/appointments/new`);

    await page.getByTestId("doctor-input").fill("Dr. Smith");
    await page.getByTestId("reason-input").fill("Annual checkup");
    await page.getByTestId("date-input").fill(tomorrow());
    await page.getByTestId("submit-button").click();

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.getByTestId("appointments-table")).toBeVisible();

    const rows = page.locator("[data-testid^='appointment-row-']");
    await expect(rows).toHaveCount(1);
  });

  test("Empty form submission — shows error", async ({ page }) => {
    await registerAndLogin(page);

    await page.getByTestId("create-appointment-button").click();
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("form-error")).toBeVisible();
  });

  test("Past date — shows error", async ({ page }) => {
    await registerAndLogin(page);

    await page.getByTestId("create-appointment-button").click();
    await page.getByTestId("doctor-input").fill("Dr. Smith");
    await page.getByTestId("reason-input").fill("Checkup");
    await page.getByTestId("date-input").fill(yesterday());
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("form-error")).toBeVisible();
  });
});

test.describe("Update Appointment", () => {
  test("Edit appointment — change is reflected in dashboard", async ({ page }) => {
    await registerAndLogin(page);

    await page.getByTestId("create-appointment-button").click();
    await page.getByTestId("doctor-input").fill("Dr. Smith");
    await page.getByTestId("reason-input").fill("Checkup");
    await page.getByTestId("date-input").fill(tomorrow());
    await page.getByTestId("submit-button").click();

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

    const editButton = page.locator("[data-testid^='edit-button-']").first();
    await editButton.click();

    await page.getByTestId("doctor-input").clear();
    await page.getByTestId("doctor-input").fill("Dr. Jones");
    await page.getByTestId("reason-input").clear();
    await page.getByTestId("reason-input").fill("Follow-up");
    await page.getByTestId("date-input").fill(dayAfterTomorrow());
    await page.getByTestId("submit-button").click();

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.locator("text=Dr. Jones")).toBeVisible();
  });
});

test.describe("Cancel Appointment", () => {
  test("Cancel appointment — status updates in dashboard", async ({ page }) => {
    await registerAndLogin(page);

    await page.getByTestId("create-appointment-button").click();
    await page.getByTestId("doctor-input").fill("Dr. Smith");
    await page.getByTestId("reason-input").fill("Checkup");
    await page.getByTestId("date-input").fill(tomorrow());
    await page.getByTestId("submit-button").click();

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

    const cancelButton = page.locator("[data-testid^='cancel-button-']").first();
    await cancelButton.click();

    const statusCell = page.locator("[data-testid^='status-']").first();
    await expect(statusCell).toHaveText("CANCELLED");
  });
});

test.describe("Queue Page", () => {
  test("Staff can see today's queue", async ({ page }) => {
    const patientEmail = uniqueEmail();
    await page.goto(`${BASE_URL}/register`);
    await page.getByTestId("name-input").fill("Patient User");
    await page.getByTestId("email-input").fill(patientEmail);
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("role-select").selectOption("PATIENT");
    await page.getByTestId("register-button").click();

    const today = new Date().toISOString().split("T")[0];
    await page.getByTestId("create-appointment-button").click();
    await page.getByTestId("doctor-input").fill("Dr. Smith");
    await page.getByTestId("reason-input").fill("Checkup");
    await page.getByTestId("date-input").fill(today);
    await page.getByTestId("submit-button").click();

    await page.getByTestId("logout-button").click();

    await registerAndLogin(page, "STAFF");

    await page.getByTestId("queue-link").click();
    await expect(page).toHaveURL(`${BASE_URL}/queue`);
    await expect(page.getByTestId("queue-table")).toBeVisible();
  });

  test("Staff can mark patient as served", async ({ page }) => {
    const patientEmail = uniqueEmail();
    await page.goto(`${BASE_URL}/register`);
    await page.getByTestId("name-input").fill("Patient User");
    await page.getByTestId("email-input").fill(patientEmail);
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("role-select").selectOption("PATIENT");
    await page.getByTestId("register-button").click();

    const today = new Date().toISOString().split("T")[0];
    await page.getByTestId("create-appointment-button").click();
    await page.getByTestId("doctor-input").fill("Dr. Smith");
    await page.getByTestId("reason-input").fill("Checkup");
    await page.getByTestId("date-input").fill(today);
    await page.getByTestId("submit-button").click();

    await page.getByTestId("logout-button").click();

    await registerAndLogin(page, "STAFF");

    await page.getByTestId("queue-link").click();

    const serveButton = page.locator("[data-testid^='serve-button-']").first();
    await serveButton.click();

    const serveStatus = page.locator("[data-testid^='serve-status-']").first();
    await expect(serveStatus).toHaveText("SERVED");
  });
});
