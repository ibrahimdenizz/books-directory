const { Book } = require("../models/book");
const { Loan } = require("../models/loan");
const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../models/user");
const { expectCt } = require("helmet");

describe("/api/returns Post /", () => {
  let server, token, prop;

  beforeEach(async () => {
    server = require("../index");
    prop = {
      member: {
        _id: mongoose.Types.ObjectId().toHexString(),
        name: {
          firstName: "firstName",
          lastName: "lastName",
        },
        phone: "01234567891",
      },
      book: {
        _id: mongoose.Types.ObjectId().toHexString(),
        name: "book1",
        author: "author1",
      },
      loanDays: 5,
    };

    const book = new Book({
      _id: prop.book._id,
      name: "book1",
      author: "author1",
      genre: "genre1",
      numberInLibrary: 5,
    });

    const loan = new Loan(prop);

    token = new User().generateAuthToken();

    await book.save();
    await loan.save();
  });

  afterEach(async () => {
    await server.close();
    await Book.deleteMany({});
    await Loan.deleteMany({});
  });

  const exec = () => {
    return request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({ memberId: prop.member._id, bookId: prop.book._id });
  };

  it("should return 401 if User is not logged in", async () => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });
  it("should return 401 if User is not logged in", async () => {
    token = "12345";

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if memberId is invalid", async () => {
    prop.member._id = "12345";

    const res = await exec();

    expect(res.status).toBe(400);
  });
  it("should return 400 if bookId is invalid", async () => {
    prop.book._id = "12345";

    const res = await exec();

    expect(res.status).toBe(400);
  });
  it("should return 404 if memberId is not equal to loan.member._id ", async () => {
    prop.member._id = mongoose.Types.ObjectId().toHexString();

    const res = await exec();

    expect(res.status).toBe(404);
  });
  it("should return 400 if bookId is invalid", async () => {
    prop.book._id = mongoose.Types.ObjectId().toHexString();

    const res = await exec();

    expect(res.status).toBe(404);
  });
  it("should return loan if inputs is valid", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(prop);
  });
  it("should increase numberInLibrary property of book if inputs is valid", async () => {
    await exec();

    const bookInDb = await Book.findById(prop.book._id);

    expect(bookInDb.numberInLibrary).toBe(6);
  });
});
