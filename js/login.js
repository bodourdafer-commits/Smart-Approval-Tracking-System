const form = document.getElementById("loginForm");
const message = document.getElementById("message");

const users = [
    { username: "employee", password: "1234" },
    { username: "manager", password: "1234" }
];

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Redirect to Dashboard
        window.location.href = "dashboard.html";
    } else {
        message.textContent = "Invalid username or password";
    }
});