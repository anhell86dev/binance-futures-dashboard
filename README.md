# 🚀 Binance Trading Dashboard V1.1

Dashboard completo para trading de Binance Futures con:

- ✅ Datos de mercado en tiempo real (WebSocket)
- ✅ Gestií¢¢n de posiciones (tu cuenta de Binance)
- ✅ Trading Ideas Journal
- ✅ Integracií¢¢n con Google Sheets
- ✅ Versií¢¢n V1.1 con todas las features

## 📊 Features V1.1

### 1. Dashboard Principal (`index.html`)
- WebSocket en tiempo real
- Mark Price, Klines, Trades, Order Book
- Alerts de precio

### 2. Trading Ideas Journal (`ideas_V1.1.html`) ⭐
- Journal de trading completo
- Sistema de 5 estrellas
- Exportar a CSV
- Integracií¢¢n con Google Sheets

### 3. Gestií¢¢n de Operaciones (`binance_account_V1.1.html`) ⭐
- Posiciones activas de tu cuenta
- Órdenes abiertas
- Balances por activo
- PnL no realizado
- Auto-refresh cada 5 min

### 4. Google Sheets Integration (`js/config_V1.1.js`) ⭐
- Configuracií¢¢n centralizada
- Alerts de precio
- Lista de sí�mbolos
- Lista de streams

## 🚀 Setup V1.1

### 1. Configurar Secrets de Binance
```
Settings → Secrets → New repository secret
BINANCE_API_KEY = tu_api_key
BINANCE_SECRET_KEY = tu_secret_key
```

### 2. Configurar Google Sheets API Key (Opcional)
- Editar `js/config_V1.1.js`
- Reemplazar `TU_API_KEY_AQUI` con tu API Key de Google Sheets

### 3. Subir archivos
```bash
git add .
git commit -m "Update to V1.1 - Complete trading dashboard"
git push origin main
```

### 4. Activar GitHub Pages
```
Settings → Pages → Deploy from branch: main → Save
```

### 5. Ejecutar Workflow
```
Actions → Binance Account Data V1.1 → Run workflow
```

## 🔗 URLs

- Dashboard: `https://TU_USUARIO.github.io/tu-repo/`
- Ideas: `https://TU_USUARIO.github.io/tu-repo/ideas_V1.1.html`
- Account: `https://TU_USUARIO.github.io/tu-repo/binance_account_V1.1.html`

## 📝 Archivos V1.1

- `binance_account_api_V1.1.py` - API Binance
- `binance_account_V1.1.html` - Dashboard de cuenta
- `ideas_V1.1.html` - Trading Ideas Journal
- `js/config_V1.1.js` - Google Sheets config
- `.github/workflows/binance_account_workflow_V1.1.yml` - GitHub Actions

## ✅ Features Completas

- ✅ WebSocket en tiempo real
- ✅ Gestií¢¢n de cuenta Binance
- ✅ Trading Ideas con 5 estrellas
- ✅ Google Sheets integration
- ✅ Auto-refresh cada 5 minutos
- ✅ UI/UX mejorada
- ✅ Exportar a CSV
- ✅ Alerts de precio

**💡 Tip:** Todos los archivos V1.1 incluyen las í º ltimas mejoras y bug fixes.
