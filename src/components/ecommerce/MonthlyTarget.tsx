"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { MoreDotIcon } from "@/icons";
import { useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyTarget() {
  const series = [82.4];

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Audit Fortschritt"],
  };

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="rounded-2xl bg-white px-5 pt-5 pb-11 shadow-default dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Audit & Recovery Ziel
            </h3>
            <p className="mt-1 text-theme-sm font-normal text-gray-500 dark:text-gray-400">
              Fortschritt geprüfter Rechnungen, Matching und Claims.
            </p>
          </div>

          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>

            <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-44 p-2">
              <DropdownItem
                tag="a"
                onItemClick={closeDropdown}
                className="flex w-full rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Details öffnen
              </DropdownItem>
              <DropdownItem
                tag="a"
                onItemClick={closeDropdown}
                className="flex w-full rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export vorbereiten
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

          <span className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            +14 geprüfte Rechnungen
          </span>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          82,4% der hochgeladenen Rechnungsdaten sind geprüft oder erfolgreich
          mit Sendungen und Vertragslogik abgeglichen.
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Audit Ziel
          </p>
          <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            95%
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Recovery
          </p>
          <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            €12.640
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Offen
          </p>
          <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            18 Claims
          </p>
        </div>
      </div>
    </div>
  );
}
