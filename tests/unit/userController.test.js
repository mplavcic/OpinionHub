/*
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app"); // Your Express app
const User = require("../../models/user");
const bcrypt = require("bcryptjs");

let dbConnection; // Declare a variable to hold the DB connection

beforeAll(async () => {
  // Connect to MongoDB Atlas only once before all tests
  const uri = "mongodb+srv://mateo:ovojesiframateo@cluster0.d4tpn.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";
  
  if (!mongoose.connection.readyState) {
    dbConnection = await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }
});

afterEach(async () => {
  // Clean up the users collection between tests
  await User.deleteMany({});
});

afterAll(async () => {
  // Close the connection after all tests are complete
  if (dbConnection) {
    await mongoose.connection.close();
  }
});

describe("User Signup - POST /signup", () => {
  it("should create a new user successfully", async () => {
    const response = await request(app)
      .post("/signup")
      .send({ name: "testuser", password: "password123" });

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Signup successful");

    // Verify user is stored in the database
    const user = await User.findOne({ name: "testuser" });
    expect(user).not.toBeNull();
    expect(user.name).toBe("testuser");
    expect(await bcrypt.compare("password123", user.password)).toBe(true); // Password is hashed
  });

  it("should return an error if the username already exists", async () => {
    // Pre-create a user
    await User.create({ name: "testuser", password: await bcrypt.hash("password123", 15) });

    // Attempt to create the same user again
    const response = await request(app)
      .post("/signup")
      .send({ name: "testuser", password: "password123" });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Incorrect password!");

    // Verify no duplicate users are created
    const users = await User.find({ name: "testuser" });
    expect(users.length).toBe(1);
  });
});
*/
