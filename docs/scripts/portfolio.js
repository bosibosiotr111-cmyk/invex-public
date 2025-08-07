import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  assets: { type: Array, default: [] }
});

export default mongoose.model('Portfolio', PortfolioSchema);

// ===== small UI helpers =====
function fmtNum(num, dec = 2) {
  return Number(num).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function showSpinner(tbody) {
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px 0"><div class="spinner"></div></td></tr>`;
  // add spinner css once
  if (!document.getElementById('spinner-style')) {
    const style = document.createElement('style');
    style.id = 'spinner-style';
    style.textContent = `.spinner{border:4px solid #222;border-top:4px solid #4da3ff;border-radius:50%;width:32px;height:32px;animation:spin 1s linear infinite}@keyframes spin{100%{transform:rotate(360deg)}}`;
    document.head.appendChild(style);
  }
}

// ===== main logic =====
(async function () {
  const userRaw = localStorage.getItem("invex_user");
  const main = document.getElementById("mainContent");
  const notice = document.getElementById("loginNotice");
  const tbody = document.querySelector("#holdings tbody");
  const pfValue = document.getElementById("pfValue");
  const pfChange = document.getElementById("pfChange");

  // Require login
  if (!userRaw) {
    if (main) main.style.display = "none";
    if (notice) notice.style.display = "block";
    return;
  }

  const user = JSON.parse(userRaw);
  if (!user?.email) {
    if (main) main.style.display = "none";
    if (notice) notice.style.display = "block";
    return;
  }

  // show loading
  showSpinner(tbody);
  if (pfValue) pfValue.textContent = "…";
  if (pfChange) pfChange.textContent = "Loading…";

  try {
    // 1) Fetch portfolio document from backend
    const portfolio = await window.api.apiGetPortfolio(user.email);
    // portfolio: { email, items: [{symbol, quantity, avgPrice}], notes, ... }

    const items = Array.isArray(portfolio.items) ? portfolio.items : [];
    if (!items.length) {
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px 0;color:#aaa">No holdings yet. Add some from your app.</td></tr>`;
      }
      if (pfValue) pfValue.textContent = "$0.00";
      if (pfChange) pfChange.textContent = "—";
      return;
    }

    // 2) Build a price lookup using CoinGecko by symbol->id mapping (fallback simple)
    // For demo, we only display stored quantities & avgPrice without live pricing,
    // unless your items have a 'price' on the server. If you want live prices, we can add them later.
    let total = 0;
    if (tbody) tbody.innerHTML = "";

    items.forEach((it) => {
      // compute value with avgPrice if no live price
      const price = Number(it.avgPrice || 0);
      const qty = Number(it.quantity || 0);
      const value = price * qty;
      total += value;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${(it.symbol || "").toUpperCase()}</td>
        <td>${fmtNum(qty, 2)}</td>
        <td>${price ? "$" + fmtNum(price, 2) : "—"}</td>
        <td>${price ? "$" + fmtNum(value, 2) : "—"}</td>
        <td>—</td>
      `;
      tbody.appendChild(tr);
    });

    if (pfValue) pfValue.textContent = "$" + fmtNum(total);
    if (pfChange) pfChange.textContent = "Change % requires live prices. (We can add next.)";
  } catch (err) {
    console.error(err);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#f44336;padding:32px 0">Failed to load portfolio: ${err.message}</td></tr>`;
    }
    if (pfValue) pfValue.textContent = "—";
    if (pfChange) pfChange.textContent = "—";
  }
})();
