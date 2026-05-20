import Badge from "@/components/ui/badge/Badge";

const contracts = [
  {
    carrier: "UPS",
    service: "UPS Standard",
    zone: "DE Domestic",
    base: "€4,82",
    fuel: "18%",
    minimum: "€6,90",
    valid: "31.12.2025",
    status: "Aktiv",
  },
  {
    carrier: "UPS",
    service: "UPS Express Saver",
    zone: "EU Zone 2",
    base: "€12,40",
    fuel: "21%",
    minimum: "€15,20",
    valid: "31.12.2025",
    status: "Aktiv",
  },
  {
    carrier: "UPS",
    service: "UPS Worldwide Express",
    zone: "Worldwide",
    base: "€28,90",
    fuel: "24%",
    minimum: "€34,00",
    valid: "31.12.2025",
    status: "Review",
  },
];

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Verträge
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Carrier Pricing & Tariflogik
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          Vertragslogik für UPS Services, Zonen, FSC, Mindestpreise,
          Zuschläge und spätere Multi-Carrier-Auswertung.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric label="Carrier" value="1" />
        <Metric label="Services" value="14" />
        <Metric label="Zonen" value="42" />
        <Metric label="Aktive Verträge" value="3" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Vertragsmatrix
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Grundlage für Audit, Billing-Prüfung und automatisches Matching.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Carrier</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Zone</th>
                <th className="px-6 py-3">Basisrate</th>
                <th className="px-6 py-3">FSC</th>
                <th className="px-6 py-3">Minimum</th>
                <th className="px-6 py-3">Gültig bis</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {contracts.map((contract) => (
                <tr key={contract.service}>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {contract.carrier}
                  </td>

                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {contract.service}
                  </td>

                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {contract.zone}
                  </td>

                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {contract.base}
                  </td>

                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {contract.fuel}
                  </td>

                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {contract.minimum}
                  </td>

                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {contract.valid}
                  </td>

                  <td className="px-6 py-4">
                    <Badge
                      size="sm"
                      color={
                        contract.status === "Aktiv"
                          ? "success"
                          : "warning"
                      }
                    >
                      {contract.status}
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
 
