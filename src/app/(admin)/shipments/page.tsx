"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/ui/badge/Badge";

type UploadRelation = {
  id: string;
  file_name: string;
  carrier: string;
  file_path: string | null;
};

type Shipment = {
  id: string;
  upload_id: string | null;
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
  uploads: UploadRelation[] | null;
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [trackingFilter, setTrackingFilter] = useState("");

  async function loadShipments() {
    setLoading(true);

   const { data } = await supabase
  .from("shipments")
  .select(`
    id,
    upload_id,
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
    claim_status,
    uploads (
      id,
      file_name,
      carrier,
      file_path
    )
  `)
      .order("created_at", { ascending: false })
      .limit(1000);

    setShipments((data ?? []) as Shipment[]);
    setLoading(false);
  }

  useEffect(() => {
    loadShipments();
  }, []);

  const invoiceOptions = unique(
    shipments.map((s) => s.uploads?.[0]?.file_name ?? null)
  );
  const customerOptions = unique(shipments.map((s) => s.customer_number));
  const serviceOptions = unique(shipments.map((s) => s.service_name));
  const countryOptions = unique(shipments.map((s) => s.destination_country));
  const statusOptions = unique(shipments.map((s) => s.matching_status));

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const invoiceName = shipment.uploads?.[0]?.file_name ?? "";

      return (
        (!invoiceFilter || invoiceName === invoiceFilter) &&
        (!customerFilter || shipment.customer_number === customerFilter) &&
        (!serviceFilter || shipment.service_name === serviceFilter) &&
        (!countryFilter || shipment.destination_country === countryFilter) &&
        (!statusFilter || shipment.matching_status === statusFilter) &&
        (!trackingFilter ||
          shipment.tracking_number
            .toLowerCase()
            .includes(trackingFilter.toLowerCase()))
      );
    });
  }, [
    shipments,
    invoiceFilter,
    customerFilter,
    serviceFilter,
    countryFilter,
    statusFilter,
    trackingFilter,
  ]);

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
    setInvoiceFilter("");
    setCustomerFilter("");
    setServiceFilter("");
    setCountryFilter("");
    setStatusFilter("");
    setTrackingFilter("");
  }

  async function deleteSelectedInvoice() {
    if (!invoiceFilter) {
      setStatus("Bitte zuerst eine Rechnung auswählen.");
      return;
    }

    const selectedShipment = shipments.find(
      (shipment) => shipment.uploads?.[0]?.file_name === invoiceFilter
    );

    const upload = selectedShipment?.uploads?.[0];

    if (!upload?.id) {
      setStatus("Keine Upload-Zuordnung gefunden.");
      return;
    }

    const confirmed = window.confirm(
      `Rechnung inklusive aller zugehörigen Sendungen löschen?\n\n${invoiceFilter}`
    );

    if (!confirmed) return;

    setStatus("Rechnung und Sendungen werden gelöscht...");

    if (upload.file_path) {
      await supabase.storage
        .from("parcelmatch-uploads")
        .remove([upload.file_path]);
    }

    const { error } = await supabase
      .from("uploads")
      .delete()
      .eq("id", upload.id);

    if (error) {
      setStatus(`Löschen fehlgeschlagen: ${error.message}`);
      return;
    }

    setStatus("Rechnung und zugehörige Sendungen wurden gelöscht.");
    clearFilters();
    await loadShipments();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Sendungen
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Globale Sendungsübersicht
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          Alle aus Rechnungsdateien erkannten Sendungen mit Rechnungsbezug,
          Kundennummer, Service-Code, Zielland und Gebührenstruktur.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Metric label="Sendungen" value={String(filteredShipments.length)} />
        <Metric label="FRT" value={`€${frt.toFixed(2)}`} />
        <Metric label="FSC" value={`€${fsc.toFixed(2)}`} />
        <Metric label="ACC" value={`€${acc.toFixed(2)}`} />
        <Metric label="Gesamt" value={`€${total.toFixed(2)}`} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <SelectFilter
            label="Rechnung"
            value={invoiceFilter}
            options={invoiceOptions}
            onChange={setInvoiceFilter}
          />

          <SelectFilter
            label="Kundennummer"
            value={customerFilter}
            options={customerOptions}
            onChange={setCustomerFilter}
          />

          <SelectFilter
            label="Service-Code"
            value={serviceFilter}
            options={serviceOptions}
            onChange={setServiceFilter}
          />

          <SelectFilter
            label="Zielland"
            value={countryFilter}
            options={countryOptions}
            onChange={setCountryFilter}
          />

          <SelectFilter
            label="Status"
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tracking
            </label>
            <input
              value={trackingFilter}
              onChange={(e) => setTrackingFilter(e.target.value)}
              placeholder="Tracking suchen"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={clearFilters}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              Filter zurücksetzen
            </button>

            <button
              onClick={deleteSelectedInvoice}
              disabled={!invoiceFilter}
              className="rounded-lg border border-error-300 px-4 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ausgewählte Rechnung löschen
            </button>
          </div>

          {status ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {status}
            </p>
          ) : null}
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
                <th className="px-6 py-3">Rechnung</th>
                <th className="px-6 py-3">Rechnungsnr.</th>
                <th className="px-6 py-3">Carrier</th>
                <th className="px-6 py-3">Tracking</th>
                <th className="px-6 py-3">Kundennr.</th>
                <th className="px-6 py-3">Service-Code</th>
                <th className="px-6 py-3">Zielland</th>
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
                    colSpan={11}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Lade Sendungen...
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Keine Sendungen gefunden.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => {
                  const upload = shipment.uploads?.[0] ?? null;

                  return (
                    <tr key={shipment.id}>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
  {shipment.invoice_number ?? "-"}
</td>

                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {upload?.carrier ?? "-"}
                      </td>

                      <td className="px-6 py-4 font-medium text-brand-600">
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
        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
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
