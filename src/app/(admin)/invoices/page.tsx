import Badge from "@/components/ui/badge/Badge";

const invoices = [
  {
    number: "INV-2025-09-184",
    carrier: "UPS",
    date: "2025-09-30",
    amount: "€124.840",
    status: "Auditiert",
    matching: "96%",
  },
  {
    number: "INV-2025-10-012",
    carrier: "UPS",
    date: "2025-10-31",
    amount: "€141.220",
    status: "In Prüfung",
    matching: "82%",
  },
  {
    number: "INV-2025-11-004",
    carrier: "UPS",
    date: "2025-11-30",
    amount: "€136.790",
    status: "Gematcht",
    matching: "91%",
  },
];

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Rechnungen
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Carrier-Rechnungen & Audit-Status
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          Upload-Historie, Audit-Status, Matching-Quote und Rechnungsdetails als Grundlage für Claims,
          Billing und Kostenoptimierung.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric label="Rechnungen" value="3" />
        <Metric label="Gesamtbetrag" value="€402.850" />
        <Metric label="Ø Matching" value="89,7%" />
        <Metric label="Offene Reviews" value="12" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Rechnungsliste
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Rechnung</th>
                <th className="px-6 py-3">Carrier</th>
                <th className="px-6 py-3">Datum</th>
                <th className="px-6 py-3">Betrag</th>
                <th className="px-6 py-3">Matching</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {invoices.map((invoice) => (
                <tr key={invoice.number}>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {invoice.number}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {invoice.carrier}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {invoice.amount}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {invoice.matching}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      size="sm"
                      color={
                        invoice.status === "Auditiert" || invoice.status === "Gematcht"
                          ? "success"
                          : "warning"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
