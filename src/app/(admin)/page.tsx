"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Shipment = {
  id: string;
  invoice_number: string | null;
  tracking_number: string;
  customer_number: string | null;
  service_name: string | null;
  destination_country: string | null;
  frt_amount: number | null;
  fsc_amount: number | null;
  acc_amount: number | null;
  total_amount: number | null;
  matching_status: string | null;
  claim_status: string | null;
};

export default function DashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [customerFilter, setCustomerFilter] = useState("");

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from("shipments")
        .select(`
          id,
          invoice_number,
          tracking_number,
          customer_number,
          service_name,
          destination_country,
          frt_amount,
          fsc_amount,
          acc_amount,
          total_amount,
          matching_status,
          claim_status
        `)
        .order("created_at", { ascending: false })
        .limit(5000);

      setShipments((data ?? []) as Shipment[]);
    }

    loadData();
  }, []);

  const customers = unique(shipments.map((s) => s.customer_number));

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      return !customerFilter || s.customer_number === customerFilter;
    });
  }, [shipments, customerFilter]);

  const total = sum(filteredShipments, "total_amount");
  const frt = sum(filteredShipments, "frt_amount");
  const fsc = sum(filteredShipments, "fsc_amount");
  const acc = sum(filteredShipments, "acc_amount");

  const invoices = unique(filteredShipments.map((s) => s.invoice_number));
  const services = groupByAmount(filteredShipments, "service_name");
  const countries = groupByAmount(filteredShipments, "destination_country");
  const customersByAmount = groupByAmount(filteredShipments, "customer_number");

  const avgPerShipment =
    filteredShipments.length > 0 ? total / filteredShipments.length : 0;

  const accShare = total > 0 ? (acc / total) * 100 : 0;
  const fscShare = total > 0 ? (fsc / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          ParcelMatch Dashboard
        </p>

        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Kosten, Rechnungen und Sendungen auf Basis echter Upload-Daten
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              Live-Auswertung aus Supabase nach Kundennummer, Serviceart,
              Zielland, Rechnung und Gebührenstruktur.
            </p>
          </div>

          <div className="w-full max-w-xs">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Kundennummer filtern
            </label>

            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="">Alle Kunden</option>
              {customers.map((customer) => (
                <option key={customer} value={customer}>
                  {customer}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Gesamtkosten" value={money(total)} />
        <Metric label="Sendungen" value={String(filteredShipments.length)} />
        <Metric label="Rechnungen" value={String(invoices.length)} />
        <Metric label="Ø Kosten / Sendung" value={money(avgPerShipment)} />
        <Metric label="Zuschlagsquote" value={`${accShare.toFixed(1)}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <BreakdownCard title="FRT Beförderung" value={frt} total={total} />
        <BreakdownCard title="FSC Treibstoff" value={fsc} total={total} />
        <BreakdownCard title="ACC Zuschläge" value={acc} total={total} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RankingCard
          title="Kosten nach Service-Code"
          subtitle="Top Services nach Gesamtkosten"
          rows={services}
        />

        <RankingCard
          title="Kosten nach Zielland"
          subtitle="Länder mit höchstem Kostenanteil"
          rows={countries}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RankingCard
          title="Kosten nach Kundennummer"
          subtitle="Kundenvergleich auf Basis hochgeladener Rechnungen"
          rows={customersByAmount}
        />

        <RecentShipments rows={filteredShipments.slice(0, 8)} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <BottomPanel
          title="Performance & Audit Entwicklung"
          text="Diese Sektion bleibt vorbereitet für spätere Matching-, Claim- und Audit-Zeitreihen."
        />

        <BottomPanel
          title="Audit & Recovery Ziel"
          text={`Aktuell sichtbare FSC-Quote: ${fscShare.toFixed(
            1
          )}%. Claim- und Recovery-Logik wird später ergänzt.`}
        />
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

function BreakdownCard({
  title,
  value,
  total,
}: {
  title: string;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {percentage.toFixed(1)}%
        </p>
      </div>

      <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">
        {money(value)}
      </p>

      <div className="mt-4 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className="h-2 rounded-full bg-brand-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function RankingCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: { label: string; amount: number; count: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.amount), 1);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {subtitle}
      </p>

      <div className="mt-6 space-y-5">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Noch keine Daten vorhanden.
          </p>
        ) : (
          rows.slice(0, 6).map((row) => (
            <div key={row.label}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {row.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {row.count} Sendungen
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {money(row.amount)}
                </p>
              </div>

              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-2 rounded-full bg-brand-500"
                  style={{ width: `${(row.amount / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RecentShipments({ rows }: { rows: Shipment[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Letzte Sendungen
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Aktuelle Sendungen aus den letzten Uploads.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800">
            <tr>
              <th className="py-3 pr-4">Tracking</th>
              <th className="py-3 pr-4">Kunde</th>
              <th className="py-3 pr-4">Service</th>
              <th className="py-3 text-right">Gesamt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="py-3 pr-4 font-medium text-brand-600">
                  {row.tracking_number}
                </td>
                <td className="py-3 pr-4 text-gray-500">
                  {row.customer_number ?? "-"}
                </td>
                <td className="py-3 pr-4 text-gray-500">
                  {row.service_name ?? "-"}
                </td>
                <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                  {money(Number(row.total_amount ?? 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BottomPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
        {text}
      </p>
    </div>
  );
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value)))
  ).sort();
}

function sum(
  rows: Shipment[],
  key: "frt_amount" | "fsc_amount" | "acc_amount" | "total_amount"
) {
  return rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
}

function groupByAmount(
  rows: Shipment[],
  key: "service_name" | "destination_country" | "customer_number"
) {
  const map = new Map<string, { label: string; amount: number; count: number }>();

  for (const row of rows) {
    const label = row[key] || "Unbekannt";
    const current = map.get(label) ?? { label, amount: 0, count: 0 };

    current.amount += Number(row.total_amount ?? 0);
    current.count += 1;

    map.set(label, current);
  }

  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

function money(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
