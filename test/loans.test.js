const request = require("supertest");
const mongoose = require("mongoose");
const { Loan } = require("../models/loan");
const { User } = require("../models/user");
const { Book } = require("../models/book");
const { Member } = require("../models/member");

describe("/api/loans", () => {
  let server;

  beforeEach(() => {
    server = require("../index");
  });

  afterEach(async () => {
    await server.close();
    await Loan.deleteMany({});
    await User.deleteMany({});
    await Book.deleteMany({});
    await Member.deleteMany({});
  });

  describe("GET/", () => {
    let token;
    beforeEach(async () => {
      await Loan.insertMany([
        {
          member: {
            name: {
              firstName: "firstname1",
              lastName: "lastname1",
            },
            phone: "01234567891",
          },
          book: {
            name: "book1",
            author: "author1",
          },
          loanDays: 5,
        },
        {
          member: {
            name: {
              firstName: "firstname2",
              lastName: "lastname2",
            },
            phone: "01234567892",
          },
          book: {
            name: "book2",
            author: "author2",
          },
          loanDays: 6,
        },
      ]);

      token = new User().generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .get("/api/loans")
        .set("x-auth-token", token)
        .send();
    };

    it("should return loan", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.some((a) => a.loanDays === 5)).toBeTruthy();
      expect(res.body.some((a) => a.loanDays === 6)).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    let id, prop, token;

    beforeEach(async () => {
      id = mongoose.Types.ObjectId().toHexString();

      prop = {
        _id: id,
        member: {
          name: {
            firstName: "firstname1",
            lastName: "lastname1",
          },
          phone: "01234567891",
        },
        book: {
          name: "book1",
          author: "author1",
        },
        loanDays: 5,
      };

      const loan = new Loan(prop);

      await loan.save();

      token = new User().generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .get("/api/loans/" + id)
        .set("x-auth-token", token)
        .send();
    };
    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 401 if token is invalid", async () => {
      token = "1234";

      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return 404 if book id is invalid", async () => {
      id = "1";

      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return 404 if no book with given id exists ", async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return book if inputs are valid ", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(prop);
    });
  });

  describe("POST /", () => {
    let token, loanProp, bookProp, memberProp;

    beforeEach(async () => {
      loanProp = {
        memberId: mongoose.Types.ObjectId().toHexString(),
        bookId: mongoose.Types.ObjectId().toHexString(),
        loanDays: 5,
      };
      bookProp = {
        _id: loanProp.bookId,
        name: "book1",
        author: "author1",
        genre: "genre1",
        numberInLibrary: 5,
      };

      memberProp = {
        _id: loanProp.memberId,
        ssn: "01234567893",
        name: {
          firstName: "firstname1",
          lastName: "lastname1",
        },
        address: "address1",
        phone: "01234567891",
      };

      const member = new Member(memberProp);

      const book = new Book(bookProp);

      await book.save();
      await member.save();

      token = new User().generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .post("/api/loans")
        .set("x-auth-token", token)
        .send(loanProp);
    };

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 401 if token is invalid", async () => {
      token = "1234";

      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return 400 if memberId is invalid", async () => {
      loanProp.memberId = "12345";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 404 if No member with given id exists", async () => {
      loanProp.memberId = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return 400 if bookId is invalid", async () => {
      loanProp.bookId = "12345";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 404 if No book with given id exists", async () => {
      loanProp.bookId = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return 404 if loanDays is less than 0", async () => {
      loanProp.loanDays = -1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return loan if loan is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.member).toMatchObject({
        name: memberProp.name,
        phone: memberProp.phone,
        _id: memberProp._id,
      });
      expect(res.body.book).toMatchObject({
        name: bookProp.name,
        author: bookProp.author,
      });
      expect(res.body).toHaveProperty("loanDays", 5);
    });
    it("should decrease numberInLibrary property of book if inputs is valid", async () => {
      await exec();

      const bookInDb = await Book.findById(bookProp._id);

      expect(bookInDb.numberInLibrary).toBe(4);
    });
  });
  describe("DELETE /:id", () => {
    let id, prop;

    beforeEach(async () => {
      id = mongoose.Types.ObjectId().toHexString();
      prop = prop = {
        _id: id,
        member: {
          _id: mongoose.Types.ObjectId().toHexString(),
          name: {
            firstName: "firstname1",
            lastName: "lastname1",
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

      const loan = new Loan(prop);

      await loan.save();

      token = new User({ isAdmin: true }).generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .delete("/api/loans/" + id)
        .set("x-auth-token", token)
        .send();
    };

    it("should return 403 if user is not admin", async () => {
      token = new User({ isAdmin: false }).generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 401 if token is invalid", async () => {
      token = "1234";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 404 if id is invalid", async () => {
      id = "1";

      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return 404 if No book with given id exists", async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return genre if  id is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("member", prop.member);
      expect(res.body).toHaveProperty("book", prop.book);
      expect(res.body).toHaveProperty("loanDays", prop.loanDays);
    });
    it("should delete book from database if  id is valid", async () => {
      await exec();

      const loan = await Loan.findById(id);

      expect(loan).toBeFalsy();
    });
  });
});
