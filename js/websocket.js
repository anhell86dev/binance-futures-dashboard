/**
 * Binance Futures WebSocket Dashboard
 * Conecta a los streams de mercado de Binance USDⓈ-M Futures
 */

// ==================== CONFIGURACION ====================
const BASE_WSS = 'wss://fstream.binance.com/market/stream';
let ws = null;
let messageCount = 0;
let activeSymbols = new Set();

// ==================== ELEMENTOS DOM ====================
const symbolsInput = document.getElementById('symbols');
const streamTypeSelect = document.getElementById('streamType');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const connectionStatus = document.getElementById('connectionStatus');
const dashboardGrid = document.getElementById('dashboardGrid');
const logContainer = document.getElementById('logContainer');
const activeSymbolsEl = document.getElementById('activeSymbols');
const messagesReceivedEl = document.getElementById('messagesReceived');
const lastUpdateEl = document.getElementById('lastUpdate');
const wsStatusEl = document.getElementById('wsStatus');

// ==================== FUNCIONES DE CONEXION ====================

/**
 * Conecta al WebSocket de Binance
 */
function connect() {
  const symbolsValue = symbolsInput.value.trim();
  const streamType = streamTypeSelect.value;
  
  if (!symbolsValue) {
    alert('⚠️ Por favor ingresa al menos un sí�mbolo');
    return;
  }
  
  // Parsear sí�mbolos
  const symbols = symbolsValue.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
  if (symbols.length === 0) {
    alert('⚠️ Sí�mbolos invá·¢lidos');
    return;
  }
  
  // Construir streams
  const streams = symbols.map(sym => `${sym}@${streamType}`);
  const url = `${BASE_WSS}?streams=${streams.join('/')}`;
  
  log(`🔌 Conectando a ${streams.length} streams...`, 'info');
  log(`URL: ${url}`, 'debug');
  
  // Crear WebSocket
  ws = new WebSocket(url);
  
  // Event handlers
  ws.onopen = handleOpen;
  ws.onmessage = handleMessage;
  ws.onclose = handleClose;
  ws.onerror = handleError;
  
  // Actualizar UI
  connectBtn.disabled = true;
  disconnectBtn.disabled = false;
  symbolsInput.disabled = true;
  streamTypeSelect.disabled = true;
}

/**
 * Desconecta del WebSocket
 */
function disconnect() {
  if (ws) {
    log('🔌 Desconectando...', 'info');
    ws.close();
    ws = null;
  }
}

// ==================== EVENT HANDLERS ====================

function handleOpen(event) {
  log('✅ Conexií¢¢n establecida exitosamente', 'success');
  connectionStatus.classList.add('connected');
  connectionStatus.querySelector('.status-text').textContent = 'Conectado';
  wsStatusEl.textContent = 'Conectado';
  wsStatusEl.style.color = 'var(--success)';
}

function handleMessage(event) {
  try {
    const data = JSON.parse(event.data);
    messageCount++;
    
    // Actualizar contador
    messagesReceivedEl.textContent = messageCount.toLocaleString();
    lastUpdateEl.textContent = new Date().toLocaleTimeString();
    
    // Extraer sí�mbolo del stream
    if (data.stream) {
      const symbol = data.stream.split('@')[0].toUpperCase();
      activeSymbols.add(symbol);
      activeSymbolsEl.textContent = activeSymbols.size;
    }
    
    // Procesar datos
    processData(data);
    
    log(`📥 Datos recibidos: ${data.stream || 'unknown'}`, 'info');
  } catch (error) {
    log(`❌ Error procesando mensaje: ${error.message}`, 'error');
  }
}

function handleClose(event) {
  log(`❌ Conexií¢¢n cerrada (code: ${event.code})`, 'warning');
  connectionStatus.classList.remove('connected');
  connectionStatus.querySelector('.status-text').textContent = 'Desconectado';
  wsStatusEl.textContent = 'Desconectado';
  wsStatusEl.style.color = 'var(--danger)';
  
  // Resetear UI
  connectBtn.disabled = false;
  disconnectBtn.disabled = true;
  symbolsInput.disabled = false;
  streamTypeSelect.disabled = false;
  
  ws = null;
}

function handleError(event) {
  log(`⚠️ Error en WebSocket: ${event.type}`, 'error');
}

// ==================== PROCESAMIENTO DE DATOS ====================

/**
 * Procesa los datos recibidos y actualiza el dashboard
 */
function processData(data) {
  if (!data.data) return;
  
  const streamData = data.data;
  const eventType = streamData.e;
  
  switch (eventType) {
    case 'markPriceUpdate':
      updateMarkPriceCard(streamData);
      break;
    case 'kline':
      updateKlineCard(streamData);
      break;
    case 'aggTrade':
      updateTradeCard(streamData);
      break;
    case 'bookTicker':
      updateBookTickerCard(streamData);
      break;
    case '24hrTicker':
      updateTickerCard(streamData);
      break;
    case 'miniTicker':
      updateMiniTickerCard(streamData);
      break;
    default:
      updateGenericCard(data);
  }
}

// ==================== ACTUALIZACION DE CARDS ====================

/**
 * Actualiza card de Mark Price
 */
function updateMarkPriceCard(data) {
  const symbol = data.s;
  const cardId = `card-${symbol}-markPrice`;
  
  const cardData = {
    title: `${symbol}`,
    badge: 'Mark Price',
    rows: [
      { label: 'Mark Price', value: formatPrice(parseFloat(data.p)) },
      { label: 'Index Price', value: formatPrice(parseFloat(data.i)) },
      { label: 'Funding Rate', value: `${(parseFloat(data.r) * 100).toFixed(4)}%` },
      { label: 'Next Funding', value: formatTime(data.T) },
      { label: 'Actualizado', value: new Date().toLocaleTimeString() }
    ]
  };
  
  updateCard(cardId, cardData);
}

/**
 * Actualiza card de Kline/Candlestick
 */
function updateKlineCard(data) {
  const symbol = data.s;
  const kline = data.k;
  const cardId = `card-${symbol}-kline-${kline.i}`;
  
  const isUp = parseFloat(kline.c) >= parseFloat(kline.o);
  const priceClass = isUp ? 'price-up' : 'price-down';
  const change = ((parseFloat(kline.c) - parseFloat(kline.o)) / parseFloat(kline.o) * 100).toFixed(2);
  
  const cardData = {
    title: `${symbol} - ${kline.i}`,
    badge: `Kline ${kline.i}`,
    rows: [
      { label: 'Open', value: formatPrice(parseFloat(kline.o)) },
      { label: 'High', value: formatPrice(parseFloat(kline.h)) },
      { label: 'Low', value: formatPrice(parseFloat(kline.l)) },
      { label: 'Close', value: `<span class="${priceClass}">${formatPrice(parseFloat(kline.c))}</span>` },
      { label: 'Cambio', value: `<span class="${priceClass}">${change > 0 ? '+' : ''}${change}%</span>` },
      { label: 'Volume', value: formatVolume(parseFloat(kline.v)) },
      { label: 'Trades', value: parseInt(kline.n).toLocaleString() }
    ]
  };
  
  updateCard(cardId, cardData);
}

/**
 * Actualiza card de Aggregate Trade
 */
function updateTradeCard(data) {
  const symbol = data.s;
  const cardId = `card-${symbol}-aggTrade`;
  
  const isBuyerMaker = data.m;
  const side = isBuyerMaker ? 'SELL' : 'BUY';
  const sideClass = isBuyerMaker ? 'price-down' : 'price-up';
  
  const cardData = {
    title: `${symbol}`,
    badge: 'Trade',
    rows: [
      { label: 'Price', value: `<span class="${sideClass}">${formatPrice(parseFloat(data.p))}</span>` },
      { label: 'Quantity', value: parseFloat(data.q).toFixed(4) },
      { label: 'Side', value: `<span class="${sideClass}">${side}</span>` },
      { label: 'Time', value: formatTime(data.T) },
      { label: 'Trade ID', value: data.a.toString() }
    ]
  };
  
  updateCard(cardId, cardData);
}

/**
 * Actualiza card de Book Ticker
 */
function updateBookTickerCard(data) {
  const symbol = data.s;
  const cardId = `card-${symbol}-bookTicker`;
  
  const cardData = {
    title: `${symbol}`,
    badge: 'Book Ticker',
    rows: [
      { label: 'Best Bid', value: `<span class="price-up">${formatPrice(parseFloat(data.b))}</span>` },
      { label: 'Bid Qty', value: parseFloat(data.B).toFixed(4) },
      { label: 'Best Ask', value: `<span class="price-down">${formatPrice(parseFloat(data.a))}</span>` },
      { label: 'Ask Qty', value: parseFloat(data.A).toFixed(4) },
      { label: 'Spread', value: formatPrice(parseFloat(data.a) - parseFloat(data.b)) }
    ]
  };
  
  updateCard(cardId, cardData);
}

/**
 * Actualiza card de 24h Ticker
 */
function updateTickerCard(data) {
  const symbol = data.s;
  const cardId = `card-${symbol}-ticker`;
  
  const isUp = parseFloat(data.P) >= 0;
  const priceClass = isUp ? 'price-up' : 'price-down';
  
  const cardData = {
    title: `${symbol}`,
    badge: '24h Ticker',
    rows: [
      { label: 'Last Price', value: formatPrice(parseFloat(data.c)) },
      { label: 'Change', value: `<span class="${priceClass}">${parseFloat(data.P).toFixed(2)}%</span>` },
      { label: 'High', value: formatPrice(parseFloat(data.h)) },
      { label: 'Low', value: formatPrice(parseFloat(data.l)) },
      { label: 'Volume', value: formatVolume(parseFloat(data.v)) },
      { label: 'Quote Vol', value: formatVolume(parseFloat(data.q)) },
      { label: 'Trades', value: parseInt(data.n).toLocaleString() }
    ]
  };
  
  updateCard(cardId, cardData);
}

/**
 * Actualiza card de Mini Ticker
 */
function updateMiniTickerCard(data) {
  const symbol = data.s;
  const cardId = `card-${symbol}-miniTicker`;
  
  const isUp = parseFloat(data.P) >= 0;
  const priceClass = isUp ? 'price-up' : 'price-down';
  
  const cardData = {
    title: `${symbol}`,
    badge: 'Mini Ticker',
    rows: [
      { label: 'Last Price', value: formatPrice(parseFloat(data.c)) },
      { label: 'Change', value: `<span class="${priceClass}">${parseFloat(data.P).toFixed(2)}%</span>` },
      { label: 'High', value: formatPrice(parseFloat(data.h)) },
      { label: 'Low', value: formatPrice(parseFloat(data.l)) },
      { label: 'Volume', value: formatVolume(parseFloat(data.v)) }
    ]
  };
  
  updateCard(cardId, cardData);
}

/**
 * Actualiza card gení©©rica para streams no soportados
 */
function updateGenericCard(data) {
  const stream = data.stream || 'unknown';
  const cardId = `card-${stream.replace(/[@.]/g, '-')}`;
  
  const cardData = {
    title: stream,
    badge: 'Generic',
    rows: [
      { label: 'Data', value: JSON.stringify(data.data).substring(0, 100) + '...' }
    ]
  };
  
  updateCard(cardId, cardData);
}

// ==================== UTILIDADES DE UI ====================

/**
 * Actualiza o crea una card en el dashboard
 */
function updateCard(cardId, cardData) {
  let card = document.getElementById(cardId);
  
  if (!card) {
    // Crear nueva card
    card = document.createElement('div');
    card.id = cardId;
    card.className = 'card';
    dashboardGrid.appendChild(card);
  }
  
  // Actualizar contenido
  card.innerHTML = `
    <div class="card-header">
      <div class="card-title">${cardData.title}</div>
      <div class="card-badge badge-${cardData.badge.toLowerCase().replace(/\s/g, '_')}">${cardData.badge}</div>
    </div>
    <div class="card-body">
      ${cardData.rows.map(row => `
        <div class="data-row">
          <span class="data-label">${row.label}</span>
          <span class="data-value">${row.value}</span>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Limpia todo el dashboard
 */
function clearDashboard() {
  dashboardGrid.innerHTML = '';
  activeSymbols.clear();
  activeSymbolsEl.textContent = '0';
  messageCount = 0;
  messagesReceivedEl.textContent = '0';
  log('🧹 Dashboard limpiado', 'info');
}

/**
 * Limpia el log
 */
function clearLog() {
  logContainer.innerHTML = '';
  log('🧹 Log limpiado', 'info');
}

/**
 * Agrega entrada al log
 */
function log(message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  
  const timeSpan = document.createElement('span');
  timeSpan.className = 'log-time';
  timeSpan.textContent = new Date().toLocaleTimeString();
  
  const msgSpan = document.createElement('span');
  msgSpan.className = 'log-message';
  msgSpan.textContent = message;
  
  // Colores por tipo
  const colors = {
    'success': 'var(--success)',
    'error': 'var(--danger)',
    'warning': 'var(--warning)',
    'info': 'var(--info)',
    'debug': 'var(--text-muted)'
  };
  
  if (colors[type]) {
    msgSpan.style.color = colors[type];
  }
  
  entry.appendChild(timeSpan);
  entry.appendChild(msgSpan);
  logContainer.appendChild(entry);
  
  // Auto-scroll al íšltimo
  logContainer.scrollTop = logContainer.scrollHeight;
  
  // Limitar entries
  const maxEntries = 100;
  while (logContainer.children.length > maxEntries) {
    logContainer.removeChild(logContainer.firstChild);
  }
}

// ==================== FORMATO ====================

/**
 * Formatea precios según el rango
 */
function formatPrice(price) {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 1) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  } else {
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }
}

/**
 * Formatea volíº·menes grandes
 */
function formatVolume(volume) {
  if (volume >= 1e9) {
    return (volume / 1e9).toFixed(2) + 'B';
  } else if (volume >= 1e6) {
    return (volume / 1e6).toFixed(2) + 'M';
  } else if (volume >= 1e3) {
    return (volume / 1e3).toFixed(2) + 'K';
  } else {
    return volume.toFixed(2);
  }
}

/**
 * Formatea timestamp
 */
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString();
}

// ==================== CLEANUP ====================

// Auto-desconectar al cerrar la pá�gina
window.addEventListener('beforeunload', () => {
  if (ws) {
    log('🔌 Cerrando conexií¢¢n...', 'info');
    ws.close();
  }
});

// ==================== INIT ====================

log('🚀 Dashboard inicializado', 'success');
log('📝 Ingresa sí�mbolos y selecciona stream para conectar', 'info');