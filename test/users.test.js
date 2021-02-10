const request = require("supertest");
const { User } = require("../models/user");

describe("/api/users", () => {
  let server;

  beforeEach(() => {
    server = require("../index");
  });

  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });

  describe("GET /me", () => {
    let token, user, prop;

    beforeEach(() => {
      prop = {
        name: "name1",
        email: "email1",
        password: "password1",
      };

      user = new User(prop);

      token = user.generateAuthToken();
    });

    const exec = async () => {
      return request(server)
        .get("/api/users/me")
        .set("x-auth-token", token)
        .send();
    };

    it("should return 400 if token is invalid", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return 400 if token is invalid", async () => {
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if token is invalid", async () => {
      await user.save();
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", prop.name);
      expect(res.body).toHaveProperty("email", prop.email);
    });
  });

  describe("POST /api/users", () => {
    let name, email, password;

    beforeEach(() => {
      name = "user1";
      email = "test@test.com";
      password = "123456789";
    });

    const exec = () => {
      return request(server).post("/api/users").send({ name, email, password });
    };

    it("should return 400 if email is invalid", async () => {
      email = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if name is invalid", async () => {
      name = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if email is invalid", async () => {
      password = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if user is already registered", async () => {
      const user = new User({ name, email, password });
      await user.save();

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 200 if user ", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });
  });
});
