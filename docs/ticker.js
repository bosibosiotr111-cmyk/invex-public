
// Enhanced Binance streaming for header ticker (BTC/USDT) with reconnect and loading state
(function(){
  const el = document.getElementById('ticker');
  if(!el) return;
  let ws;
  let reconnectTimeout;
  function connect() {
    el.textContent = 'BTC/USDT — ...';
    ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
    ws.onmessage = (e)=>{
      try{
        const d = JSON.parse(e.data);
        const p = parseFloat(d.p);
        el.textContent = 'BTC/USDT — $' + p.toLocaleString();
      }catch(_){}
    };
    ws.onclose = () => {
      el.textContent = 'BTC/USDT — reconnecting...';
      reconnectTimeout = setTimeout(connect, 2000);
    };
    ws.onerror = () => {
      ws.close();
    };
  }
  connect();
  window.addEventListener('beforeunload', () => {
    if(ws) ws.close();
    if(reconnectTimeout) clearTimeout(reconnectTimeout);
  });
})();
