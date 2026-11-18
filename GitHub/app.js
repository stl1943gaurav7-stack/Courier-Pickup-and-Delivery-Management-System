// SPEEDEX Courier System - JavaScript Controller (1st Sem B.Tech)
let currentOtp = "4321";

// Initial Sample Data
const defaultShipments = [
  {
    id: "CPD-101",
    sender: "Rahul Sharma (9876543210)",
    receiver: "Amit Kumar (9123456780)",
    desc: "Study Notes",
    weight: "1.2",
    agent: "Ramesh (Bike DL-01)",
    status: "Delivered",
    timeline: ["16 Nov: Pickup booked", "16 Nov: Picked up by Ramesh", "17 Nov: Central Hub Sorting", "17 Nov: Delivered with OTP"]
  },
  {
    id: "CPD-102",
    sender: "Pooja Verma (9811223344)",
    receiver: "Suresh Rao (9988776655)",
    desc: "Laptop Charger",
    weight: "0.8",
    agent: "Unassigned",
    status: "Pickup Requested",
    timeline: ["18 Nov: Pickup Requested by customer"]
  }
];

let shipments = JSON.parse(localStorage.getItem("speedex_shipments")) || defaultShipments;
let customers = JSON.parse(localStorage.getItem("speedex_customers")) || [
  { name: "Rahul Sharma", phone: "9876543210", addr: "Hostel 1, Delhi" },
  { name: "Pooja Verma", phone: "9811223344", addr: "Hostel 2, Delhi" }
];

function saveState() {
  localStorage.setItem("speedex_shipments", JSON.stringify(shipments));
  localStorage.setItem("speedex_customers", JSON.stringify(customers));
  renderSelects();
  renderHistory();
}

function showTab(tabId, btn) {
  document.querySelectorAll(".tab-pane").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(el => el.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  if (btn) btn.classList.add("active");
}

// 1. Customer Registration
function registerCustomer(e) {
  e.preventDefault();
  customers.push({
    name: document.getElementById("cust-name").value,
    phone: document.getElementById("cust-phone").value,
    addr: document.getElementById("cust-addr").value
  });
  saveState();
  alert("✅ Customer Registered Successfully!");
  e.target.reset();
}

// 2. Book Pickup & Parcel Details
function autoFillSender() {
  const c = customers[document.getElementById("pickup-cust").value];
  if (c) {
    document.getElementById("sender-info").value = `${c.name} (${c.phone})`;
    document.getElementById("sender-addr").value = c.addr;
  }
}

function bookPickup(e) {
  e.preventDefault();
  const id = "CPD-" + (100 + shipments.length + 1);
  shipments.push({
    id: id,
    sender: document.getElementById("sender-info").value,
    receiver: document.getElementById("rec-info").value,
    desc: document.getElementById("parcel-desc").value,
    weight: document.getElementById("parcel-weight").value,
    agent: "Unassigned",
    status: "Pickup Requested",
    timeline: [`${new Date().toLocaleDateString()}: Pickup requested`]
  });
  saveState();
  const alertBox = document.getElementById("booking-alert");
  alertBox.style.display = "block";
  alertBox.innerHTML = `🎉 <b>Shipment Created!</b> Shipment ID: <b>${id}</b>. Note this ID to track!`;
  alert("Success! Generated Shipment ID: " + id);
  e.target.reset();
}

// 3. Track Shipment & 5-Stage Timeline
function trackShipment() {
  const id = document.getElementById("track-id").value.trim().toUpperCase();
  const s = shipments.find(item => item.id.toUpperCase() === id);
  const res = document.getElementById("track-result");
  if (!s) return alert("❌ Shipment ID not found! Check History for valid IDs.");

  res.style.display = "block";
  document.getElementById("track-header").innerText = `${s.id} [${s.desc}] - Status: ${s.status} | Agent: ${s.agent}`;

  const stages = ["Pickup Requested", "Picked Up", "In Transit", "Out for Delivery", "Delivered"];
  const curIndex = stages.indexOf(s.status);
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById("step-" + i);
    el.className = "step";
    if (i - 1 < curIndex) el.classList.add("done");
    else if (i - 1 === curIndex) el.classList.add(curIndex === 4 ? "done" : "active");
  }
  document.getElementById("track-timeline").innerHTML = s.timeline.map(t => `<li>${t}</li>`).join("");
}

// 4. Delivery Assignment
function assignDelivery(e) {
  e.preventDefault();
  const s = shipments.find(item => item.id === document.getElementById("assign-id").value);
  if (s) {
    const agent = document.getElementById("agent-name").value;
    s.agent = agent;
    s.timeline.push(`${new Date().toLocaleDateString()}: Assigned to ${agent}`);
    saveState();
    alert(`✅ Assigned ${agent} to ${s.id}`);
    e.target.reset();
  }
}

// 5. Update Status
function updateStatus(e) {
  e.preventDefault();
  const s = shipments.find(item => item.id === document.getElementById("status-id").value);
  if (s) {
    const st = document.getElementById("new-status").value;
    s.status = st;
    s.timeline.push(`${new Date().toLocaleDateString()}: Status -> ${st} (${document.getElementById("status-location").value})`);
    saveState();
    alert(`✅ Updated ${s.id} to: ${st}`);
    e.target.reset();
  }
}

// 6. Delivery Confirmation (Simulated OTP)
function sendOtp() {
  currentOtp = Math.floor(1000 + Math.random() * 9000).toString();
  document.getElementById("otp-hint").innerText = `📲 Simulated SMS: OTP is ${currentOtp}`;
  document.getElementById("pod-otp").value = currentOtp;
  alert("Simulated SMS: Receiver OTP is " + currentOtp);
}

function confirmDelivery(e) {
  e.preventDefault();
  if (document.getElementById("pod-otp").value !== currentOtp) return alert("❌ Invalid OTP!");
  const s = shipments.find(item => item.id === document.getElementById("pod-id").value);
  if (s) {
    const rec = document.getElementById("pod-receiver").value;
    s.status = "Delivered";
    s.timeline.push(`${new Date().toLocaleDateString()}: Delivered to ${rec} (OTP Verified)`);
    saveState();
    alert(`🎉 Delivery Confirmed for ${s.id}! Handed to ${rec}.`);
    e.target.reset();
    document.getElementById("otp-hint").innerText = "";
  }
}

// 7. Master History Table & Selects
function renderHistory() {
  document.getElementById("history-tbody").innerHTML = shipments.map(s => `
    <tr>
      <td><b>${s.id}</b></td>
      <td>${s.sender}</td>
      <td>${s.receiver}</td>
      <td>${s.weight} kg</td>
      <td>${s.agent}</td>
      <td><b style="color:${s.status==='Delivered'?'green':'#0044cc'}">${s.status}</b></td>
      <td><button class="btn" style="padding:2px 7px;margin:0;" onclick="quickTrack('${s.id}')">Track</button></td>
    </tr>
  `).join("");
}

function quickTrack(id) {
  showTab("tab-track", document.querySelectorAll(".nav-btn")[2]);
  document.getElementById("track-id").value = id;
  trackShipment();
}

function renderSelects() {
  const populate = id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = shipments.map(s => `<option value="${s.id}">${s.id} - ${s.desc} (${s.status})</option>`).join("");
  };
  ["assign-id", "status-id", "pod-id"].forEach(populate);

  const custSel = document.getElementById("pickup-cust");
  if (custSel) {
    custSel.innerHTML = '<option value="">-- Choose Customer (Optional) --</option>' +
      customers.map((c, i) => `<option value="${i}">${c.name} (${c.phone})</option>`).join("");
  }
}

window.onload = function() {
  renderSelects();
  renderHistory();
};
