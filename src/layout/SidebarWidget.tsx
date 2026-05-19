import React from "react";

export default function SidebarWidget() {
  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
          Workspace
        </p>

        <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
          ParcelMatch Enterprise
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          UPS-first Audit Plattform für Rechnungsprüfung, Claim Detection,
          Matching und Multi-Carrier Intelligence.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl bg-white p-3 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Aktive Rechnungen
          </p>

          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            18.402
          </p>
        </div>

        <div className="rounded-xl bg-white p-3 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Claim Potenzial
          </p>

          <p className="mt-1 text-lg font-semibold text-success-600">
            €12.640
          </p>
        </div>
      </div>
    </div>
  );
}
