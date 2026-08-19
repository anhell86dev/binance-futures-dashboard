# 🚀 Binance Trading Dashboard

Dashboard completo para trading de Binance Futures con:

- ✅ Datos de mercado en tiempo real (WebSocket)
- ✅ Gestií¢¢n de posiciones (tu cuenta)
- ✅ Trading Ideas Journal

## 📊 Features

### 1. Dashboard Principal (`index.html`)
- WebSocket en tiempo real
- Mark Price, Klines, Trades, Order Book
- Alerts de precio

### 2. Trading Ideas (`ideas.html`)
- Journal de trading
- Sistema de 5 estrellas
- Exportar a CSV

### 3. Gestií¢¢n de Operaciones (`binance_account_FINAL.html`)
- Posiciones activas
- Órdenes abiertas
- Balances
- PnL no realizado

## 🚀 Setup

### 1. Configurar Secrets
```
Settings → Secrets → New repository secret
BINANCE_API_KEY = tu_api_key
BINANCE_SECRET_KEY = tu_secret_key
```

### 2. Subir archivos
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. Activar GitHub Pages
```
Settings → Pages → Deploy from branch: main → Save
```

## 🔗 URLs

- Dashboard: `https://TU_USUARIO.github.io/tu-repo/`
- Ideas: `https://TU_USUARIO.github.io/tu-repo/ideas.html`
- Account: `https://TU_USUARIO.github.io/tu-repo/binance_account_FINAL.html`
