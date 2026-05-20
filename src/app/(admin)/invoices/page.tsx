"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/ui/badge/Badge";

type Upload = {
  id: string;
  carrier: string;
  file_name: string;
  file_path: string | null;
  status: string;
  created_at: string;
};

type Shipment = {
  upload_id: string | null;
  total_amount: number | null;
};

export default function InvoicesPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  async function loadData() {
    const { data: uploadData } = await supabase
      .from("uploads")
      .select("id, carrier, file_name, file_path, status, created_at")
      .order("created_at", { ascending: false });

    const { data: shipmentData } = await supabase
      .from("shipments")
      .select("upload_id, total_amount");

    setUploads(uploadData ?? []);
    setShipments(shipmentData ?? []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(upload: Upload) {
    const confirmed = window.confirm(
      `Rechnung wirklich löschen?\n\n${upload.file_name}`
    );

    if (!confirmed) return;

    setStatus("Rechnung wird gelöscht...");

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

    setStatus("Rechnung erfolgreich gelöscht.");
    await loadData();
  }

  const rows = useMemo(() => {
    return uploads
      .map((upload) => {
        const related = shipments.filter((s) => s.upload_id === upload.id);
        const amount = related.reduce(
          (sum, s) => sum + Number(s.total_amount ?? 0),
          0
        );

        return {
          ...upload,
          shipmentCount: related.length,
          amount,
        };
      })
      .filter((row) =>
        row.file_name.toLowerCase().includes(search.toLowerCase())
      );
  }, [uploads, shipments, search]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Rechnungscenter
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Meine Rechnungen
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Übersicht aller hochgeladenen Carrier-Rechnungen mit Betrag,
          Sendungsanzahl und Verarbeitungsstatus.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen"
            className="h-11 w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          />

          {status ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {status}
            </p>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Rechnung</th>
                <th className="px-6 py-3">Carrier</th>
                <th className="px-6 py-3">Rechnungsdatum</th>
                <th className="px-6 py-3">Sendungen</th>
                <th className="px-6 py-3">Rechnungsbetrag</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Aktion</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Noch keine Rechnungen vorhanden.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 font-medium text-brand-600">
                      <Link href={`/invoices/${row.id}`}>{row.file_name}</Link>
                    </td>

                    <td className="px-6 py-4 text-gray-500">{row.carrier}</td>

                    <td className="px-6 py-4 text-gray-500">
                      {new Date(row.created_at).toLocaleDateString("de-DE")}
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {row.shipmentCount}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      €{row.amount.toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        size="sm"
                        color={row.status === "parsed" ? "success" : "warning"}
                      >
                        {row.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/invoices/${row.id}`}
                          className="text-sm font-medium text-brand-600"
                        >
                          Öffnen
                        </Link>

                        <button
                          onClick={() => handleDelete(row)}
                          className="text-sm font-medium text-error-600 hover:text-error-700"
                        >
                          Löschen
                        </button>
                      </div>
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
