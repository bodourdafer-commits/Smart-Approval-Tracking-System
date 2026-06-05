let requests = JSON.parse(localStorage.getItem("requests")) || [];

function login() {
  let user = document.getElementById("username").value;
  if (user) {
    localStorage.setItem("user", user);
    window.location.href = "dashboard.html";
  }
}

function submitRequest() {
  let input = document.getElementById("requestInput").value;

  let newRequest = {
    text: input,
    status: "Pending"
  };

  requests.push(newRequest);
  localStorage.setItem("requests", JSON.stringify(requests));

  alert("Request submitted!");
  window.location.href = "dashboard.html";
}

if (document.getElementById("requestList")) {
  let list = document.getElementById("requestList");

  requests.forEach(r => {
    let li = document.createElement("li");
    li.innerText = r.text + " - " + r.status;
    list.appendChild(li);
  });
}

if (document.getElementById("approvalList")) {
  let list = document.getElementById("approvalList");

  requests.forEach((r, index) => {
    let li = document.createElement("li");
    li.innerHTML = `
      ${r.text} - ${r.status}
      <button onclick="approve(${index})">Approve</button>
    `;
    list.appendChild(li);
  });
}

function approve(index) {
  requests[index].status = "Approved";
  localStorage.setItem("requests", JSON.stringify(requests));
  location.reload();
}