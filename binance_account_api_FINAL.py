#!/usr/bin/env python3
"""
Binance Futures Account API - GitHub Actions
"""

import os
import json
import hmac
import hashlib
import time
import requests
from datetime import datetime
from typing import List, Dict, Any, Optional

BINANCE_API_KEY = os.getenv('BINANCE_API_KEY')
BINANCE_SECRET_KEY = os.getenv('BINANCE_SECRET_KEY')
BASE_URL = 'https://fapi.binance.com'

def generate_signature(query_string: str, secret_key: str) -> str:
    return hmac.new(
        secret_key.encode('utf-8'),
        query_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

def get_timestamp() -> int:
    return int(time.time() * 1000)

def signed_request(endpoint: str, method: str = 'GET', params: Optional[Dict] = None) -> Dict:
    if params is None:
        params = {}

    timestamp = get_timestamp()
    params['timestamp'] = timestamp
    query_string = '&'.join([f"{k}={v}" for k, v in sorted(params.items())])
    signature = generate_signature(query_string, BINANCE_SECRET_KEY)

    url = f"{BASE_URL}{endpoint}"
    if method == 'GET':
        url += f"?{query_string}&signature={signature}"

    headers = {'X-MBX-APIKEY': BINANCE_API_KEY, 'Content-Type': 'application/json'}

    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=10)
        elif method == 'POST':
            params['signature'] = signature
            response = requests.post(url, headers=headers, data=params, timeout=10)

        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error: {e}")
        raise

def get_position_risk() -> List[Dict]:
    try:
        positions = signed_request('/fapi/v2/positionRisk')
        active = [p for p in positions if float(p['positionAmt']) != 0]
        return [{
            'symbol': p['symbol'],
            'side': 'LONG' if p['positionSide'] == 'LONG' else 'SHORT',
            'size': float(p['positionAmt']),
            'entryPrice': float(p['entryPrice']),
            'markPrice': float(p['markPrice']),
            'unrealizedPnL': float(p['unRealizedProfit']),
            'leverage': int(p['leverage']),
            'marginType': 'Isolated' if p['marginType'] == 'isolated' else 'Cross',
            'liquidationPrice': float(p['liquidationPrice']),
            'notional': float(p['notional']),
            'percentage': round(((float(p['markPrice']) - float(p['entryPrice'])) / float(p['entryPrice'])) * 100, 2)
        } for p in active]
    except Exception as e:
        print(f"Error: {e}")
        return []

def get_account_info() -> Optional[Dict]:
    try:
        info = signed_request('/fapi/v2/account')
        assets = [{
            'asset': a['asset'],
            'walletBalance': float(a['walletBalance']),
            'unrealizedProfit': float(a['unrealizedProfit']),
            'marginBalance': float(a['marginBalance']),
            'availableBalance': float(a['availableBalance'])
        } for a in info['assets'] if float(a['walletBalance']) > 0 or float(a['unrealizedProfit']) != 0]

        return {
            'totalWalletBalance': float(info['totalWalletBalance']),
            'totalUnrealizedProfit': float(info['totalUnrealizedProfit']),
            'totalMarginBalance': float(info['totalMarginBalance']),
            'availableBalance': float(info['availableBalance']),
            'assets': assets
        }
    except Exception as e:
        print(f"Error: {e}")
        return None

def get_open_orders() -> List[Dict]:
    try:
        orders = signed_request('/fapi/v1/openOrders')
        return [{
            'symbol': o['symbol'],
            'orderId': o['orderId'],
            'side': o['side'],
            'type': o['type'],
            'price': float(o['price']),
            'quantity': float(o['origQty']),
            'executedQty': float(o['executedQty']),
            'status': o['status'],
            'time': datetime.fromtimestamp(o['time'] / 1000).isoformat()
        } for o in orders]
    except Exception as e:
        print(f"Error: {e}")
        return []

def get_all_account_data() -> Dict:
    print("Obteniendo datos...")
    account = get_account_info()
    positions = get_position_risk()
    orders = get_open_orders()

    data = {
        'success': True,
        'timestamp': datetime.utcnow().isoformat(),
        'account': account,
        'positions': positions,
        'openOrders': orders,
        'summary': {
            'totalPositions': len(positions),
            'totalOpenOrders': len(orders),
            'totalUnrealizedPnL': account['totalUnrealizedProfit'] if account else 0,
            'longPositions': len([p for p in positions if p['side'] == 'LONG']),
            'shortPositions': len([p for p in positions if p['side'] == 'SHORT'])
        }
    }

    print(f"Posiciones: {len(positions)}, Órdenes: {len(orders)}, PnL: ${data['summary']['totalUnrealizedPnL']:.2f}")
    return data

if __name__ == '__main__':
    if not BINANCE_API_KEY or not BINANCE_SECRET_KEY:
        print("❌ Error: Configurar BINANCE_API_KEY y BINANCE_SECRET_KEY")
        exit(1)

    data = get_all_account_data()

    with open('account_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✅ Datos guardados en account_data.json")
