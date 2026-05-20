"use client";

import { parseUpsInvoiceFile } from "@/lib/parsers/upsInvoiceParser";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/ui/badge/Badge";

type UploadRecord = {
  id: string;
  carrier: string;
  file_name: string;
  file_path: string | null;
  status: string;
  created_at: string;
};

export default function UploadsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [carrier, setCarrier] = useState("UPS");
  const [status, setStatus] = useState("");
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadUploads() {
    const { data } = await supabase
      .from("uploads")
      .select("id, carrier, file_name, file_path, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    setUploads(data ?? []);
  }

  useEffect(() => {
    loadUploads();
  }, []);

  async function handleDelete(upload: UploadRecord) {
    const confirmed = window.confirm(
      `Upload wirklich löschen?\n\n${upload.file_name}`
    );

    if (!confirmed) return;

    setStatus("Upload wird gelöscht...");

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

    setStatus("Upload erfolgreich gelöscht.");
    await loadUploads();
  }

  async function handleUpload() {
    if (!file) {
      setStatus("Bitte zuerst eine Datei auswählen.");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["csv", "xlsx", "xls"].includes(extension ?? "")) {
      setStatus("Bitte nur CSV- oder Excel-Dateien hochladen.");
      return;
    }

    setLoading(true);
    setStatus("Datei wird hochgeladen...");

    const safeName = file.name.replaceAll(" ", "_");
    const filePath = `${carrier.toLowerCase()}/${Date.now()}-${safeName}`;

    const { error: storageError } = await supabase.storage
      .from("parcelmatch-uploads")
      .upload(filePath, file);

    if (storageError) {
      setStatus(`Upload fehlgeschlagen: ${storageError.message}`);
      setLoading(false);
      return;
    }

    setStatus("Datei gespeichert. Parser startet...");

    const { data: uploadData, error: dbError } = await supabase
      .from("uploads")
      .insert({
        carrier,
        file_name: file.name,
        file_path: filePath,
        status: "uploaded",
      })
      .select("id")
      .single();

    if (dbError) {
      setStatus(
        `Datei hochgeladen, aber DB-Eintrag fehlgeschlagen: ${dbError.message}`
      );
      setLoading(false);
      return;
    }

    try {
      const parsedShipments = await parseUpsInvoiceFile(file);

      if (parsedShipments.length === 0) {
        await supabase
          .from("uploads")
          .update({ status: "parsed_no_shipments" })
          .eq("id", uploadData.id);

        setStatus(
          "Datei gespeichert, aber der Parser hat keine Sendungen erkannt."
        );
        setLoading(false);
        await loadUploads();
        return;
      }

      const shipmentRows = parsedShipments.map((shipment) => ({
        carrier,
        upload_id: uploadData.id,
        tracking_number: shipment.tracking_number,
        customer_number: shipment.customer_number,
        service_name: shipment.service_name,
        destination_country: shipment.destination_country,
        frt_amount: shipment.frt_amount,
        fsc_amount: shipment.fsc_amount,
        acc_amount: shipment.acc_amount,
        total_amount: shipment.total_amount,
        matching_status: "open",
        claim_status: "none",
      }));

      const { error: shipmentError } = await supabase
        .from("shipments")
        .insert(shipmentRows);

      if (shipmentError) {
        await supabase
          .from("uploads")
          .update({ status: "parser_failed" })
          .eq("id", uploadData.id);

        setStatus(`Parserfehler: ${shipmentError.message}`);
        setLoading(false);
        await loadUploads();
        return;
      }

      await supabase
        .from("uploads")
        .update({ status: "parsed" })
        .eq("id", uploadData.id);

      setStatus(
        `Datei erfolgreich verarbeitet. ${parsedShipments.length} Sendungen erkannt und gespeichert.`
      );
      setFile(null);
      setLoading(false);
      await loadUploads();
    } catch {
      await supabase
        .from("uploads")
        .update({ status: "parser_failed" })
        .eq("id", uploadData.id);

      setStatus("Datei gespeichert, aber der Parser konnte sie nicht verarbeiten.");
      setLoading(false);
      await loadUploads();
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Upload Center
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          CSV- und Excel-Rechnungsdaten hochladen
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          Lade UPS-Rechnungen als CSV oder Excel hoch. ParcelMatch speichert die
          Datei und erzeugt daraus normalisierte Sendungen.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Neuer Upload
          </h2>

          <div className="mt-6 space-y-5">
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="UPS">UPS</option>
              <option value="FedEx">FedEx</option>
              <option value="DHL">DHL</option>
              <option value="Other">Andere</option>
            </select>

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            />

            {file ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {file.name}
                </p>
              </div>
            ) : null}

            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {loading ? "Verarbeitung läuft..." : "Datei hochladen und parsen"}
            </button>

            {status ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {status}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upload-Historie
          </h2>

          <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Datei</th>
                  <th className="px-4 py-3">Carrier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Zeitpunkt</th>
                  <th className="px-4 py-3">Aktion</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {uploads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                      Noch keine Uploads vorhanden.
                    </td>
                  </tr>
                ) : (
                  uploads.map((upload) => (
                    <tr key={upload.id}>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {upload.file_name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {upload.carrier}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          size="sm"
                          color={
                            upload.status === "parsed"
                              ? "success"
                              : upload.status === "parser_failed"
                              ? "error"
                              : "warning"
                          }
                        >
                          {upload.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {new Date(upload.created_at).toLocaleString("de-DE")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(upload)}
                          className="rounded-lg border border-error-300 px-3 py-2 text-sm font-medium text-error-600 hover:bg-error-50"
                        >
                          Löschen
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
