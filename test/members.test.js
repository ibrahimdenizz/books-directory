const mongoose = require("mongoose");
const request = require("supertest");
const { Member } = require("../models/member");
const { User } = require("../models/user");

describe("/api/members", () => {
  let server;

  beforeEach(() => {
    server = require("../index");
  });

  afterEach(async () => {
    await server.close();
    await Member.deleteMany({});
    await User.deleteMany({});
  });  

  describe("GET /", () => {
    let token;

    beforeEach(async () => {
      token = new User().generateAuthToken();

      await Member.insertMany([
        {
          ssn: "01234567891",
          name: {
            firstName: "firstname1",
            lastName: "lastname1",
          },
          address: "address1",
          phone: "01234567891",
        },
        {
          ssn: "01234567892",
          name: {
            firstName: "firstname2",
            lastName: "lastname2",
          },
          address: "address2",
          phone: "01234567892",
        },
      ]);
    });

    const exec = () => {
      return request(server)
        .get("/api/members")
        .set("x-auth-token", token)
        .send();
    };
    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return 401 if token is invalid", async () => {
      token = "123456";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return students if inputs are valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((a) => a.ssn === "01234567891")).toBeTruthy();
      expect(res.body.some((a) => a.ssn === "01234567892")).toBeTruthy();
    });
  });
  describe("GET /:id", () => {
    let id, token, prop;

    beforeEach(async () => {
      id = mongoose.Types.ObjectId();

      prop = {
        _id: id,
        ssn: "01234567891",
        name: {
          firstName: "firstname1",
          lastName: "lastname1",
        },
        address: "address1",
        phone: "01234567891",
      };

      const member = new Member(prop);

      await member.save();

      token = new User().generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .get("/api/members/" + id)
        .set("x-auth-token", token)
        .send();
    };
    it("should return 401 if user is not logged in", async () => {
      token = "a";

      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return 401 if token is invalid", async () => {
      token = "123456";

      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return 404 if student id is invalid", async () => {
      id = "1";

      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return 404 if no student with given id exists ", async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const res = await exec();
      expect(res.status).toBe(404);
    });
    it("should return student if inputs are valid ", async () => {
      prop._id = prop._id.toHexString();
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(prop);
    });
  });
  describe("POST /", () => {
    let token, prop;

    beforeEach(async () => {
      prop = {
        ssn: "01234567891",
        name: {
          firstName: "firstname1",
          lastName: "lastname1",
        },
        address: "address1",
        phone: "01234567891",
      };
      token = new User().generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .post("/api/members")
        .set("x-auth-token", token)
        .send(prop);
    };
    it("should return 401 if user is not logged in", async () => {
      token = "a";

      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return 401 if token is invalid", async () => {
      token = "123456";

      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return 400 if studentId is less than 10 ", async () => {
      prop.studentId = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if firstName length is less than 5 ", async () => {
      prop.name.firstName = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if firstName length is greater than 55 ", async () => {
      prop.name.firstName = new Array(57).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if firstName length is less than 5 ", async () => {
      prop.name.firstName = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if firstName length is greater than 55 ", async () => {
      prop.name.firstName = new Array(57).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if lastName length is less than 5 ", async () => {
      prop.name.lastName = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if lastName length is greater than 55 ", async () => {
      prop.name.lastName = new Array(57).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if address length is less than 5 ", async () => {
      prop.address = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if address length is greater than 255 ", async () => {
      prop.address = new Array(257).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if phone length is less than 10 ", async () => {
      prop.phone = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if phone length is greater than 50 ", async () => {
      prop.phone = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return student if inputs are valid ", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(prop);
    });
  });
  describe("PUT /:id", () => {
    let id, newProp;

    beforeEach(async () => {
      id = mongoose.Types.ObjectId().toHexString();

      newProp = {
        ssn: "98765432101",
        name: {
          firstName: "newFirstname",
          lastName: "newLastname1",
        },
        address: "newAddress",
        phone: "19876543210",
      };

      const member = new Member({
        _id: id,
        ssn: "01234567891",
        name: {
          firstName: "firstname1",
          lastName: "lastname1",
        },
        address: "address1",
        phone: "01234567891",
      });

      await member.save();

      const user = new User({ isAdmin: true });

      token = user.generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .put("/api/members/" + id)
        .set("x-auth-token", token)
        .send(newProp);
    };
    it("should return 401 if user is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return 401 if  token is invalid", async () => {
      token = "1234";
      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return 403 if user is not admin", async () => {
      token = new User({ isAdmin: false }).generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(403);
    });
    it("should return 400 if studentId is less than 10 ", async () => {
      newProp.studentId = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if firstName length is less than 5 ", async () => {
      newProp.name.firstName = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if firstName length is greater than 55 ", async () => {
      newProp.name.firstName = new Array(57).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if firstName length is less than 5 ", async () => {
      newProp.name.firstName = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if firstName length is greater than 55 ", async () => {
      newProp.name.firstName = new Array(57).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if lastName length is less than 5 ", async () => {
      newProp.name.lastName = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if lastName length is greater than 55 ", async () => {
      newProp.name.lastName = new Array(57).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if address length is less than 5 ", async () => {
      newProp.address = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if address length is greater than 255 ", async () => {
      newProp.address = new Array(257).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if phone length is less than 10 ", async () => {
      newProp.phone = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if phone length is greater than 50 ", async () => {
      newProp.phone = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return student if inputs are valid", async () => {
      const res = await exec();
      newProp._id = id;

      expect(res.body).toMatchObject(newProp);
      expect(res.status).toBe(200);
    });
  });
  describe("DELETE /:id", () => {
    let token, prop, id;

    beforeEach(async () => {
      id = mongoose.Types.ObjectId().toHexString();
      prop = {
        _id: id,
        ssn: "01234567891",
        name: {
          firstName: "firstname1",
          lastName: "lastname1",
        },
        address: "address1",
        phone: "01234567891",
      };
      const member = new Member(prop);

      await member.save();

      token = new User({ isAdmin: true }).generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .delete("/api/members/" + id)
        .set("x-auth-token", token)
        .send();
    };

    it("should return 401 if user is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 401 if token is invalid", async () => {
      token = "12345";
      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return 403 if user is not admin", async () => {
      token = new User().generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(403);
    });
    it("should return 404 if :id is invalid", async () => {
      id = "12345";
      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return 404 if No student with given id exists ", async () => {
      id = mongoose.Types.ObjectId().toHexString();
      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return student if inputs valid", async () => {
      const res = await exec();

      const memberInDb = await Member.findById(id);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(prop);
      expect(memberInDb).toBeFalsy();
    });
  });
});
