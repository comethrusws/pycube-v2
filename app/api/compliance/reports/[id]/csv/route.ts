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
    const rows = [["Asset","Department","Missed Maintenance","Overdue Calibration","Recall","Risk Score"],
      ...((json.assetRisks || []).map((r: any) => [r.assetName, r.departmentName, r.missedMaintenance, r.overdueCalibration, r.recallFlag ? "Yes" : "No", r.riskScore]))]
    const csv = rows.map((r: any[]) => r.join(",")).join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=${id}.csv`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}


