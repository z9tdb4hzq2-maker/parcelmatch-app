import Badge from "@/components/ui/badge/Badge";

const matches = [
  ["1Z9A45...4210", "UPS 2025 Master", "97%", "€18,40", "€17,92", "+€0,48", "Gematcht"],
  ["1Z9A45...8841", "UPS 2025 Master", "91%", "€42,10", "€41,20", "+€0,90", "Review"],
  ["927489...1201", "UPS 2025 Master", "84%", "€27,84", "€29,12", "-€1,28", "Offen"],
];

export default function MatchingPage() {
  return (
    <div className="space-y-6">
      <Header title="Matching Engine" text="Vertrag, Rechnung und Sendung werden zu einem prüfbaren Soll-Ist-Vergleich zusammengeführt." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric label="Matching-Quote" value="91,3%" />
        <Metric label="Abweichungen" value="128" />
        <Metric label="Review Queue" value="34" />
        <Metric label="Potenzial" value="€8.420" />
      </div>

      <Table rows={matches} />
    </div>
  );
}

function Header({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Matching</p>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">{text}</p>
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

function Table({ rows }: { rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Matching Queue</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            <tr>
              {["Tracking", "Vertrag", "Score", "Ist", "Soll", "Varianz", "Status"].map((h) => (
                <th key={h} className="px-6 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.slice(0, 6).map((cell) => (
                  <td key={cell} className="px-6 py-4 text-gray-500 dark:text-gray-400">{cell}</td>
                ))}
                <td className="px-6 py-4">
                  <Badge size="sm" color={row[6] === "Gematcht" ? "success" : row[6] === "Review" ? "warning" : "error"}>
                    {row[6]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
