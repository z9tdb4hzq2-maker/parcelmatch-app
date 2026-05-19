import Badge from "@/components/ui/badge/Badge";

const shipments = [
  {
    tracking: "1Z9A45...4210",
    customer: "DE-100045",
    service: "UPS Standard",
    country: "Deutschland",
    frt: "€14,20",
    fsc: "€1,80",
    acc: "€2,40",
    total: "€18,40",
    status: "Gematcht",
  },
  {
    tracking: "1Z9A45...8841",
    customer: "DE-100046",
    service: "UPS Express Saver",
    country: "Frankreich",
    frt: "€34,60",
    fsc: "€4,20",
    acc: "€3,30",
    total: "€42,10",
    status: "Review",
  },
  {
    tracking: "927489...1201",
    customer: "DE-100047",
    service: "UPS Standard",
    country: "Italien",
    frt: "€21,10",
    fsc: "€2,10",
    acc: "€4,64",
    total: "€27,84",
    status: "Offen",
  },
  {
    tracking: "1Z9A45...7712",
    customer: "DE-100048",
    service: "UPS Worldwide Express",
    country: "Spanien",
    frt: "€51,20",
    fsc: "€6,10",
    acc: "€5,90",
    total: "€63,20",
    status: "Gematcht",
  },
];

export default function ShipmentsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Sendungen
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          1 Trackingnummer = 1 Datensatz
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          Mehrere Rechnungszeilen pro Trackingnummer werden zu einer normalisierten
          Sendung zusammengeführt. FRT, FSC und ACC bleiben separat auswertbar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric label="Sendungen" value="7.339" />
        <Metric label="FRT" value="€588.290" />
        <Metric label="FSC" value="€92.180" />
        <Metric label="ACC" value="€143.950" />
      </div>

      <div className="flex flex-wrap gap-3">
        {["Kundennummer", "Versandland", "Serviceart", "Zeitraum", "Kostenart", "Claim-Status"].map(
          (filter) => (
            <button
              key={filter}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
            >
              {filter}
            </button>
          )
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sendungsliste
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gruppierte Sendungen mit Kostenaufschlüsselung nach FRT / FSC / ACC.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Tracking</th>
                <th className="px-6 py-3">Kundennr.</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Land</th>
                <th className="px-6 py-3">FRT</th>
                <th className="px-6 py-3">FSC</th>
                <th className="px-6 py-3">ACC</th>
                <th className="px-6 py-3">Gesamt</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {shipments.map((shipment) => (
                <tr key={shipment.tracking}>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {shipment.tracking}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {shipment.customer}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {shipment.service}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {shipment.country}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {shipment.frt}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {shipment.fsc}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {shipment.acc}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {shipment.total}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      size="sm"
                      color={
                        shipment.status === "Gematcht"
                          ? "success"
                          : shipment.status === "Review"
                          ? "warning"
                          : "error"
                      }
                    >
                      {shipment.status}
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
