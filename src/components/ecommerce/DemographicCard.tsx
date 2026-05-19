"use client";
import { useState } from "react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

const regions = [
  {
    country: "Deutschland",
    shipments: "4.182 Sendungen",
    cost: "€241.800",
    share: "79%",
    width: "79%",
  },
  {
    country: "Frankreich",
    shipments: "1.904 Sendungen",
    cost: "€198.320",
    share: "63%",
    width: "63%",
  },
  {
    country: "Italien",
    shipments: "812 Sendungen",
    cost: "€104.470",
    share: "38%",
    width: "38%",
  },
  {
    country: "Spanien",
    shipments: "441 Sendungen",
    cost: "€79.240",
    share: "28%",
    width: "28%",
  },
];

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Kosten nach Zielregion
          </h3>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            Sendungsvolumen, Kosten und Carrier-Performance je Land.
          </p>
        </div>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>

          <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-44 p-2">
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Länder öffnen
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Export vorbereiten
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="my-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white p-4 dark:bg-white/[0.03]">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">
              Top Zielregion
            </p>
            <p className="mt-2 text-xl font-semibold text-gray-800 dark:text-white/90">
              Deutschland
            </p>
            <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
              4.182 Sendungen
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 dark:bg-white/[0.03]">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">
              Regionale Kosten
            </p>
            <p className="mt-2 text-xl font-semibold text-gray-800 dark:text-white/90">
              €623.830
            </p>
            <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
              4 Hauptmärkte
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {regions.map((region) => (
          <div key={region.country} className="flex items-center justify-between">
            <div>
              <p className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
                {region.country}
              </p>
              <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                {region.shipments} · {region.cost}
              </span>
            </div>

            <div className="flex w-full max-w-[150px] items-center gap-3">
              <div className="relative block h-2 w-full max-w-[105px] rounded-sm bg-gray-200 dark:bg-gray-800">
                <div
                  className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                  style={{ width: region.width }}
                />
              </div>
              <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {region.share}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
