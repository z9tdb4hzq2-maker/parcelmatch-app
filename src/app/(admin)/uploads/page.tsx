"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [carrier, setCarrier] = useState("UPS");
  const [status, setStatus] = useState("");

  async function handleUpload() {
    if (!file) {
      setStatus("Bitte zuerst eine Datei auswählen.");
      return;
    }

    setStatus("Upload läuft...");

    const filePath = `${carrier.toLowerCase()}/${Date.now()}-${file.name}`;

    const { error: storageError } = await supabase.storage
      .from("parcelmatch-uploads")
      .upload(filePath, file);

    if (storageError) {
      setStatus(`Upload fehlgeschlagen: ${storageError.message}`);
      return;
    }

    const { error: dbError } = await supabase.from("uploads").insert({
      carrier,
      file_name: file.name,
      file_path: filePath,
      status: "uploaded",
    });

    if (dbError) {
      setStatus(`Datei hochgeladen, aber DB-Eintrag fehlgeschlagen: ${dbError.message}`);
      return;
    }

    setStatus("Datei erfolgreich hochgeladen.");
    setFile(null);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Upload Center
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Rechnungen, Verträge und Carrier-Dateien hochladen
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          Lade UPS-Rechnungen, CSV-/Excel-Dateien oder Vertragsdokumente hoch.
          Die Dateien werden sicher in Supabase Storage gespeichert und später
          vom Parser verarbeitet.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Neuer Upload
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Carrier
              </label>

              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="UPS">UPS</option>
                <option value="FedEx">FedEx</option>
                <option value="DHL">DHL</option>
                <option value="Other">Andere</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Datei auswählen
              </label>

              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 shadow-theme-xs file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-600 hover:file:bg-brand-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>

            {file ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Ausgewählte Datei
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {file.name}
                </p>
              </div>
            ) : null}

            <button
              onClick={handleUpload}
              className="w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600"
            >
              Datei hochladen
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
            Upload-Verarbeitung
          </h2>

          <div className="mt-5 space-y-4">
            <Step
              title="1. Datei speichern"
              text="Datei wird in Supabase Storage abgelegt."
            />
            <Step
              title="2. Upload registrieren"
              text="Metadaten werden in der Tabelle uploads gespeichert."
            />
            <Step
              title="3. Parser vorbereiten"
              text="Im nächsten Schritt liest ParcelMatch Trackingnummern, FRT, FSC und ACC aus."
            />
            <Step
              title="4. Dashboard aktualisieren"
              text="Nach Verarbeitung werden Rechnungen, Sendungen und Claims sichtbar."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </p>
      <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
        {text}
      </p>
    </div>
  );
}
