// ---------- Config & Items ----------
const upiId = "your_upi@bank"; // replace with actual UPI if you want real UPI QR behaviour
const shopName = "Shah general store";
const shopAddress = "Derol station road, Kalol";
const shopPhone = "9328831968";

const itemsList = [
  {name:"Milk", rate:45},{name:"Tea Powder", rate:120},{name:"Sugar", rate:50},
  {name:"Oil 1L", rate:120},{name:"Oil 500ml", rate:65},{name:"Toor Dal", rate:140},
  {name:"Moong Dal", rate:160},{name:"Chana Dal", rate:130},{name:"Besan", rate:90},
  {name:"Atta 5kg", rate:280},{name:"Maida", rate:60},{name:"Salt", rate:22},
  {name:"Turf", rate:160},{name:"Surf Excel", rate:220},{name:"Rin Powder", rate:110},
  {name:"Savlon", rate:95},{name:"Lifebuoy", rate:60},{name:"Detergent Bar", rate:18},
  {name:"Lays", rate:20},{name:"Kurkure", rate:15},{name:"Maggi", rate:12},
  {name:"Pasta", rate:80},{name:"Noodles", rate:45},{name:"Biscuit Parle G", rate:20},
  {name:"Marie Biscuit", rate:18},{name:"Good Day", rate:60},{name:"Thums Up (500ml)", rate:40},
  {name:"Pepsi (500ml)", rate:40},{name:"Sprite (500ml)", rate:40},{name:"Milk Bread", rate:30},
  {name:"Brown Bread", rate:40},{name:"Eggs 6 pcs", rate:60},{name:"Eggs 12 pcs", rate:110},
  {name:"Rice 5kg", rate:320},{name:"Rice 1kg", rate:70},{name:"Poha", rate:50},
  {name:"Suji", rate:55},{name:"Rava", rate:55},{name:"Ghee (1L)", rate:450},
  {name:"Butter", rate:120},{name:"Cheese", rate:150},{name:"Dahi", rate:50},
  {name:"Bournvita", rate:220},{name:"Horlicks", rate:320},{name:"Ketchup", rate:90},
  {name:"Pickle", rate:80},{name:"Masala (mixed)", rate:120},{name:"Haldi", rate:60},
  {name:"Mirchi Powder", rate:80}
];

let bill = []; // each item: {name, rate, qty}

// ---------- DOM ----------
const itemInput = document.getElementById("itemInput");
const datalist = document.getElementById("itemsList");
const rateInput = document.getElementById("itemRate");
const qtyInput = document.getElementById("itemQty");
const addBtn = document.getElementById("addItemBtn");
const billTableBody = document.querySelector("#billTable tbody");

const subtotalSpan = document.getElementById("subtotalAmount");
const discountInput = document.getElementById("discountInput");
const discountAmountSpan = document.getElementById("discountAmount");
const gstSelect = document.getElementById("gstSelect");
const gstSpan = document.getElementById("gstAmount");
const gstPercentSpan = document.getElementById("gstPercent");
const totalSpan = document.getElementById("totalAmount");

const customerNameEl = document.getElementById("customerName");
const customerPhoneEl = document.getElementById("customerPhone");

const generatePdfBtn = document.getElementById("generatePdfBtn");
const sharePdfBtn = document.getElementById("sharePdfBtn");
const clearBtn = document.getElementById("clearBtn");

// populate datalist with 50 items
itemsList.forEach(i=>{
  const opt = document.createElement("option");
  opt.value = i.name;
  datalist.appendChild(opt);
});

// autofill rate
itemInput.addEventListener("input", ()=>{
  const found = itemsList.find(x=>x.name.toLowerCase() === itemInput.value.trim().toLowerCase());
  if(found) rateInput.value = found.rate;
  else rateInput.value = "";
});

// add item
addBtn.addEventListener("click", ()=>{
  const name = itemInput.value.trim();
  const qty = parseFloat(qtyInput.value);
  const rate = parseFloat(rateInput.value);

  if(!name || isNaN(qty) || qty <= 0 || isNaN(rate)){
    alert("Please select item, check rate and enter valid quantity.");
    return;
  }

  const existing = bill.find(b => b.name.toLowerCase() === name.toLowerCase());
  if(existing) existing.qty += qty;
  else bill.push({name, rate, qty});

  itemInput.value = ""; rateInput.value = ""; qtyInput.value = "";
  renderBill();
});

// render bill
function renderBill(){
  billTableBody.innerHTML = "";
  let subtotal = 0;
  bill.forEach((it, idx)=>{
    const amt = it.rate * it.qty;
    subtotal += amt;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx+1}</td>
      <td style="text-align:left;padding-left:8px">${it.name}</td>
      <td>${it.qty}</td>
      <td>${it.rate.toFixed(2)}</td>
      <td>${amt.toFixed(2)}</td>
      <td><button class="remove" data-i="${idx}">Remove</button></td>
    `;
    billTableBody.appendChild(tr);
  });

  const discount = parseFloat(discountInput.value) || 0;
  const gstPercent = parseFloat(gstSelect.value) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const gst = (taxable * gstPercent) / 100;
  const total = taxable + gst;

  subtotalSpan.textContent = subtotal.toFixed(2);
  discountAmountSpan.textContent = discount.toFixed(2);
  gstPercentSpan.textContent = gstPercent;
  gstSpan.textContent = gst.toFixed(2);
  totalSpan.textContent = total.toFixed(2);

  // remove handlers
  document.querySelectorAll("button.remove").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      const i = parseInt(e.currentTarget.dataset.i, 10);
      bill.splice(i,1);
      renderBill();
    });
  });
}

discountInput.addEventListener("input", renderBill);
gstSelect.addEventListener("change", renderBill);
clearBtn.addEventListener("click", ()=>{
  if(confirm("Clear current bill?")){
    bill = [];
    renderBill();
  }
});

// ---------- PDF generation (returns Blob) ----------
async function createPdfBlob(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4", putOnlyUsedFonts: true });
  doc.setFont("times", "normal");

  let y = 40;
  // Header + logo
  try {
    const logoEl = document.getElementById("shopLogo");
    if(logoEl && logoEl.complete && logoEl.naturalWidth !== 0){
      // draw logo left
      doc.addImage(logoEl.src, "PNG", 40, 28, 50, 50);
    }
  } catch (e) {}

  doc.setFontSize(18);
  doc.setFont("times", "bold");
  doc.text(shopName, 300, y, { align: "center" });
  y += 18;
  doc.setFontSize(11);
  doc.setFont("times", "normal");
  doc.text(shopAddress, 300, y, { align: "center" });
  y += 14;
  doc.text("Phone: " + shopPhone, 300, y, { align: "center" });
  y += 20;

  // Date & Bill no
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB");
  const billNo = Math.floor(1000 + Math.random()*9000);
  doc.setFont("times", "bold");
  doc.text("Date: " + dateStr, 40, y);
  doc.text("Bill No.: " + billNo, 490, y);
  y += 18;

  // Customer
  doc.setFontSize(12);
  doc.setFont("times", "bold");
  doc.text("Customer Details", 40, y);
  y += 14;
  doc.setFont("times", "normal");
  const custName = (customerNameEl.value || "N/A").toString();
  const custPhone = (customerPhoneEl.value || "N/A").toString();
  doc.text("Name: " + custName, 40, y); y += 14;
  doc.text("Phone: " + custPhone, 40, y); y += 18;

  // Items header
  doc.setFont("times", "bold");
  doc.text("Sr", 40, y);
  doc.text("Item Name", 80, y);
  doc.text("Qty", 360, y);
  doc.text("Rate (Rs)", 420, y);
  doc.text("Amount (Rs)", 500, y);
  y += 8;
  doc.setLineWidth(0.5);
  doc.line(40, y, 560, y);
  y += 12;

  doc.setFont("times", "normal");
  let subtotal = 0;
  for(let i=0;i<bill.length;i++){
    const it = bill[i];
    const amt = it.rate * it.qty;
    subtotal += amt;

    // Split long name
    const splitName = doc.splitTextToSize(it.name, 260);
    doc.text(String(i+1), 40, y);
    doc.text(splitName, 80, y);
    doc.text(String(it.qty), 360, y);
    doc.text(it.rate.toFixed(2), 420, y);
    doc.text(amt.toFixed(2), 500, y);

    y += 14 * Math.max(1, splitName.length);

    // if near bottom, add page
    if(y > 730){
      doc.addPage();
      y = 40;
    }
  }

  y += 8;
  doc.line(40, y, 560, y);
  y += 16;

  // Totals
  const discount = parseFloat(discountInput.value) || 0;
  const gstPercent = parseFloat(gstSelect.value) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const gst = (taxable * gstPercent)/100;
  const grandTotal = taxable + gst;

  doc.setFont("times", "bold");
  doc.text("Subtotal:", 420, y);
  doc.text(subtotal.toFixed(2), 520, y);
  y += 14;
  doc.text("Discount:", 420, y);
  doc.text(discount.toFixed(2), 520, y);
  y += 14;
  doc.text(`GST (${gstPercent}%):`, 420, y);
  doc.text(gst.toFixed(2), 520, y);
  y += 18;
  doc.setFontSize(12);
  doc.text("Grand Total:", 420, y);
  doc.text(grandTotal.toFixed(2), 520, y);
  y += 28;

  // QR: try generated QR first; if not, fall back to qr.png file
  let addedQr = false;
  try {
    const qrDiv = document.createElement("div");
    const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shopName)}&am=${grandTotal.toFixed(2)}&cu=INR`;
    new QRCode(qrDiv, { text: upiString, width: 100, height: 100 });
    await new Promise(r => setTimeout(r, 200));
    const qrImg = qrDiv.querySelector("img") || qrDiv.querySelector("canvas");
    if(qrImg){
      doc.addImage(qrImg.src, "PNG", 40, y, 70, 70);
      addedQr = true;
    }
  } catch(e){ /* ignore */ }

  if(!addedQr){
    // fallback to qr.png file (user supplied)
    try {
      const img = new Image();
      img.src = "qr.png";
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = res; // continue even if not found
      });
      if(img && img.naturalWidth) doc.addImage(img.src, "PNG", 40, y, 70, 70);
    } catch(e){}
  }

  // Feedback and footer
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("Thank You for Shopping!", 300, y + 40, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("times", "normal");
  doc.text("Please give your feedback on: " + shopPhone, 300, y + 60, { align: "center" });

  // return blob
  const pdfBytes = doc.output("arraybuffer");
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  return { blob, filename: `bill_${Date.now()}.pdf` };
}

// helper: download blob
function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 1500);
}

// ---------- Generate PDF ----------
generatePdfBtn.addEventListener("click", async ()=>{
  const { blob, filename } = await createPdfBlob();
  downloadBlob(blob, filename);
  alert("PDF downloaded: " + filename);
});

// ---------- Share PDF ----------
sharePdfBtn.addEventListener("click", async ()=>{
  const { blob, filename } = await createPdfBlob();
  const file = new File([blob], filename, { type: "application/pdf" });

  // If browser supports sharing files
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `${shopName} - Bill`,
        text: `Here is your bill from ${shopName}.`
      });
      return;
    } catch (err) {
      console.warn("Share failed:", err);
    }
  }

  // fallback: download then open WhatsApp Web or Gmail compose
  downloadBlob(blob, filename);
  const whatsappMsg = encodeURIComponent(`I've generated the bill (${filename}) from ${shopName}. Please find the file attached (download then attach).`);
  const whatsappUrl = `https://web.whatsapp.com/send?text=${whatsappMsg}`;
  const gmailBody = encodeURIComponent(`Hello,\n\nPlease find the bill (${filename}) attached for your reference. (Download and attach the file saved on your device.)\n\nThanks,\n${shopName}`);
  const gmailUrl = `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(shopName + " - Bill")}&body=${gmailBody}`;

  const go = confirm("Direct file sharing not supported by your browser. PDF downloaded. Click OK to open WhatsApp Web, Cancel to open Gmail compose.");
  if(go) window.open(whatsappUrl, "_blank");
  else window.open(gmailUrl, "_blank");
});

// initial render
renderBill();

// dark mode toggle
document.getElementById("darkModeToggle").addEventListener("change", e=>{
  document.body.classList.toggle("dark-mode", e.target.checked);
});
