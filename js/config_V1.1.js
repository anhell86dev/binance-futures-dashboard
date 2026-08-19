/**
 * Google Sheets Config V1.1
 * Configuracií¢¢n para conectar con Google Sheets
 */

const SPREADSHEET_ID = '1kgLQP0fM0MqykYOfGEL4PL6a8hv-la4dcvvBKNYRevA';
const GOOGLE_API_KEY = 'TU_API_KEY_AQUI';

const SHEET_NAMES = {
  SYMBOLS: 'Config_Simbolos',
  STREAMS: 'Config_Streams',
  ALERTS: 'Config_Alerts',
  IDEAS: 'IDEAS'
};

const GOOGLE_SHEETS_API_BASE = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values`;

async function getSheetData(sheetName) {
  const url = `${GOOGLE_SHEETS_API_BASE}/${sheetName}?key=${GOOGLE_API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error(`Error leyendo sheet ${sheetName}:`, error);
    return [];
  }
}

async function loadConfigFromSheets() {
  console.log('📊 Cargando configuracií¢¢n desde Google Sheets...');
  const config = { symbols: [], streams: [], alerts: [], ideas: [] };

  const symbolsData = await getSheetData(SHEET_NAMES.SYMBOLS);
  config.symbols = symbolsData.slice(1).map(row => row[0]?.trim().toLowerCase()).filter(s => s);

  const streamsData = await getSheetData(SHEET_NAMES.STREAMS);
  config.streams = streamsData.slice(1).map(row => row[0]?.trim()).filter(s => s);

  const alertsData = await getSheetData(SHEET_NAMES.ALERTS);
  config.alerts = alertsData.slice(1).map(row => ({
    symbol: row[0]?.trim().toUpperCase(),
    type: row[1]?.trim(),
    price: parseFloat(row[2]),
    enabled: row[3]?.trim().toLowerCase() === 'true'
  })).filter(a => a.symbol && a.price && a.enabled);

  console.log(`✅ ${config.symbols.length} sí�mbolos, ${config.alerts.length} alerts cargados`);
  return config;
}

window.GoogleSheetsConfig = { loadConfigFromSheets, getSheetData };
console.log('✅ Google Sheets Config V1.1 loaded');
