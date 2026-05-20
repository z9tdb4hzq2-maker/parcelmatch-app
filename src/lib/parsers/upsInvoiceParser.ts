import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParsedShipment = {
  tracking_number: string;
  customer_number?: string;
  invoice_number?: string;
  service_name?: string;
  destination_country?: string;
  receiver_address?: string;
  frt_amount: number;
  fsc_amount: number;
  acc_amount: number;
  total_amount: number;
};

type RawRow = unknown[];

// UPS Dictionary: 1-based column numbers
const COL_CUSTOMER_NUMBER = 3;
const COL_INVOICE_NUMBER = 6;
const COL_TRACKING_NUMBER = 14;
const COL_CHARGE_CLASSIFICATION = 44;
const COL_CHARGE_DESCRIPTION = 46;
const COL_AMOUNT = 52;
const COL_RECEIVER_ADDRESS_START = 75;
const COL_RECEIVER_ADDRESS_END = 82;
const COL_DESTINATION_COUNTRY = 82;

function getColumn(row: RawRow, columnNumber: number) {
  const value = row[columnNumber - 1];
  return value === undefined || value === null ? "" : String(value).trim();
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

function normalizeChargeType(value: string) {
  const code = value.trim().toUpperCase();

  if (code === "FRT") return "FRT";
  if (code === "FSC") return "FSC";
  if (code === "ACC") return "ACC";

  return "OTHER";
}

function buildReceiverAddress(row: RawRow) {
  const parts: string[] = [];

  for (
    let column = COL_RECEIVER_ADDRESS_START;
    column <= COL_RECEIVER_ADDRESS_END;
    column++
  ) {
    const value = getColumn(row, column);
    if (value) parts.push(value);
  }

  return parts.join(", ");
}

function rowsToShipments(rows: RawRow[]) {
  const grouped = new Map<string, ParsedShipment>();

  for (const row of rows) {
    const trackingNumber = getColumn(row, COL_TRACKING_NUMBER);

    if (!trackingNumber) continue;

    const customerNumber = getColumn(row, COL_CUSTOMER_NUMBER);
    const invoiceNumber = getColumn(row, COL_INVOICE_NUMBER);
    const chargeCode = getColumn(row, COL_CHARGE_CLASSIFICATION);
    const chargeDescription = getColumn(row, COL_CHARGE_DESCRIPTION);
    const amount = parseAmount(getColumn(row, COL_AMOUNT));
    const destinationCountry = getColumn(row, COL_DESTINATION_COUNTRY);
    const receiverAddress = buildReceiverAddress(row);

    const chargeType = normalizeChargeType(chargeCode);

    const existing =
      grouped.get(trackingNumber) ??
      {
        tracking_number: trackingNumber,
        customer_number: customerNumber,
        invoice_number: invoiceNumber,
        service_name: chargeDescription,
        destination_country: destinationCountry,
        receiver_address: receiverAddress,
        frt_amount: 0,
        fsc_amount: 0,
        acc_amount: 0,
        total_amount: 0,
      };

    if (!existing.customer_number && customerNumber) {
      existing.customer_number = customerNumber;
    }

    if (!existing.invoice_number && invoiceNumber) {
      existing.invoice_number = invoiceNumber;
    }

    if (!existing.service_name && chargeDescription) {
      existing.service_name = chargeDescription;
    }

    if (!existing.destination_country && destinationCountry) {
      existing.destination_country = destinationCountry;
    }

    if (!existing.receiver_address && receiverAddress) {
      existing.receiver_address = receiverAddress;
    }

    if (chargeType === "FRT") {
      existing.frt_amount += amount;
    }

    if (chargeType === "FSC") {
      existing.fsc_amount += amount;
    }

    if (chargeType === "ACC") {
      existing.acc_amount += amount;
    }

    existing.total_amount =
      existing.frt_amount + existing.fsc_amount + existing.acc_amount;

    grouped.set(trackingNumber, existing);
  }

  return Array.from(grouped.values());
}

export async function parseUpsInvoiceFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    const text = await file.text();

    const result = Papa.parse<string[]>(text, {
      header: false,
      skipEmptyLines: true,
    });

    return rowsToShipments(result.data as RawRow[]);
  }

  if (extension === "xlsx" || extension === "xls") {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const firstSheet = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheet];

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      blankrows: false,
    });

    return rowsToShipments(rows as RawRow[]);
  }

  throw new Error("Bitte CSV oder Excel hochladen.");
}
