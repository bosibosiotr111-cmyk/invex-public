

// Utility: format numbers with commas and fixed decimals
function fmtNum(num, dec=2) {
  return Number(num).toLocaleString(undefined, {minimumFractionDigits: dec, maximumFractionDigits: dec});
}

// Show a loading spinner in the table
function showSpinner(table) {
  table.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px 0"><div class="spinner"></div></td></tr>`;
}

// Add spinner CSS if not present
if (!document.getElementById('spinner-style')) {
  const style = document.createElement('style');
  style.id = 'spinner-style';
  style.textContent = `.spinner{border:4px solid #222;border-top:4px solid #4da3ff;border-radius:50%;width:32px;height:32px;animation:spin 1s linear infinite}@keyframes spin{100%{transform:rotate(360deg)}}`;
  document.head.appendChild(style);
}

(async function(){
  const tbody = document.querySelector('#marketTable tbody');
  if (!tbody) return;
  showSpinner(tbody);
  try {
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch markets');
    const data = await res.json();
    tbody.innerHTML = '';
    // Map CoinGecko symbols/names to SVG filenames in assets/
    const logoMap = {
      'BTC': 'Bitcoin.svg', 'ETH': 'Ethereum.svg', 'USDT': 'Tether.svg', 'BNB': 'bnb-new.svg', 'SOL': 'Solana.svg',
      'XRP': 'XRP.svg', 'USDC': 'USDC.svg', 'ADA': 'ada-new.svg', 'DOGE': 'Dogecoin.svg', 'TON': 'Toncoin.svg',
      'TRX': 'Tron.svg', 'DOT': 'Polkadot.svg', 'MATIC': 'Polygon.svg', 'SHIB': 'ShibaInu.svg', 'LINK': 'Chainlink.svg',
      'UNI': 'Uniswap.svg', 'LTC': 'Litecoin.svg', 'BCH': 'BitcoinCash.svg', 'LEO': 'LEO.svg', 'NEAR': 'NEAR.svg',
      'XMR': 'Monero.svg', 'APT': 'Aptos.svg', 'XLM': 'Stellar.svg', 'OKB': 'OKB.svg', 'HBAR': 'Hedera.svg',
      'EOS': 'Eos.svg', 'VET': 'VeChain.svg', 'IMX': 'Immutable.svg', 'RNDR': 'Render.svg', 'ARB': 'Arbitrum.svg',
      'OP': 'Optimism.svg', 'RUNE': 'THORChain.svg', 'BTT': 'BitTorrent.svg', 'ALGO': 'Algorand.svg', 'FLOW': 'Flow.svg',
      'QNT': 'Quant.svg', 'TUSD': 'TrueUSD.svg', 'BGB': 'Bitget.svg', 'PEPE': 'Pepe.svg', 'INJ': 'Injective.svg',
      'EGLD': 'MultiversX.svg', 'STX': 'Stacks.svg', 'SNX': 'Synthetix.svg', 'GMX': 'GMX.svg', 'CRV': 'Curve.svg',
      'CFX': 'Conflux.svg', 'CHZ': 'Chiliz.svg', 'ENJ': 'Enjin.svg', 'MANA': 'Decentraland.svg', 'AAVE': 'Aave.svg',
      'STETH': 'LidoStakedEther.svg'
    };
    data.forEach((c, i)=>{
      const symbol = c.symbol.toUpperCase();
      const logoFile = logoMap[symbol] || null;
      const logoTag = logoFile
        ? `<img src="assets/${logoFile}" alt="${symbol}" style="width:22px;height:22px;vertical-align:middle;margin-right:8px;">`
        : `<span style="display:inline-block;width:22px;height:22px;vertical-align:middle;margin-right:8px;background:#eee;border-radius:50%;text-align:center;line-height:22px;font-size:0.9rem;color:#888;">?</span>`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.market_cap_rank ?? i+1}</td>
        <td>${logoTag}${c.name} <span class="badge">${symbol}</span></td>
        <td class="right">$${fmtNum(c.current_price)}</td>
        <td class="right ${c.price_change_percentage_24h>=0?'price-up':'price-down'}">${(c.price_change_percentage_24h||0).toFixed(2)}%</td>
        <td class="right">${c.market_cap_rank}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch(err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#f44336;padding:32px 0">Failed to load market data.</td></tr>`;
  }
})();
