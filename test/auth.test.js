const request = require("supertest");
const { User } = require("../models/user");

describe("/api/auth", () => {
  let server;
  beforeEach(() => {
    server = require("../index");
  });

  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });

  describe("POST /", () => {
    let email, password, name;

    beforeEach(async () => {
      email = "test@test.com";
      password = "123456789";
      name = "name1";

      const user = new User({ email, name, password });

      await user.save();
    });

    const exec = () => {
      return request(server).post("/api/auth").send({ email, password });
    };

    it("should return 400 if email is invalid", async () => {
      email = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if email is invalid", async () => {
      password = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 404 if no user with given email exists", async () => {
      email = "test1@test.com";

      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return 200 if inputs are valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("email", email);
      expect(res.body).toHaveProperty("token");
    });
  });
});
