const mongoose = require("mongoose");
const request = require("supertest");
const { Book } = require("../models/book");
const { User } = require("../models/user");

describe("/api/library", () => {
  let server;

  beforeEach(() => {
    server = require("../index");
  });

  afterEach(async () => {
    await server.close();
    await Book.deleteMany({});
  });

  describe("GET /", () => {
    it("should return books", async () => {
      await Book.insertMany([
        {
          name: "book1",
          author: "123456",
          genre: "123456",
          numberInLibrary: 5,
        },
        {
          name: "book2",
          author: "123456",
          genre: "123456",
          numberInLibrary: 5,
        },
      ]);

      const res = await request(server).get("/api/library").send();

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((a) => a.name === "book1")).toBeTruthy();
      expect(res.body.some((a) => a.name === "book2")).toBeTruthy();
    });
  });
  describe("GET /:id", () => {
    let id;

    beforeEach(async () => {
      id = mongoose.Types.ObjectId();

      const book = new Book({
        _id: id,
        name: "book1",
        author: "123456",
        genre: "123456",
        numberInLibrary: 5,
      });

      await book.save();
    });
    it("should return 404 if book id is invalid", async () => {
      id = "1";

      const res = await request(server)
        .get("/api/library/" + id)
        .send();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        message: "No boook with given id was not found",
      });
    });
    it("should return 404 if no book with given id exists ", async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const res = await request(server)
        .get("/api/library/" + id)
        .send();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        message: "No boook with given id was not found",
      });
    });
    it("should return book if inputs are valid ", async () => {
      const res = await request(server)
        .get("/api/library/" + id)
        .send();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        _id: id.toHexString(),
        name: "book1",
        author: "123456",
        genre: "123456",
        numberInLibrary: 5,
      });
    });
  });
  describe("POST /", () => {
    let name, author, genre, numberInLibrary, token;

    beforeEach(() => {
      name = "book1";
      author = "author1";
      genre = "genre1";
      numberInLibrary = 5;

      token = new User().generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .post("/api/library")
        .set("x-auth-token", token)
        .send({ name, author, genre, numberInLibrary });
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
    it("should return 400 if name is invalid", async () => {
      name = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if author is invalid", async () => {
      author = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if name is invalid", async () => {
      genre = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if numberInLibrary is not number", async () => {
      numberInLibrary = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if book is already recorded", async () => {
      const book = new Book({
        name,
        author,
        genre,
        numberInLibrary,
      });

      await book.save();

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ message: "The book already recorded" });
    });

    it("should return genre if genre is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "book1");
      expect(res.body).toHaveProperty("author", "author1");
      expect(res.body).toHaveProperty("genre", "genre1");
      expect(res.body).toHaveProperty("numberInLibrary", 5);
    });
  });
  describe("PUT /:id", () => {
    let id, newName, newAuthor, newGenre, newNumberInLibrary, token;

    beforeEach(async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const book = new Book({
        _id: id,
        name: "book1",
        author: "author1",
        genre: "genre1",
        numberInLibrary: 5,
      });

      newName = "newbook1";
      newAuthor = "newauthor1";
      newGenre = "newgenre1";
      newNumberInLibrary = 10;

      await book.save();

      token = new User({ isAdmin: true }).generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .put("/api/library/" + id)
        .set("x-auth-token", token)
        .send({
          name: newName,
          author: newAuthor,
          genre: newGenre,
          numberInLibrary: newNumberInLibrary,
        });
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

    it("should return 404 if  id is invalid", async () => {
      id = "1";

      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return 404 if no book with given id exists", async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return 400 if name is invalid", async () => {
      newName = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if author is invalid", async () => {
      newAuthor = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if genre is invalid", async () => {
      newGenre = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if numberInLibrary is invalid", async () => {
      newNumberInLibrary = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if numberInLibrary is invalid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", newName);
      expect(res.body).toHaveProperty("author", newAuthor);
      expect(res.body).toHaveProperty("genre", newGenre);
      expect(res.body).toHaveProperty("numberInLibrary", newNumberInLibrary);
    });
  });
  describe("DELETE /:id", () => {
    let id, name, author, genre, numberInLibrary;

    beforeEach(async () => {
      id = mongoose.Types.ObjectId().toHexString();
      name = "book1";
      author = "author1";
      genre = "genre1";
      numberInLibrary = 5;

      const book = new Book({
        _id: id,
        name,
        author,
        genre,
        numberInLibrary,
      });

      await book.save();

      token = new User({ isAdmin: true }).generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .delete("/api/library/" + id)
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
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("author", author);
      expect(res.body).toHaveProperty("genre", genre);
      expect(res.body).toHaveProperty("numberInLibrary", numberInLibrary);
    });
    it("should delete book from database if  id is valid", async () => {
      await exec();

      const book = await Book.findById(id);

      expect(book).toBeFalsy();
    });
  });
});
