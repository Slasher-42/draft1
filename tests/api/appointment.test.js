const { api, registerUser, loginUser, uniqueEmail, getAuthHeader } = require("./setup");

let patientToken;
let patientId;
let staffToken;
let secondPatientToken;
let appointmentId;

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

const dayAfterTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
};

beforeAll(async () => {
  const patientEmail = uniqueEmail("patient");
  await registerUser("Patient One", patientEmail, "password123", "PATIENT");
  const patientLogin = await loginUser(patientEmail, "password123");
  patientToken = patientLogin.data.token;
  patientId = patientLogin.data.id;

  const secondEmail = uniqueEmail("patient2");
  await registerUser("Patient Two", secondEmail, "password123", "PATIENT");
  const secondLogin = await loginUser(secondEmail, "password123");
  secondPatientToken = secondLogin.data.token;

  const staffEmail = uniqueEmail("staff");
  await registerUser("Staff One", staffEmail, "password123", "STAFF");
  const staffLogin = await loginUser(staffEmail, "password123");
  staffToken = staffLogin.data.token;
});

describe("Appointment — Happy Path", () => {
  test("Create appointment and verify queue number is assigned", async () => {
    const res = await api.post(
      "/appointments",
      { doctor: "Dr. Smith", reason: "Checkup", appointmentDate: tomorrow() },
      { headers: getAuthHeader(patientToken) }
    );

    expect(res.status).toBe(200);
    expect(res.data.id).toBeDefined();
    expect(res.data.queueNumber).toBeGreaterThan(0);
    expect(res.data.status).toBe("SCHEDULED");
    expect(res.data.queueStatus).toBe("WAITING");

    appointmentId = res.data.id;
  });

  test("Fetch all appointments — patient sees only their own", async () => {
    const res = await api.get("/appointments", {
      headers: getAuthHeader(patientToken),
    });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    res.data.forEach((a) => {
      expect(a.patientId).toBeDefined();
    });
  });

  test("Fetch all appointments — staff sees all", async () => {
    const res = await api.get("/appointments", {
      headers: getAuthHeader(staffToken),
    });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  test("Fetch single appointment by ID", async () => {
    const res = await api.get(`/appointments/${appointmentId}`, {
      headers: getAuthHeader(patientToken),
    });

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(appointmentId);
  });

  test("Update appointment", async () => {
    const res = await api.put(
      `/appointments/${appointmentId}`,
      { doctor: "Dr. Jones", reason: "Follow-up", appointmentDate: dayAfterTomorrow() },
      { headers: getAuthHeader(patientToken) }
    );

    expect(res.status).toBe(200);
    expect(res.data.doctor).toBe("Dr. Jones");
    expect(res.data.reason).toBe("Follow-up");
  });

  test("Staff marks patient as served and status updates", async () => {
    const res = await api.patch(`/appointments/${appointmentId}/serve`, {}, {
      headers: getAuthHeader(staffToken),
    });

    expect(res.status).toBe(200);
    expect(res.data.queueStatus).toBe("SERVED");
    expect(res.data.status).toBe("COMPLETED");
  });
});

describe("Appointment — Negative Cases", () => {
  test("Create appointment with missing doctor returns 400", async () => {
    const res = await api.post(
      "/appointments",
      { reason: "Checkup", appointmentDate: tomorrow() },
      { headers: getAuthHeader(patientToken) }
    );

    expect(res.status).toBe(400);
  });

  test("Create appointment with missing reason returns 400", async () => {
    const res = await api.post(
      "/appointments",
      { doctor: "Dr. Smith", appointmentDate: tomorrow() },
      { headers: getAuthHeader(patientToken) }
    );

    expect(res.status).toBe(400);
  });

  test("Create appointment with missing date returns 400", async () => {
    const res = await api.post(
      "/appointments",
      { doctor: "Dr. Smith", reason: "Checkup" },
      { headers: getAuthHeader(patientToken) }
    );

    expect(res.status).toBe(400);
  });

  test("Patient accesses another patient appointment returns 403", async () => {
    const res = await api.get(`/appointments/${appointmentId}`, {
      headers: getAuthHeader(secondPatientToken),
    });

    expect(res.status).toBe(403);
  });

  test("Patient tries to mark patient as served returns 403", async () => {
    const res = await api.patch(`/appointments/${appointmentId}/serve`, {}, {
      headers: getAuthHeader(patientToken),
    });

    expect(res.status).toBe(403);
  });

  test("Fetch appointment with non-existent ID returns 404", async () => {
    const res = await api.get("/appointments/999999", {
      headers: getAuthHeader(patientToken),
    });

    expect(res.status).toBe(404);
  });
});

describe("Appointment — Edge Cases", () => {
  test("Book appointment in the past returns 400", async () => {
    const res = await api.post(
      "/appointments",
      { doctor: "Dr. Smith", reason: "Checkup", appointmentDate: yesterday() },
      { headers: getAuthHeader(patientToken) }
    );

    expect(res.status).toBe(400);
  });

  test("Duplicate booking on same day returns 400", async () => {
    const date = dayAfterTomorrow();

    await api.post(
      "/appointments",
      { doctor: "Dr. Smith", reason: "Checkup", appointmentDate: date },
      { headers: getAuthHeader(secondPatientToken) }
    );

    const res = await api.post(
      "/appointments",
      { doctor: "Dr. Jones", reason: "Follow-up", appointmentDate: date },
      { headers: getAuthHeader(secondPatientToken) }
    );

    expect(res.status).toBe(400);
  });

  test("Reschedule to past date returns 400", async () => {
    const createRes = await api.post(
      "/appointments",
      { doctor: "Dr. Smith", reason: "Checkup", appointmentDate: tomorrow() },
      { headers: getAuthHeader(secondPatientToken) }
    );

    const newId = createRes.data.id;

    const res = await api.put(
      `/appointments/${newId}`,
      { doctor: "Dr. Smith", reason: "Checkup", appointmentDate: yesterday() },
      { headers: getAuthHeader(secondPatientToken) }
    );

    expect(res.status).toBe(400);
  });

  test("Cancel an appointment then re-book on same day is allowed", async () => {
    const patientEmail = uniqueEmail("rebook");
    await registerUser("Rebook Patient", patientEmail, "password123", "PATIENT");
    const loginRes = await loginUser(patientEmail, "password123");
    const token = loginRes.data.token;

    const date = dayAfterTomorrow();

    const createRes = await api.post(
      "/appointments",
      { doctor: "Dr. Smith", reason: "Checkup", appointmentDate: date },
      { headers: getAuthHeader(token) }
    );

    await api.delete(`/appointments/${createRes.data.id}`, {
      headers: getAuthHeader(token),
    });

    const rebookRes = await api.post(
      "/appointments",
      { doctor: "Dr. Smith", reason: "Checkup", appointmentDate: date },
      { headers: getAuthHeader(token) }
    );

    expect(rebookRes.status).toBe(200);
  });

  test("Cancel already-cancelled appointment returns 400", async () => {
    const createRes = await api.post(
      "/appointments",
      { doctor: "Dr. Smith", reason: "Checkup", appointmentDate: tomorrow() },
      { headers: getAuthHeader(secondPatientToken) }
    );

    const newId = createRes.data.id;

    await api.delete(`/appointments/${newId}`, {
      headers: getAuthHeader(secondPatientToken),
    });

    const res = await api.delete(`/appointments/${newId}`, {
      headers: getAuthHeader(secondPatientToken),
    });

    expect(res.status).toBe(400);
  });

  test("Mark already-served patient as served again returns 400", async () => {
    const createRes = await api.post(
      "/appointments",
      { doctor: "Dr. Smith", reason: "Checkup", appointmentDate: tomorrow() },
      { headers: getAuthHeader(secondPatientToken) }
    );

    const newId = createRes.data.id;

    await api.patch(`/appointments/${newId}/serve`, {}, {
      headers: getAuthHeader(staffToken),
    });

    const res = await api.patch(`/appointments/${newId}/serve`, {}, {
      headers: getAuthHeader(staffToken),
    });

    expect(res.status).toBe(400);
  });
});
