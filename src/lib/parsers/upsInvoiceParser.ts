import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParsedShipment = {
  tracking_number: string;
  customer_number?: string;
  service_name?: string;
  destination_country?: string;
  frt_amount: number;
  fsc_amount: number;
  acc_amount: number;
  total_amount: number;
};

type RawRow = Record<string, unknown>;

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getValue(row: RawRow, possibleKeys: string[]) {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), value])
  );

  for (const key of possibleKeys) {
    const value = normalized[normalizeKey(key)];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return "";
}

function parseAmount(value: string) {
  if (!value) return 0;

  const cleaned = value
    .replace("€", "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function classifyCharge(description: string) {
  const text = description.toLowerCase();

  if (
    text.includes("freight") ||
    text.includes("transport") ||
    text.includes("shipping") ||
    text.includes("versand")
  ) {
    return "FRT";
  }

  if (
    text.includes("fuel") ||
    text.includes("fsc") ||
    text.includes("treibstoff")
  ) {
    return "FSC";
  }

  return "ACC";
}

function rowsToShipments(rows: RawRow[]): ParsedShipment[] {
  const grouped = new Map<string, ParsedShipment>();

  for (const row of rows) {
    const tracking = getValue(row, [
      "Tracking Number",
      "Tracking",
      "Sendungsnummer",
      "Paketnummer",
      "Waybill",
    ]);

    if (!tracking) continue;

    const amount = parseAmount(
      getValue(row, ["Amount", "Betrag", "Net Amount", "Charge Amount"])
    );

    const description = getValue(row, [
      "Charge Description",
      "Description",
      "Beschreibung",
      "Charge",
    ]);

    const customer = getValue(row, [
      "Customer Number",
      "Kundennummer",
      "Account Number",
    ]);

    const service = getValue(row, [
      "Service",
      "Service Name",
      "Serviceart",
      "Product",
    ]);

    const country = getValue(row, [
      "Destination Country",
      "Land",
      "Country",
      "Empfängerland",
    ]);

    const chargeType = classifyCharge(description);

    const existing =
      grouped.get(tracking) ??
      {
        tracking_number: tracking,
        customer_number: customer,
        service_name: service,
        destination_country: country,
        frt_amount: 0,
        fsc_amount: 0,
        acc_amount: 0,
        total_amount: 0,
      };

    if (chargeType === "FRT") existing.frt_amount += amount;
    if (chargeType === "FSC") existing.fsc_amount += amount;
    if (chargeType === "ACC") existing.acc_amount += amount;

    existing.total_amount =
      existing.frt_amount + existing.fsc_amount + existing.acc_amount;

    grouped.set(tracking, existing);
  }

  return Array.from(grouped.values());
}

export async function parseUpsInvoiceFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    const text = await file.text();

    const result = Papa.parse<RawRow>(text, {
      header: true,
      skipEmptyLines: true,
    });

    return rowsToShipments(result.data);
  }

  if (extension === "xlsx" || extension === "xls") {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const firstSheet = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheet];
    const rows = XLSX.utils.sheet_to_json<RawRow>(sheet);

    return rowsToShipments(rows);
  }

  throw new Error("Dateityp wird noch nicht unterstützt. Bitte CSV oder Excel hochladen.");
}
