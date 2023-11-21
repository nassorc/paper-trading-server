// import { buildServer } from "../../src/utils/build_server";
import jwt from "jsonwebtoken";
import app from "../helpers/create_server";
import {
  createUserHelper,
  loginUserHelper,
  registerUserHelper,
  LoginInputType,
} from "../helpers/database_utils";
import UserService from "../../src/user/user.service";
import prisma from "../../src/libs/prisma";
import codes from "../../src/utils/reponse_code";

let registerPayload = {
  username: "register-test-user",
  password: "register-test-user-password",
};

async function getAccessTokenFromResponse(res: any) {
  const body = await res.json();
  return body.accessToken;
}

describe("User", () => {
  describe("[POST] /login", () => {
    const userPayload = {
      username: "test-user",
      password: "test-user-password",
    };
    const loginRequest: any = {
      method: "POST",
      url: "/login",
      body: userPayload,
    };
    describe("given username and password are valid", () => {
      let createdUser: any, res: any;
      const loginServiceSpy = jest.spyOn(UserService.prototype, "loginUser");
      beforeEach(async () => {
        createdUser = await createUserHelper(userPayload);
        res = await loginUserHelper({ ...createdUser });
      });
      it("should respond with a 200 status", async () => {
        expect(res.statusCode).toBe(codes.OK);
      });

      it("should return a jwt", async () => {
        const data = await res.json();
        expect(data).toHaveProperty("accessToken");
        expect(() => {
          jwt.verify(data.accessToken, process.env.JWT_SECRET || "secret");
        }).not.toThrow();
      });

      it("should return content-type json", async () => {
        expect(res.headers["content-type"]).toContain("application/json");
      });

      it("should call UserSerice.loginUser once", async () => {
        expect(UserService.prototype.loginUser).toBeCalledTimes(1);
      });
    });
    describe("when request payload is missing a username or password", () => {
      it("should return a 400", async () => {
        const createdUser: LoginInputType = await createUserHelper(userPayload);
        const loginWithUsername = await loginUserHelper({
          username: createdUser.username,
        });
        const loginWithPassword = await loginUserHelper({
          password: createdUser.password,
        });
        expect(loginWithUsername.statusCode).toBe(codes.BAD_REQUEST);
        expect(loginWithPassword.statusCode).toBe(codes.BAD_REQUEST);
      });
    });
    describe("given credentials do not match user's database record", () => {
      it("should response with a 401 status", async () => {
        const createdUser: LoginInputType = await createUserHelper(userPayload);
        const incorrectPassword = createdUser.password + "-incorrect";
        const res = await loginUserHelper({
          ...createdUser,
          password: incorrectPassword,
        });
        expect(res.statusCode).toBe(codes.UNAUTHORIZED);
      });
    });
  });

  describe("[POST] /register route", () => {
    // let userService;
    describe("given username and password are valid", () => {
      it("should response with a 201 status", async () => {
        const res = await registerUserHelper(registerPayload);
        expect(res.statusCode).toBe(codes.CREATED);
      });
      it("should create a user in the database", async () => {
        const res = await registerUserHelper(registerPayload);
        const body = await res.json();
        const query = await prisma.user.findMany({
          where: { username: registerPayload.username },
        });
        expect(query.length).toBe(1);
        expect(query[0].username).toContain(registerPayload.username);
        expect(body.userId).toBeDefined();
      });
      it("should call UserSerice.registerUser once", async () => {
        const spy = jest.spyOn(UserService.prototype, "registerUser");
        const res = await registerUserHelper(registerPayload);
        expect(UserService.prototype.registerUser).toBeCalledTimes(1);
      });
    });
    describe("given a taken username", () => {
      it("should return a 401", async () => {
        const spy = jest.spyOn(UserService.prototype, "registerUser");
        const firstRegistration = await registerUserHelper(registerPayload);
        const secondRegistration = await registerUserHelper(registerPayload);

        expect(secondRegistration.statusCode).toBe(codes.CONFLICT);
        expect(UserService.prototype.registerUser).toBeCalledTimes(2);
      });
    });
  });
  describe("[GET] /user/profile protected route", () => {
    describe("given that the user is authenticated", () => {
      let token: any;
      let creadedUser: any;
      beforeEach(async () => {
        const createdUser = await createUserHelper(registerPayload);
        // @ts-ignore
        const res = await loginUserHelper({ ...createdUser });
        token = await getAccessTokenFromResponse(res);

        creadedUser = (await prisma.user.findMany())[0];
      });
      it("should response with a 200 status", async () => {
        const res = await app.inject({
          method: "GET",
          url: `/user/profile`,
          headers: {
            authorization: `bearer ${token}`,
          },
        });
        expect(res.statusCode).toBe(codes.OK);
      });
      it("should return a user object", async () => {});
      it("should NOT include the password in the response object", async () => {});
    });
    describe("given user is not authenticate", () => {
      it("should response with a 403 status", async () => {
        const res = await app.inject({
          method: "GET",
          url: `/user/profile`,
          headers: {
            authorization: "bearer notAToken",
          },
        });
        expect([codes.UNAUTHORIZED, codes.FORBIDDEN]).toContain(res.statusCode);
      });
    });
  });
});
