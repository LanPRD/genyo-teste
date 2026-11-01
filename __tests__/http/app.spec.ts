import { createApp } from "@/infra/http/app";
import { createContainer } from "@/infra/http/container";
import request from "supertest";
import { InMemoryEmployeeRepository } from "../test-repositories/in-memory-employee-repository";

vi.spyOn(console, "error").mockImplementation(() => {});

const makeApp = (checkDatabase = async () => {}) => {
  const container = createContainer({
    employeeRepository: new InMemoryEmployeeRepository(),
    checkDatabase
  });

  return createApp(container, { corsOrigin: "http://localhost:5173" });
};

describe("HTTP app", () => {
  it("GET /health returns ok", async () => {
    const response = await request(makeApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", database: "up" });
  });

  it("GET /health returns 503 when database is down", async () => {
    const app = makeApp(async () => {
      throw new Error("down");
    });

    const response = await request(app).get("/health");

    expect(response.status).toBe(503);
  });

  it("applies CORS and security headers", async () => {
    const response = await request(makeApp())
      .get("/health")
      .set("Origin", "http://localhost:5173");

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173"
    );
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("POST /employees creates and GET /employees/:id returns it", async () => {
    const app = makeApp();

    const created = await request(app)
      .post("/employees")
      .send({ name: "John", email: "john@example.com" });

    expect(created.status).toBe(201);

    const found = await request(app).get(`/employees/${created.body.data.id}`);

    expect(found.status).toBe(200);
    expect(found.body.data.email).toBe("john@example.com");
  });

  it("POST /employees returns 400 with details on invalid body", async () => {
    const response = await request(makeApp())
      .post("/employees")
      .send({ name: "", email: "x" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("VALIDATION_ERROR");
    expect(response.body.details).toHaveLength(2);
  });

  it("POST /employees returns 409 on duplicated email", async () => {
    const app = makeApp();
    const body = { name: "John", email: "john@example.com" };

    await request(app).post("/employees").send(body);
    const response = await request(app).post("/employees").send(body);

    expect(response.status).toBe(409);
  });

  it("returns 400 on malformed JSON", async () => {
    const response = await request(makeApp())
      .post("/employees")
      .set("Content-Type", "application/json")
      .send("{bad");

    expect(response.status).toBe(400);
  });

  it("GET /employees/:id returns 404 when missing", async () => {
    const response = await request(makeApp()).get("/employees/nope");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("EMPLOYEE_NOT_FOUND");
  });

  it("returns 404 for unknown route", async () => {
    const response = await request(makeApp()).get("/nope");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("ROUTE_NOT_FOUND");
  });
});
