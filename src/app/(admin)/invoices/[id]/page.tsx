"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/ui/badge/Badge";

type Upload = {
  id: string;
  carrier: string;
  file_name: string;
  status: string;
  created_at: string;
};

type Shipment = {
  id: string;
  tracking_number: string;
  customer_number: string | null;
  service_name: string | null;
  destination_country: string | null;
  ship_date: string | null;
  frt_amount: number | null;
  fsc_amount: number | null;
  acc_amount: number | null;
  total_amount: number | null;
  matching_status: string | null;
  claim_status: string | null;
};

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const [upload, setUpload] = useState<Upload | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [openShipmentId, setOpenShipmentId] = useState<string | null>(null);

  const [trackingFilter, setTrackingFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function loadInvoice() {
      const { data: uploadData } = await supabase
        .from("uploads")
        .select("id, carrier, file_name, status, created_at")
        .eq("id", params.id)
        .single();

      const { data: shipmentData } = await supabase
        .from("shipments")
        .select(
          "id, tracking_number, customer_number, service_name, destination_country, ship_date, frt_amount, fsc_amount, acc_amount, total_amount, matching_status, claim_status"
        )
        .eq("upload_id", params.id)
        .order("created_at", { ascending: false });

      setUpload(uploadData ?? null);
      setShipments(shipmentData ?? []);
    }

    loadInvoice();
  }, [params.id]);

  const customerNumbers = unique(shipments.map((s) => s.customer_number));
  const serviceNames = unique(shipments.map((s) => s.service_name));
  const countries = unique(shipments.map((s) => s.destination_country));
  const statuses = unique(shipments.map((s) => s.matching_status));

  const invoiceCustomerSummary =
    customerNumbers.length === 0
      ? "-"
      : customerNumbers.length === 1
      ? customerNumbers[0]
      : `${customerNumbers.length} Kundennummern`;

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const matchesTracking =
        !trackingFilter ||
        shipment.tracking_number
          .toLowerCase()
          .includes(trackingFilter.toLowerCase());

      const matchesCustomer =
        !customerFilter || shipment.customer_number === customerFilter;

      const matchesService =
        !serviceFilter || shipment.service_name === serviceFilter;

      const matchesCountry =
        !countryFilter || shipment.destination_country === countryFilter;

      const matchesStatus =
        !statusFilter || shipment.matching_status === statusFilter;

      return (
        matchesTracking &&
        matchesCustomer &&
        matchesService &&
        matchesCountry &&
        matchesStatus
      );
    });
  }, [
    shipments,
    trackingFilter,
    customerFilter,
    serviceFilter,
    countryFilter,
    statusFilter,
  ]);

  const invoiceTotal = useMemo(
    () => shipments.reduce((sum, s) => sum + Number(s.total_amount ?? 0), 0),
    [shipments]
  );

  const filteredTotal = useMemo(
    () =>
      filteredShipments.reduce(
        (sum, s) => sum + Number(s.total_amount ?? 0),
        0
      ),
    [filteredShipments]
  );

  function clearFilters() {
    setTrackingFilter("");
    setCustomerFilter("");
    setServiceFilter("");
    setCountryFilter("");
    setStatusFilter("");
  }

  if (!upload) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">Lade Rechnung...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Meine Rechnungen &gt; Rechnungszusammenfassung
        </p>

        <h1 className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">
          Rechnungszusammenfassung
        </h1>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          <Summary label="Rechnung" value={upload.file_name} />
          <Summary label="Carrier" value={upload.carrier} />
          <Summary label="Kundennummer" value={invoiceCustomerSummary} />
          <Summary
            label="Rechnungsdatum"
            value={new Date(upload.created_at).toLocaleDateString("de-DE")}
          />
          <Summary label="Rechnungsbetrag" value={`€${invoiceTotal.toFixed(2)}`} />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-4">
            <Tab active>Zusammenfassung</Tab>
            <Tab>Anpassungen</Tab>
            <Tab>Gebühren</Tab>
            <Tab>Claims</Tab>
          </div>
        </div>

        <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Trackingnummern dieser Rechnung
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filteredShipments.length} von {shipments.length} Sendungen ·
            gefilterte Summe: €{filteredTotal.toFixed(2)}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trackingnummer
              </label>
              <input
                value={trackingFilter}
                onChange={(e) => setTrackingFilter(e.target.value)}
                placeholder="Tracking suchen"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>

            <SelectFilter
              label="Kundennummer"
              value={customerFilter}
              options={customerNumbers}
              onChange={setCustomerFilter}
            />

            <SelectFilter
              label="Service-Code"
              value={serviceFilter}
              options={serviceNames}
              onChange={setServiceFilter}
            />

            <SelectFilter
              label="Zielland"
              value={countryFilter}
              options={countries}
              onChange={setCountryFilter}
            />

            <SelectFilter
              label="Status"
              value={statusFilter}
              options={statuses}
              onChange={setStatusFilter}
            />

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-y border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Tracking-Nummer</th>
                <th className="px-6 py-3">Transaktionsdatum</th>
                <th className="px-6 py-3">Art</th>
                <th className="px-6 py-3">System</th>
                <th className="px-6 py-3">Service-Code</th>
                <th className="px-6 py-3">Nettogebühr</th>
                <th className="px-6 py-3">Ref-Nr. 1</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Keine Sendungen für diese Filter gefunden.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => {
                  const isOpen = openShipmentId === shipment.id;

                  return (
                    <Fragment key={shipment.id}>
                      <tr
                        className={
                          isOpen
                            ? "bg-brand-50/60 dark:bg-brand-500/10"
                            : ""
                        }
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              setOpenShipmentId(isOpen ? null : shipment.id)
                            }
                            className="font-medium text-brand-600 hover:underline"
                          >
                            {shipment.tracking_number}
                          </button>
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {shipment.ship_date
                            ? new Date(
                                shipment.ship_date
                              ).toLocaleDateString("de-DE")
                            : "-"}
                        </td>

                        <td className="px-6 py-4 text-gray-500">Tarif</td>

                        <td className="px-6 py-4 text-gray-500">
                          {shipment.destination_country ?? "-"}
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {shipment.service_name ?? "-"}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          €{Number(shipment.total_amount ?? 0).toFixed(2)}
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {shipment.customer_number ?? "-"}
                        </td>

                        <td className="px-6 py-4">
                          <Badge size="sm" color="warning">
                            {shipment.matching_status ?? "open"}
                          </Badge>
                        </td>
                      </tr>

                      {isOpen ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="bg-white px-6 py-6 dark:bg-gray-950"
                          >
                            <ShipmentDetail shipment={shipment} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
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

function ShipmentDetail({ shipment }: { shipment: Shipment }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-brand-700 dark:text-brand-400">
            Paketinformationen
          </h3>

          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <Info label="Transaktionsdatum" value={shipment.ship_date ?? "-"} />
            <Info label="Tracking-Nummer" value={shipment.tracking_number} />
            <Info label="Service" value={shipment.service_name ?? "-"} />
            <Info label="Kundennummer" value={shipment.customer_number ?? "-"} />
            <Info label="Status" value={shipment.matching_status ?? "open"} />
            <Info label="Claim" value={shipment.claim_status ?? "none"} />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-brand-700 dark:text-brand-400">
            Adressinformationen
          </h3>

          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <Info label="Versender" value="-" />
            <Info
              label="Empfängerland"
              value={shipment.destination_country ?? "-"}
            />
            <Info label="Referenz" value={shipment.customer_number ?? "-"} />
            <Info label="Carrier" value="UPS" />
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-4">
          <h3 className="text-xl font-semibold text-brand-700 dark:text-brand-400">
            Gesamtgebühren
          </h3>

          <button className="rounded-full border border-brand-500 px-5 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50">
            Reklamieren
          </button>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="border-y border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Beschreibung</th>
              <th className="px-4 py-3 text-right">Abgerechnete Gebühr</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            <Fee label="Beförderung" value={shipment.frt_amount} />
            <Fee label="Treibstoffzuschlag" value={shipment.fsc_amount} />
            <Fee label="Sonstige Gebühren" value={shipment.acc_amount} />
            <Fee
              label="Gesamtbetrag für Sendung"
              value={shipment.total_amount}
              bold
            />
          </tbody>
        </table>
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

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {label}
      </p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{value}</p>
    </div>
  );
}

function Tab({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`rounded-xl px-4 py-2 text-sm font-medium ${
        active
          ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
          : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      }`}
    >
      {children}
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
      <p className="mt-1 text-gray-600 dark:text-gray-400">{value}</p>
    </div>
  );
}

function Fee({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: number | null;
  bold?: boolean;
}) {
  return (
    <tr>
      <td
        className={`px-4 py-4 ${
          bold
            ? "font-semibold text-gray-900 dark:text-white"
            : "text-gray-600 dark:text-gray-400"
        }`}
      >
        {label}
      </td>
      <td
        className={`px-4 py-4 text-right ${
          bold
            ? "font-semibold text-gray-900 dark:text-white"
            : "text-gray-600 dark:text-gray-400"
        }`}
      >
        €{Number(value ?? 0).toFixed(2)}
      </td>
    </tr>
  );
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value)))
  ).sort();
}
