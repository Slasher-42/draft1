const { api, registerUser, loginUser, uniqueEmail } = require("./setup");

describe("Auth — Happy Path", () => {
  test("Register a new user and receive a token", async () => {
    const email = uniqueEmail("patient");
    const res = await registerUser("Test User", email, "password123", "PATIENT");

    expect(res.status).toBe(200);
    expect(res.data.token).toBeDefined();
    expect(res.data.role).toBe("PATIENT");
    expect(res.data.name).toBe("Test User");
  });

  test("Login with valid credentials and receive a token", async () => {
    const email = uniqueEmail("patient");
    await registerUser("Test User", email, "password123", "PATIENT");

    const res = await loginUser(email, "password123");

    expect(res.status).toBe(200);
    expect(res.data.token).toBeDefined();
    expect(res.data.role).toBe("PATIENT");
  });
});

describe("Auth — Negative Cases", () => {
  test("Login with wrong password returns 401", async () => {
    const email = uniqueEmail("patient");
    await registerUser("Test User", email, "password123", "PATIENT");

    const res = await loginUser(email, "wrongpassword");

    expect(res.status).toBe(404);
  });

  test("Login with non-existent email returns 404", async () => {
    const res = await loginUser("nonexistent@test.com", "password123");

    expect(res.status).toBe(404);
  });

  test("Register with missing name returns 400", async () => {
    const res = await api.post("/auth/register", {
      email: uniqueEmail(),
      password: "password123",
      role: "PATIENT",
    });

    expect(res.status).toBe(400);
  });

  test("Register with missing email returns 400", async () => {
    const res = await api.post("/auth/register", {
      name: "Test User",
      password: "password123",
      role: "PATIENT",
    });

    expect(res.status).toBe(400);
  });

  test("Register with missing password returns 400", async () => {
    const res = await api.post("/auth/register", {
      name: "Test User",
      email: uniqueEmail(),
      role: "PATIENT",
    });

    expect(res.status).toBe(400);
  });

  test("Register with duplicate email returns 400", async () => {
    const email = uniqueEmail("dup");
    await registerUser("Test User", email, "password123", "PATIENT");

    const res = await registerUser("Test User", email, "password123", "PATIENT");

    expect(res.status).toBe(400);
  });

  test("Access protected endpoint with no token returns 401", async () => {
    const res = await api.get("/appointments");

    expect(res.status).toBe(401);
  });

  test("Access protected endpoint with invalid token returns 401", async () => {
    const res = await api.get("/appointments", {
      headers: { Authorization: "Bearer invalidtoken" },
    });

    expect(res.status).toBe(401);
  });
});
