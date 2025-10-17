"use client"

import type React from "react"

export default function DashboardContent() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-light" style={{ color: "#001f3f" }}>
          Overview
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Assets", subtitle: "In System", value: "155" },
          { title: "Total Assets", subtitle: "Category", value: "4" },
          { title: "Total Facilities", subtitle: "Facility", value: "2" },
          { title: "Total Users", subtitle: "Active", value: "3" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
              {card.title}
            </p>
            <p className="text-xs text-gray-600 mb-4">{card.subtitle}</p>
            <p className="text-4xl font-light" style={{ color: "#001f3f" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Tagged */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#0d7a8c" }}>
                Asset Tagged
              </p>
              <p className="text-3xl font-light" style={{ color: "#001f3f" }}>
                46
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#c41e3a" }}>
                Untagged
              </p>
              <p className="text-3xl font-light" style={{ color: "#001f3f" }}>
                109
              </p>
            </div>

            <div className="flex justify-center py-6">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#E0E6ED" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#0D7A8C"
                    strokeWidth="8"
                    strokeDasharray="75.4 251.3"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#C41E3A"
                    strokeWidth="8"
                    strokeDasharray="175.9 251.3"
                    strokeDashoffset="-75.4"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-light" style={{ color: "#001f3f" }}>
                    30%
                  </p>
                  <p className="text-xs text-gray-600">Asset Tagged</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 text-center">0 Assets tagged in last 7 days</p>
          </div>
        </div>

        {/* Assets Overview */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-medium uppercase tracking-wide mb-6" style={{ color: "#001f3f" }}>
            Assets Overview
          </h3>
          <div className="space-y-4">
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">No records found!</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "⚠️", label: "Assets Not Found", value: "0" },
                { icon: "⏱️", label: "Assets In Use", value: "0" },
                { icon: "✓", label: "Assets Found", value: "0" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="flex justify-center mb-2 text-2xl">{item.icon}</div>
                  <p className="text-2xl font-light" style={{ color: "#001f3f" }}>
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zones */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-medium uppercase tracking-wide mb-6" style={{ color: "#001f3f" }}>
            Zones Not Scanned
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "#0d7a8c" }}>
                Today
              </span>
              <span className="text-xs text-gray-600">Time</span>
            </div>
            <div className="space-y-3">
              {["Mod...", "Emo...", "Clini..."].map((zone, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: ["#fee2e2", "#fed7aa", "#fecaca"][i] }}
                  ></div>
                  <span className="text-sm font-light" style={{ color: "#001f3f" }}>
                    {zone}
                  </span>
                </div>
              ))}
            </div>
            <button
              className="w-full text-center text-sm transition-opacity hover:opacity-80 py-2"
              style={{ color: "#0d7a8c" }}
            >
              4 +
            </button>
          </div>
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-light mb-6" style={{ color: "#001f3f" }}>
          Visibility and Location
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#0d7a8c" }}>
                  Assets Scanned
                </p>
                <p className="text-3xl font-light" style={{ color: "#001f3f" }}>
                  0
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#c41e3a" }}>
                  Assets Not Scanned
                </p>
                <p className="text-3xl font-light" style={{ color: "#001f3f" }}>
                  155
                </p>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r h-full rounded-full"
                style={{ width: "0%", backgroundImage: "linear-gradient(to right, #0d7a8c, #c41e3a)" }}
              ></div>
            </div>
            <div className="mt-4">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
              >
                <option>Day</option>
                <option>Week</option>
                <option>Month</option>
              </select>
            </div>
            <button className="mt-4 text-sm transition-opacity hover:opacity-80" style={{ color: "#0d7a8c" }}>
              Today
            </button>
          </div>
          <div className="flex items-center justify-center bg-slate-100 rounded-lg p-8 min-h-64">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-sm text-gray-600">Chart visualization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
