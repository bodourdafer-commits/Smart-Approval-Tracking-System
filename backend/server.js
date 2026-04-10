const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let requests = [
  {
    id: 1,
    employee_name: "Khaled",
    request_type: "Leave",
    details: "3 days",
    status: "Approved",
    created_at: new Date(),
    escalated: false
  },
  {
    id: 2,
    employee_name: "Ahmed",
    request_type: "Loan",
    details: "5000 SAR",
    status: "Pending",
    created_at: new Date(Date.now() - 40000),
    escalated: true
  },
  {
    id: 3,
    employee_name: "Sara",
    request_type: "Vacation",
    details: "1 week",
    status: "Rejected",
    created_at: new Date(),
    escalated: false
  }
];

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "employee1" && password === "1234") {
    return res.json({ role: "employee" });
  }

  if (username === "manager1" && password === "1234") {
    return res.json({ role: "manager" });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

app.get("/requests", (req, res) => {
  res.json(requests);
});

app.post("/requests", (req, res) => {
  const newRequest = {
    id: requests.length + 1,
    ...req.body,
    status: "Pending",
    created_at: new Date(),
    escalated: false
  };

  requests.push(newRequest);
  res.json(newRequest);
});

app.put("/requests/:id", (req, res) => {
  const { id } = req.params;
  const { status, role } = req.body;

  if (role !== "manager") {
    return res.status(403).json({ message: "Only manager can update status" });
  }

  const request = requests.find(r => r.id == id);

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  request.status = status;
  request.escalated = false;

  res.json({ message: "Updated successfully", request });
});

setInterval(() => {
  const now = new Date();

  requests.forEach(r => {
    const diff = (now - new Date(r.created_at)) / 1000;

    if (r.status === "Pending" && diff > 30) {
      r.escalated = true;
    }
  });
}, 10000);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
