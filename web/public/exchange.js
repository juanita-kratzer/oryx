firebase.initializeApp({
  apiKey: "AIzaSyC45jk8rL4BTiwp2vXMLtO_cZ-upsQ0_us",
  projectId: "oryx-wallet-cards",
  storageBucket: "oryx-wallet-cards.firebasestorage.app",
  messagingSenderId: "761069329191",
  appId: "1:761069329191:ios:d4f642990483ad72536702",
});

const db = firebase.firestore();
const app = document.getElementById("app");
const loading = document.getElementById("loading");
const errorEl = document.getElementById("error");

const pathParts = window.location.pathname.split("/");
const cardId = pathParts[pathParts.indexOf("x") + 1];

if (!cardId) {
  showError("Invalid link. No card found.");
} else {
  loadCard(cardId);
}

async function loadCard(id) {
  try {
    const doc = await db.collection("publicCards").doc(id).get();
    if (!doc.exists) {
      showError("This card could not be found.");
      return;
    }
    const data = doc.data();
    loading.style.display = "none";
    renderExchangePage(data, id);
  } catch (err) {
    showError("Something went wrong. Please try again.");
  }
}

function showError(msg) {
  loading.style.display = "none";
  errorEl.textContent = msg;
  errorEl.style.display = "block";
}

function renderExchangePage(card, cardId) {
  const bgColor = card.cardDesign?.backgroundColor || "#FFFFFF";
  const textColor = isLightColor(bgColor) ? "#000000" : "#FFFFFF";

  app.innerHTML = `
    <div class="card-preview" id="cardPreview" style="background:${bgColor};color:${textColor}">
      <div class="logo-placeholder">LOGO</div>
      <div class="company">${esc(card.company || "")}</div>
      <div class="name">${esc(card.fullName || "")}</div>
      <div class="title">${esc(card.jobTitle || "")}</div>
      <div class="contact-info">
        ${card.email ? `<span>${esc(card.email)}</span>` : ""}
        ${card.phone ? `<span>${esc(card.phone)}</span>` : ""}
        ${card.website ? `<span>${esc(card.website)}</span>` : ""}
      </div>
    </div>

    <div class="exchange-panel" id="exchangePanel">
      <h2>Would you like to save ${esc(card.fullName || "this person")}'s contact?</h2>

      <div class="toggle-row">
        <label>Save Contact</label>
        <div class="toggle-switch active" data-toggle="saveContact" onclick="toggleSwitch(this)"></div>
      </div>
      <div class="toggle-row">
        <label>Share My Details</label>
        <div class="toggle-switch active" data-toggle="shareDetails" onclick="toggleSwitch(this)"></div>
      </div>
      <div class="toggle-row">
        <label>Save Card Image</label>
        <div class="toggle-switch active" data-toggle="saveImage" onclick="toggleSwitch(this)"></div>
      </div>

      <div class="form-section" id="shareForm">
        <h3>Your Details</h3>
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="recipientName" placeholder="Your name">
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" id="recipientPhone" placeholder="+61 400 000 000">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="recipientEmail" placeholder="you@email.com">
        </div>
        <div class="form-group">
          <label>Job Title</label>
          <input type="text" id="recipientJobTitle" placeholder="Your job title">
        </div>
        <div class="form-group">
          <label>Company</label>
          <input type="text" id="recipientCompany" placeholder="Your company">
        </div>
        <div class="form-group">
          <label>Date of Birth</label>
          <input type="date" id="recipientDob">
        </div>
      </div>

      <button class="btn-primary" id="continueBtn" onclick="handleContinue()">Continue</button>
    </div>

    <div class="success-message" id="successMsg">
      <div class="checkmark">✓</div>
      <h2>Done!</h2>
      <p>Contact saved successfully.</p>
    </div>
  `;

  updateShareFormVisibility();

  window._cardData = card;
  window._cardId = cardId;
}

const toggleState = { saveContact: true, shareDetails: true, saveImage: true };

function toggleSwitch(el) {
  const key = el.dataset.toggle;
  toggleState[key] = !toggleState[key];
  el.classList.toggle("active", toggleState[key]);
  if (key === "shareDetails") updateShareFormVisibility();
}

function updateShareFormVisibility() {
  const form = document.getElementById("shareForm");
  if (form) {
    form.classList.toggle("visible", toggleState.shareDetails);
  }
}

async function handleContinue() {
  const btn = document.getElementById("continueBtn");
  btn.disabled = true;
  btn.textContent = "Processing...";

  try {
    const card = window._cardData;
    const cardId = window._cardId;

    if (toggleState.saveContact) {
      downloadVCard(card);
    }

    if (toggleState.saveImage) {
      downloadCardImage();
    }

    if (toggleState.shareDetails) {
      const source = detectSource();
      await db.collection("exchangeRequests").add({
        businessCardId: cardId,
        ownerUserId: card.ownerUserId,
        recipientName: val("recipientName"),
        recipientPhone: val("recipientPhone"),
        recipientEmail: val("recipientEmail"),
        recipientJobTitle: val("recipientJobTitle"),
        recipientCompany: val("recipientCompany"),
        recipientDob: val("recipientDob"),
        status: "pending",
        source: source,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    document.getElementById("exchangePanel").style.display = "none";
    document.getElementById("successMsg").classList.add("visible");
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "Continue";
    alert("Something went wrong. Please try again.");
  }
}

function downloadVCard(card) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:" + (card.fullName || ""),
  ];

  const parts = (card.fullName || "").trim().split(/\s+/);
  const last = parts.length > 1 ? parts.pop() : "";
  const first = parts.join(" ");
  lines.push("N:" + last + ";" + first + ";;;");

  if (card.phone) lines.push("TEL;TYPE=CELL:" + card.phone);
  if (card.email) lines.push("EMAIL;TYPE=INTERNET:" + card.email);
  if (card.jobTitle) lines.push("TITLE:" + card.jobTitle);
  if (card.company) lines.push("ORG:" + card.company);
  if (card.website) lines.push("URL:" + card.website);
  if (card.dob) lines.push("BDAY:" + card.dob.replace(/[^0-9]/g, ""));

  lines.push("END:VCARD");

  const vcf = lines.join("\r\n");
  const blob = new Blob([vcf], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (card.fullName || "contact").replace(/\s+/g, "_") + ".vcf";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCardImage() {
  const preview = document.getElementById("cardPreview");
  if (!preview) return;

  const canvas = document.createElement("canvas");
  const rect = preview.getBoundingClientRect();
  const scale = 2;
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  const bg = window.getComputedStyle(preview).backgroundColor;
  ctx.fillStyle = bg || "#ffffff";
  ctx.beginPath();
  ctx.roundRect(0, 0, rect.width, rect.height, 24);
  ctx.fill();

  ctx.fillStyle = window.getComputedStyle(preview).color || "#000";
  ctx.textAlign = "center";

  const card = window._cardData;
  let y = 100;

  ctx.font = "bold 28px -apple-system, sans-serif";
  ctx.fillText(card.company || "", rect.width / 2, y);
  y += 36;

  ctx.font = "18px -apple-system, sans-serif";
  ctx.fillText(card.fullName || "", rect.width / 2, y);
  y += 28;

  ctx.font = "14px -apple-system, sans-serif";
  ctx.fillStyle = "#999";
  ctx.fillText(card.jobTitle || "", rect.width / 2, y);
  y += 36;

  ctx.fillStyle = window.getComputedStyle(preview).color || "#000";
  ctx.font = "14px -apple-system, sans-serif";
  if (card.email) { ctx.fillText(card.email, rect.width / 2, y); y += 22; }
  if (card.phone) { ctx.fillText(card.phone, rect.width / 2, y); y += 22; }
  if (card.website) { ctx.fillText(card.website, rect.width / 2, y); }

  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (card.fullName || "card").replace(/\s+/g, "_") + "_card.png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function detectSource() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("src") === "nfc") return "nfc";
  if (url.searchParams.get("src") === "qr") return "qr";
  return "link";
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function isLightColor(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
