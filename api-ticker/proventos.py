import asyncio
import aiohttp
import pandas as pd
from bs4 import BeautifulSoup
from functools import partial
from typing import List, Dict
from datetime import datetime, timedelta
from cache_decorator import cache_memory
from ticker_data_history import fetch_ticker_history_price


def html_to_dataframe(html: str) -> pd.DataFrame:
    soup = BeautifulSoup(html, 'lxml')
    table = soup.find('table', id='resultado')
    if not table:
        return pd.DataFrame()

    rows = []
    headers = [th.text.strip() for th in table.find_all('th')]
    for tr in table.find_all('tr')[1:]:
        vals = [td.text.strip() for td in tr.find_all('td')]
        if vals:
            rows.append(vals)

    return pd.DataFrame(rows, columns=headers)


async def parse_proventos(html: str, start_dt: datetime, end_dt: datetime, papel: str) -> List[Dict]:
    loop = asyncio.get_running_loop()
    df = await loop.run_in_executor(None, partial(html_to_dataframe, html))

    if df.empty:
        return []

    colunas_map = {
        'Última Data Com': 'date_com',
        'Data de Pagamento': 'payment_date',
        'Valor': 'value',
    }
    cols_present = [c for c in colunas_map if c in df.columns]
    if not cols_present:
        return []

    df = df.loc[:, cols_present].rename(columns=colunas_map)

    df['value'] = (
        df['value']
        .str.replace('.', '', regex=False)
        .str.replace(',', '.', regex=False)
        .astype(float)
    )
    df['payment_date'] = pd.to_datetime(df['payment_date'], format='%d/%m/%Y', errors='coerce')
    df['date_com'] = pd.to_datetime(df['date_com'], format='%d/%m/%Y', errors='coerce')
    df = df.dropna(subset=['payment_date'])

    mask = (df['payment_date'] >= start_dt) & (df['payment_date'] <= end_dt)
    df = df.loc[mask].copy()

    if df.empty:
        return []

    try:
        hist_start = (start_dt - timedelta(days=45)).strftime("%Y-%m-%d")
        hist_end = end_dt.strftime("%Y-%m-%d")
        base_data = fetch_ticker_history_price([papel], hist_start, hist_end)
        base_map: Dict[str, float] = {
            v['data']: float(v['valor'])
            for v in base_data[0]['valores']
        }
    except Exception:
        base_map = {}

    proventos = []
    for _, row in df.iterrows():
        valor_float = row['value']
        date_key = row['date_com'].strftime("%Y-%m-%d")
        base = base_map.get(date_key)
        percentual = (valor_float / base * 100) if base and base > 0 else 0.0

        proventos.append({
            "value": valor_float,
            "payment_date": row['payment_date'].strftime("%d/%m/%Y"),
            "date_com": row['date_com'].strftime("%d/%m/%Y"),
            "percent": f"{percentual:.4f}",
        })

    return proventos


@cache_memory(maxsize=500, ttl_seconds=86400)
async def fetch_papel_html(papel: str, tipo: int) -> str:
    prefix = 'fii_' if tipo == 1 else ''
    url = f"https://www.fundamentus.com.br/{prefix}proventos.php?papel={papel}&tipo=2"

    async with aiohttp.ClientSession(headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }) as session:
        async with session.get(url, timeout=20) as response:
            return await response.text()


async def fetch_papel(papel: str, tipo: int, start_dt: datetime, end_dt: datetime) -> Dict:
    try:
        html = await fetch_papel_html(papel, tipo)
        proventos = await parse_proventos(html, start_dt, end_dt, papel)
    except Exception as e:
        print(f"Erro ao processar {papel}: {e}")
        proventos = []

    return {"ticker": papel, "proventos": proventos}


async def fetch_proventos_async(
    papeis_tipos: List[Dict[str, int]],
    start_date: str,
    end_date: str,
) -> List[Dict]:
    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")

    results = await asyncio.gather(*[
        fetch_papel(item["papel"], item["tipo"], start_dt, end_dt)
        for item in papeis_tipos
    ])
    return results


@cache_memory(maxsize=100, ttl_seconds=300)
def fetch_proventos(
    papeis_tipos: List[Dict[str, int]],
    start_date: str,
    end_date: str,
) -> List[Dict]:
    return asyncio.run(fetch_proventos_async(papeis_tipos, start_date, end_date))
