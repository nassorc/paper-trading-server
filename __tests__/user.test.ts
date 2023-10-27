// @ts-nocheck
import { buildServer } from "../src/utils/build_server";
import UserService from "../src/user/user.service";
import jwt from "jsonwebtoken";
import "dotenv/config";
import fastify from "fastify";

let app = buildServer();
let userService;

const request: any = {
  method: "POST",
  url: "/login",
  body: {
    username: "admin",
    password: "admin",
  },
};

describe("user", () => {
  describe("POST /login route", () => {
    describe("given username and password are valid", () => {
      it("should return a 200 status", async () => {
        let res = await app.inject(request);
        expect(res.statusCode).toBe(200);
      });
      it("should return a jwt", async () => {
        let res = await app.inject(request);
        const data = await res.json();
        expect(data).toHaveProperty("accessToken");
        expect(() => {
          jwt.verify(data.accessToken, process.env.JWT_SECRET || "secret");
        }).not.toThrow();
      });
      it("should return content-type json", async () => {
        let res = await app.inject(request);
        expect(res.headers["content-type"]).toContain("application/json");
      });
    });
    describe("when request body is missing the username or password", () => {
      it("should return a 400", async () => {
        let res = await app.inject({
          method: "POST",
          url: "/login",
          body: {},
        });
        expect(res.statusCode).toBe(400);
      });
    });
    describe("given invalid username or password", () => {
      const request: any = {
        method: "POST",
        url: "/login",
        body: {
          username: "not_admin",
          password: "not_admin",
        },
      };
      it("should return a 401", async () => {
        let res = await app.inject(request);
        expect(res.statusCode).toBe(401);
      });
    });
  });

  describe("POST /register route", () => {
    let userService;
    let userRegisterPayload = {
      username: "johndoe",
      password: "johndoe123",
    };
    beforeAll(() => {
      userService = app.userService;
      jest.spyOn(userService, "registerUser");
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    describe("given username and password are valid", () => {
      it("should regiser a user", async () => {
        // spy on service
        // check if data is inserted
        const res = await app.inject({
          method: "POST",
          url: "/register",
          body: userRegisterPayload,
        });
        const body = await res.json();
        const id = body.userId;
        expect(res.statusCode).toBe(201);
        expect(body.userId).toBeDefined();
        expect(userService.registerUser).toBeCalledTimes(1);
        await app.userService.deleteUser(id);
      });
    });
    describe("given a taken username", () => {
      it("should return a 401", async () => {
        const og = await app.inject({
          method: "POST",
          url: "/register",
          body: userRegisterPayload,
        });
        const res = await app.inject({
          method: "POST",
          url: "/register",
          body: userRegisterPayload,
        });
        const body = await og.json();
        const id = body.userId;
        expect(res.statusCode).toBe(409);
        expect(userService.registerUser).toBeCalledTimes(2);
        await app.userService.deleteUser(id);
      });
    });
  });
});
