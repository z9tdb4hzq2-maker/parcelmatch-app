import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";

export const metadata: Metadata = {
  title: "ParcelMatch Dashboard",
  description: "ParcelMatch SaaS Platform Dashboard",
};

export default function ParcelMatchDashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            ParcelMatch Control Center
          </p>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Paketkosten, Rechnungen, Claims und Matching auf einen Blick
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            UPS-first Dashboard für Vertragsanalyse, Rechnungsprüfung,
            Zuschlagskontrolle, Claim-Erkennung und spätere Multi-Carrier
            Optimierung.
          </p>
        </div>
      </div>

      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />
        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>
    </div>
  );
}
