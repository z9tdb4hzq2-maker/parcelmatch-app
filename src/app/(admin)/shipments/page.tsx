"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/ui/badge/Badge";

type Shipment = {
  id: string;
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

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShipments() {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data) setShipments(data);
      setLoading(false);
    }

    loadShipments();
  }, []);

  const total = shipments.reduce((sum, s) => sum + Number(s.total_amount ?? 0), 0);
  const frt = shipments.reduce((sum, s) => sum + Number(s.frt_amount ?? 0), 0);
  const fsc = shipments.reduce((sum, s) => sum + Number(s.fsc_amount ?? 0), 0);
  const acc = shipments.reduce((sum, s) => sum + Number(s.acc_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Sendungen
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Echte Upload-Daten aus Supabase
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          Diese Ansicht liest jetzt aus der Tabelle shipments. Sobald der CSV-/Excel-Parser Sendungen erkennt,
          erscheinen sie hier.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric label="Sendungen" value={String(shipments.length)} />
        <Metric label="FRT" value={`€${frt.toFixed(2)}`} />
        <Metric label="FSC" value={`€${fsc.toFixed(2)}`} />
        <Metric label="ACC" value={`€${acc.toFixed(2)}`} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sendungsliste
          </h2>
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
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    Lade Sendungen...
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    Noch keine Sendungen erkannt. Bitte CSV/Excel hochladen und Parser prüfen.
                  </td>
                </tr>
              ) : (
                shipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {shipment.tracking_number}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {shipment.customer_number ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {shipment.service_name ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {shipment.destination_country ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      €{Number(shipment.frt_amount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      €{Number(shipment.fsc_amount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      €{Number(shipment.acc_amount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      €{Number(shipment.total_amount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge size="sm" color="warning">
                        {shipment.matching_status ?? "open"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
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
