import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const segs = url.pathname.split("/")
    const idx = segs.findIndex((s) => s === "reports")
    const id = idx >= 0 && segs.length > idx + 1 ? segs[idx + 1] : ""
    const file = join(process.cwd(), "data", "reports", `${id}.json`)
    const raw = readFileSync(file, "utf-8")
    const json = JSON.parse(raw)
    const rows = (json.assetRisks || []).slice(0, 500).map((a: any) => `
      <tr>
        <td style='padding:6px;border:1px solid #e5e7eb;'>${a.assetName}</td>
        <td style='padding:6px;border:1px solid #e5e7eb;'>${a.departmentName}</td>
        <td style='padding:6px;border:1px solid #e5e7eb;'>${a.missedMaintenance}</td>
        <td style='padding:6px;border:1px solid #e5e7eb;'>${a.overdueCalibration}</td>
        <td style='padding:6px;border:1px solid #e5e7eb;'>${a.recallFlag ? 'Yes' : 'No'}</td>
        <td style='padding:6px;border:1px solid #e5e7eb;'>${a.riskScore}</td>
      </tr>
    `).join("")
    const s = json.summary || {}
    const html = `<!doctype html><html><head><meta charset='utf-8'><title>${id}</title></head><body>
      <h2>Compliance Report</h2>
      <p>Overall Score: ${s.overallScore ?? 0} | Total Assets: ${s.totalAssets ?? 0} | Fully Compliant: ${s.fullyCompliant ?? 0} | Overdue Maintenance: ${s.overdueMaintenance ?? 0} | Avg Risk: ${s.averageRiskScore ?? 0}</p>
      <table style='border-collapse:collapse;width:100%;font-family:sans-serif;font-size:12px;'>
        <thead>
          <tr>
            <th style='padding:6px;border:1px solid #e5e7eb;'>Asset</th>
            <th style='padding:6px;border:1px solid #e5e7eb;'>Department</th>
            <th style='padding:6px;border:1px solid #e5e7eb;'>Missed Maintenance</th>
            <th style='padding:6px;border:1px solid #e5e7eb;'>Overdue Calibration</th>
            <th style='padding:6px;border:1px solid #e5e7eb;'>Recall</th>
            <th style='padding:6px;border:1px solid #e5e7eb;'>Risk Score</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>`
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename=${id}.html`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}


