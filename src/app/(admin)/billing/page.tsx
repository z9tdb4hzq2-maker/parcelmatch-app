const cards = [
  ["Payables", "€204.880", "offene Carrier-Verbindlichkeiten"],
  ["Receivables", "€88.120", "weiterbelastbare Kosten"],
  ["Recovery", "€12.640", "offen / in Prüfung"],
  ["Settlement", "€31.440", "Marketplace / Reseller später"],
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Billing</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Billing Hub & Payment Orchestration</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          Struktur für Payables, Receivables, Recovery, zentrale Abrechnung und spätere Reseller-Settlement-Flows.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {cards.map(([label, value, sub]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
