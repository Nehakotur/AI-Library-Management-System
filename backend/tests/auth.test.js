require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");

let mongoServer;

// Sab tests shuru hone se pehle - fake database banao
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Sab tests khatam hone ke baad - cleanup karo
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth API", () => {
  test("should register a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testjest@test.com",
      password: "test123456",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
  });

  test("should not register with invalid email", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "notanemail",
      password: "test123456",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("should login with correct credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "testjest@test.com",
      password: "test123456",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test("should not login with wrong password", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "testjest@test.com",
      password: "wrongpassword",
    });

    expect(response.statusCode).toBe(400);
  });
});