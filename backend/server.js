const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

app.post("/login", (req, res) => {

  const { username, password } = req.body;

  if (username === "employee1" && password === "1234") {
    return res.json({
      message: "Login successful",
      role: "Employee"
    });
  }

  if (username === "manager1" && password === "1234") {
    return res.json({
      message: "Login successful",
      role: "Manager"
    });
  }

  res.status(401).json({
    message: "Invalid credentials"
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
