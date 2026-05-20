"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/ui/badge/Badge";

type UploadRelation = {
  file_name: string;
  carrier: string;
};

type Shipment = {
  id: string;
  upload_id: string | null;
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
  uploads: UploadRelation[] | null;
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const [customerFilter, setCustomerFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [uploadFilter, setUploadFilter] = useState("");

  useEffect(() => {
    async function loadShipments() {
      const { data, error } = await supabase
        .from("shipments")
        .select(`
          id,
          upload_id,
          tracking_number,
          customer_number,
          service_name,
          destination_country,
          frt_amount,
          fsc_amount,
          acc_amount,
          total_amount,
          matching_status,
          claim_status,
          uploads (
            file_name,
            carrier
          )
        `)
        .order("created_at", { ascending: false })
        .limit(500);

      if (!error && data) {
        setShipments(data as Shipment[]);
      }

      setLoading(false);
    }

    loadShipments();
  }, []);

  const customers = unique(shipments.map((s) => s.customer_number));
  const services = unique(shipments.map((s) => s.service_name));
  const countries = unique(shipments.map((s) => s.destination_country));
  const uploadFiles = unique(
    shipments.map((s) => s.uploads?.[0]?.file_name ?? null)
  );

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const uploadFileName = shipment.uploads?.[0]?.file_name ?? null;

      return (
        (!customerFilter || shipment.customer_number === customerFilter) &&
        (!serviceFilter || shipment.service_name === serviceFilter) &&
        (!countryFilter || shipment.destination_country === countryFilter) &&
        (!uploadFilter || uploadFileName === uploadFilter)
      );
    });
  }, [shipments, customerFilter, serviceFilter, countryFilter, uploadFilter]);

  const total = filteredShipments.reduce(
    (sum, s) => sum + Number(s.total_amount ?? 0),
    0
  );

  const frt = filteredShipments.reduce(
    (sum, s) => sum + Number(s.frt_amount ?? 0),
    0
  );

  const fsc = filteredShipments.reduce(
    (sum, s) => sum + Number(s.fsc_amount ?? 0),
    0
  );

  const acc = filteredShipments.reduce(
    (sum, s) => sum + Number(s.acc_amount ?? 0),
    0
  );

  function clearFilters() {
    setCustomerFilter("");
    setServiceFilter("");
    setCountryFilter("");
    setUploadFilter("");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Sendungen
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Sendungen aus Upload-Dateien
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          Jede Sendung ist einer hochgeladenen Datei zugeordnet. Du kannst nach
          Kundennummer, Serviceart, Zielland und Upload-Datei filtern.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric label="Sendungen" value={String(filteredShipments.length)} />
        <Metric label="FRT" value={`€${frt.toFixed(2)}`} />
        <Metric label="FSC" value={`€${fsc.toFixed(2)}`} />
        <Metric label="ACC" value={`€${acc.toFixed(2)}`} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <SelectFilter
            label="Kundennummer"
            value={customerFilter}
            options={customers}
            onChange={setCustomerFilter}
          />

          <SelectFilter
            label="Serviceart"
            value={serviceFilter}
            options={services}
            onChange={setServiceFilter}
          />

          <SelectFilter
            label="Zielland"
            value={countryFilter}
            options={countries}
            onChange={setCountryFilter}
          />

          <SelectFilter
            label="Upload / Rechnung"
            value={uploadFilter}
            options={uploadFiles}
            onChange={setUploadFilter}
          />

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sendungsliste
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gefilterte Gesamtkosten: €{total.toFixed(2)}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Upload / Rechnung</th>
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
                  <td
                    colSpan={10}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Lade Sendungen...
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Keine Sendungen für diese Filter gefunden.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => {
                  const upload = shipment.uploads?.[0] ?? null;

                  return (
                    <tr key={shipment.id}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {upload?.file_name ?? "-"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {upload?.carrier ?? ""}
                          </p>
                        </div>
                      </td>

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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
      >
        <option value="">Alle</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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

function unique(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value)))
  ).sort();
}
