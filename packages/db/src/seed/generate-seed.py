import json
import re
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "..", ".."))
MOCK_DATA_PATH = os.path.join(PROJECT_ROOT, "apps", "api", "src", "services", "mock-data.ts")
JSON_PATH = "/tmp/pala_plano_contas_full.json"
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "seed.sql")


def escape_sql(s):
    if s is None:
        return "NULL"
    return "'" + s.replace("'", "''") + "'"


def load_accounts_from_json():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)

    accounts = []
    for i, item in enumerate(raw):
        accounts.append({
            "code": item["code"],
            "name": item["name"],
            "parent_code": item.get("parentCode"),
            "nature": item["nature"],
            "sign": item["sign"],
            "level": item["level"],
            "is_total": item["isTotal"],
            "order_index": (i + 1) * 10,
            "category_code": None,
        })

    return accounts


def load_accounts_from_mock():
    with open(MOCK_DATA_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    accounts_match = re.search(
        r"export const ACCOUNTS:\s*MockAccount\[\]\s*=\s*\[(.*?)\n\]",
        content,
        re.DOTALL,
    )
    if not accounts_match:
        raise ValueError("Could not find ACCOUNTS array in mock-data.ts")

    accounts_text = accounts_match.group(1)
    accounts = []
    for m in re.finditer(
        r"\{\s*code:\s*\"([^\"]*)\"\s*,\s*name:\s*\"([^\"]*)\"\s*,\s*parentCode:\s*(null|\"[^\"]*\")\s*,\s*nature:\s*\"([^\"]*)\"\s*,\s*sign:\s*(-?\d+)\s*,\s*level:\s*(\d+)\s*,\s*isTotal:\s*(true|false)\s*,\s*orderIndex:\s*(\d+)(?:\s*,\s*categoryCode:\s*\"([^\"]*)\")?",
        accounts_text,
    ):
        parent = m.group(3)
        if parent == "null":
            parent = None
        else:
            parent = parent.strip('"')

        accounts.append({
            "code": m.group(1),
            "name": m.group(2),
            "parent_code": parent,
            "nature": m.group(4),
            "sign": int(m.group(5)),
            "level": int(m.group(6)),
            "is_total": m.group(7) == "true",
            "order_index": int(m.group(8)),
            "category_code": m.group(9) if m.group(9) else None,
        })

    return accounts


def load_entries_from_mock():
    with open(MOCK_DATA_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    entries_match = re.search(
        r"const RAW_ENTRIES:\s*Array<[^>]*>\s*=\s*\[(.*?)\n\]",
        content,
        re.DOTALL,
    )
    if not entries_match:
        raise ValueError("Could not find RAW_ENTRIES array in mock-data.ts")

    entries_text = entries_match.group(1)
    entries = []
    for m in re.finditer(
        r'\{\s*code:\s*"([^"]*)"\s*,\s*period:\s*"([^"]*)"\s*,\s*amount:\s*([\d.]+)\s*,\s*desc:\s*"([^"]*)"\s*\}',
        entries_text,
    ):
        entries.append({
            "code": m.group(1),
            "period": m.group(2),
            "amount": float(m.group(3)),
            "desc": m.group(4),
        })

    return entries


def build_category_code(code, accounts_by_code):
    parts = code.split(".")
    if len(parts) <= 2:
        return code if len(parts) == 2 else code
    return ".".join(parts[:2])


def main():
    mock_accounts = load_accounts_from_mock()
    mock_accounts_by_code = {a["code"]: a for a in mock_accounts}

    try:
        json_accounts = load_accounts_from_json()
    except FileNotFoundError:
        json_accounts = []

    json_accounts_by_code = {a["code"]: a for a in json_accounts}

    final_accounts = []
    seen_codes = set()

    for a in mock_accounts:
        seen_codes.add(a["code"])
        final_accounts.append(a)

    for a in json_accounts:
        if a["code"] not in seen_codes:
            seen_codes.add(a["code"])
            cat = build_category_code(a["code"], json_accounts_by_code)
            a["category_code"] = cat if cat != a["code"] else None
            max_order = max((x["order_index"] for x in final_accounts), default=0)
            a["order_index"] = max_order + 10
            final_accounts.append(a)

    entries = load_entries_from_mock()

    codes_in_order = set()
    def resolve_parents(code):
        if code in codes_in_order:
            return
        acc = {a["code"]: a for a in final_accounts}.get(code)
        if acc and acc["parent_code"]:
            resolve_parents(acc["parent_code"])
        codes_in_order.add(code)

    ordered = []
    for a in final_accounts:
        resolve_parents(a["code"])

    accounts_map = {a["code"]: a for a in final_accounts}
    for code in codes_in_order:
        if code in accounts_map:
            ordered.append(accounts_map[code])

    final_ordered = []
    remaining = list(final_accounts)
    inserted = set()

    def insert_with_deps(acc):
        if acc["code"] in inserted:
            return
        if acc["parent_code"] and acc["parent_code"] not in inserted:
            parent = accounts_map.get(acc["parent_code"])
            if parent:
                insert_with_deps(parent)
        inserted.add(acc["code"])
        final_ordered.append(acc)

    for a in final_accounts:
        insert_with_deps(a)

    lines = []
    lines.append("BEGIN;")
    lines.append("")

    for a in final_ordered:
        parent_val = escape_sql(a["parent_code"])
        cat_val = escape_sql(a.get("category_code"))
        lines.append(
            f"INSERT INTO dre_accounts (code, name, parent_code, nature, sign, level, is_total, order_index, category_code) "
            f"VALUES ({escape_sql(a['code'])}, {escape_sql(a['name'])}, {parent_val}, {escape_sql(a['nature'])}, "
            f"{a['sign']}, {a['level']}, {str(a['is_total']).upper()}, {a['order_index']}, {cat_val}) "
            f"ON CONFLICT (code) DO NOTHING;"
        )

    lines.append("")

    for i, e in enumerate(entries, 1):
        period_date = e["period"] + "-01"
        source_id = f"mock-{i}"
        # Regime caixa: mock assume baixa no proprio mes de competencia (period_caixa = period).
        lines.append(
            f"INSERT INTO dre_entries (account_code, period, amount, description, source, source_id, period_caixa) "
            f"VALUES ({escape_sql(e['code'])}, '{period_date}', {e['amount']:.2f}, {escape_sql(e['desc'])}, 'mock', {escape_sql(source_id)}, '{period_date}') "
            f"ON CONFLICT (source_id) DO NOTHING;"
        )

    lines.append("")
    lines.append("COMMIT;")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"Generated {len(final_ordered)} accounts and {len(entries)} entries to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
