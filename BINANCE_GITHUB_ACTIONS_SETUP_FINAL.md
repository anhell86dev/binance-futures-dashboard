# 📊 Gestií¢¢n de Operaciones - Setup Rá¡¡pido

## 🔐 Paso 1: Configurar Secrets

1. Ve a tu repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Agrega:
   - **Name:** `BINANCE_API_KEY`
   - **Value:** Tu API Key de Binance
4. Repite para:
   - **Name:** `BINANCE_SECRET_KEY`
   - **Value:** Tu Secret Key

## 📝 Paso 2: Subir Archivos

```bash
git add .
git commit -m "Add Binance account management"
git push origin main
```

## 🚀 Paso 3: Ejecutar

1. Ve a **Actions** → **Binance Account Data**
2. Click **Run workflow**
3. Espera 1-2 minutos

## 🌐 Paso 4: Ver Dashboard

Abre: `https://TU_USUARIO.github.io/tu-repo/binance_account_FINAL.html`

## ⚠️ Tips

- Secrets nunca se muestran en logs
- Workflow se ejecuta cada 5 minutos automá·¢ticamente
- Dashboard se actualiza solo cada 5 minutos
