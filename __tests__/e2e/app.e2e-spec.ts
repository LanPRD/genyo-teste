import { prisma } from "@/infra/database/prisma/prisma.service";
import { PrismaEmployeeRepository } from "@/infra/database/repositories";
import { createApp } from "@/infra/http/app";
import { createContainer } from "@/infra/http/container";
import request from "supertest";

vi.spyOn(console, "error").mockImplementation(() => {});

const employeeBody = {
  name: "Maria da Silva",
  hireDate: "2026-01-10",
  workdayStartTime: "08:00",
  workdayEndTime: "17:00",
  closingPeriodicity: "MONTHLY"
};

function makeApp(checkDatabase = async () => {}) {
  const container = createContainer({
    employeeRepository: new PrismaEmployeeRepository(prisma),
    checkDatabase
  });

  return createApp(container, { corsOrigin: "http://localhost:5173" });
}

describe("HTTP app (e2e)", () => {
  beforeEach(async () => {
    await prisma.employee.deleteMany();
  });

  afterAll(async () => {
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

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

    const created = await request(app).post("/employees").send(employeeBody);

    expect(created.status).toBe(201);
    expect(await prisma.employee.count()).toBe(1);

    const found = await request(app).get(`/employees/${created.body.data.id}`);

    expect(found.status).toBe(200);
    expect(found.body.data).toMatchObject({
      name: "Maria da Silva",
      hireDate: "2026-01-10T00:00:00.000Z",
      terminationDate: null,
      workdayStartTime: "08:00",
      workdayEndTime: "17:00",
      closingPeriodicity: "MONTHLY"
    });
  });

  it("POST /employees returns 400 with details on invalid body", async () => {
    const response = await request(makeApp())
      .post("/employees")
      .send({ ...employeeBody, name: "Maria 2", workdayEndTime: "07:00" });

    expect(response.status).toBe(400);
    expect(await prisma.employee.count()).toBe(0);
    expect(response.body.error).toBe("VALIDATION_ERROR");
    expect(response.body.details).toEqual([
      { field: "name", message: "Name must not contain numbers" },
      {
        field: "workdayEndTime",
        message: "Workday end time must not be before start time"
      }
    ]);
  });

  it("DELETE /employees/:id deletes the employee", async () => {
    const app = makeApp();
    const created = await request(app).post("/employees").send(employeeBody);
    const id = created.body.data.id;

    const deleted = await request(app).delete(`/employees/${id}`);
    const found = await request(app).get(`/employees/${id}`);

    expect(deleted.status).toBe(204);
    expect(deleted.text).toBe("");
    expect(await prisma.employee.count()).toBe(0);
    expect(found.status).toBe(404);
  });

  it("DELETE /employees/:id returns 404 when missing", async () => {
    const response = await request(makeApp()).delete("/employees/nope");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("EMPLOYEE_NOT_FOUND");
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
