import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface ShipmentRow {
  id: number;
  tracking: string;
  customer: string;
  service: string;
  country: string;
  cost: string;
  matching: "Gematcht" | "Review" | "Offen";
  claim: "Kein Claim" | "Candidate" | "Claim offen";
}

const tableData: ShipmentRow[] = [
  {
    id: 1,
    tracking: "1Z9A45...4210",
    customer: "DE-100045",
    service: "UPS Standard",
    country: "Deutschland",
    cost: "€18,40",
    matching: "Gematcht",
    claim: "Kein Claim",
  },
  {
    id: 2,
    tracking: "1Z9A45...8841",
    customer: "DE-100046",
    service: "UPS Express Saver",
    country: "Frankreich",
    cost: "€42,10",
    matching: "Review",
    claim: "Candidate",
  },
  {
    id: 3,
    tracking: "927489...1201",
    customer: "DE-100047",
    service: "UPS Standard",
    country: "Italien",
    cost: "€27,84",
    matching: "Offen",
    claim: "Claim offen",
  },
  {
    id: 4,
    tracking: "1Z9A45...7712",
    customer: "DE-100048",
    service: "UPS Worldwide Express",
    country: "Spanien",
    cost: "€63,20",
    matching: "Gematcht",
    claim: "Kein Claim",
  },
  {
    id: 5,
    tracking: "1Z9A45...9021",
    customer: "DE-100049",
    service: "UPS Expedited",
    country: "Niederlande",
    cost: "€31,76",
    matching: "Review",
    claim: "Candidate",
  },
];

function getMatchingColor(status: ShipmentRow["matching"]) {
  if (status === "Gematcht") return "success";
  if (status === "Review") return "warning";
  return "error";
}

function getClaimColor(status: ShipmentRow["claim"]) {
  if (status === "Kein Claim") return "success";
  if (status === "Candidate") return "warning";
  return "error";
}

export default function RecentOrders() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Aktuelle Sendungen & Prüfstatus
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gruppiert nach Trackingnummer, Kostenlogik FRT / FSC / ACC und Claim-Erkennung.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Alle Sendungen
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Tracking
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Kunde
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Service
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Land
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Kosten
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Matching
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Claim
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell className="py-3">
                  <div>
                    <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {shipment.tracking}
                    </p>
                    <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                      1 Trackingnummer = 1 Datensatz
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  {shipment.customer}
                </TableCell>
                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  {shipment.service}
                </TableCell>
                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  {shipment.country}
                </TableCell>
                <TableCell className="py-3 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                  {shipment.cost}
                </TableCell>
                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  <Badge size="sm" color={getMatchingColor(shipment.matching)}>
                    {shipment.matching}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  <Badge size="sm" color={getClaimColor(shipment.claim)}>
                    {shipment.claim}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
