async function loadDashboard() {
  const res = await fetch("http://localhost:3000/api/dashboard");
  const data = await res.json();

  
  document.getElementById("pending").innerText = data.pending;
  document.getElementById("approved").innerText = data.approved;
  document.getElementById("rejected").innerText = data.rejected;
  document.getElementById("escalated").innerText = data.escalated;
  document.getElementById("avg").innerText = data.avgApprovalTime;

 
  new Chart(document.getElementById("statusChart"), {
    type: "pie",
    data: {
      labels: ["Pending", "Approved", "Rejected", "Escalated"],
      datasets: [{
        data: [
          data.pending,
          data.approved,
          data.rejected,
          data.escalated
        ]
      }]
    }
  });

  
  new Chart(document.getElementById("approvalChart"), {
    type: "bar",
    data: {
      labels: ["Avg Approval Time"],
      datasets: [{
        label: "Hours",
        data: [data.avgApprovalTime]
      }]
    }
  });
}

loadDashboard();