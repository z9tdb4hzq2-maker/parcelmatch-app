import Badge from "@/components/ui/badge/Badge";

const claims = [
  ["CLM-1021", "SLA-Verstoß", "1Z9A45...4210", "€124", "Offen"],
  ["CLM-1022", "Billing Error", "1Z9A45...8841", "€88", "Prüfung"],
  ["CLM-1023", "ACC Mismatch", "927489...1201", "€41", "Review"],
];

export default function ClaimsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Claims</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Claim Candidates & Recovery</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          SLA-Verstöße, Billing-Abweichungen und ACC-Mismatches werden als prüfbare Recovery-Fälle geführt.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric label="Offene Claims" value="18" />
        <Metric label="Recovery Potenzial" value="€12.640" />
        <Metric label="In Prüfung" value="9" />
        <Metric label="Erstattet" value="€4.820" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Claims Pipeline</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                {["Claim", "Typ", "Tracking", "Potenzial", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {claims.map((row) => (
                <tr key={row[0]}>
                  {row.slice(0, 4).map((cell) => (
                    <td key={cell} className="px-6 py-4 text-gray-500 dark:text-gray-400">{cell}</td>
                  ))}
                  <td className="px-6 py-4">
                    <Badge size="sm" color={row[4] === "Offen" ? "error" : "warning"}>{row[4]}</Badge>
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
      <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
