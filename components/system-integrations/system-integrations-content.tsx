import { useState, useEffect } from "react"
import { Zap, ShieldCheck, AlertTriangle, Plus, ChevronRight, RefreshCw, List } from "lucide-react"
import { apiGet, apiPost } from "@/lib/fetcher"

interface Integration {
  id: string
  name: string
  type: "EMR" | "CMMS"
  logo: string
  status: "Connected" | "Not Connected"
  lastSync?: string
}

export default function SystemIntegrationsContent() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [connectionStep, setConnectionStep] = useState("initial")

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      setIsLoading(true)
      const data = await apiGet<Integration[]>("/api/system-integrations")
      setIntegrations(data)
    } catch (error) {
      console.error("Failed to load integrations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectClick = (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsModalOpen(true)
    setConnectionStep("initial")
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedIntegration(null)
    setApiKey("")
  }

  const handleConnect = async () => {
    if (!selectedIntegration) return

    setConnectionStep("verifying")
    try {
      await apiPost("/api/system-integrations/connect", { apiKey })
      setConnectionStep("successful")
      setIntegrations(integrations.map(int => 
        int.id === selectedIntegration.id ? { ...int, status: "Connected", lastSync: new Date().toISOString() } : int
      ))
      setTimeout(() => {
        handleModalClose()
      }, 2000)
    } catch (error) {
      setConnectionStep("failed")
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-light text-gray-800">System Integration Readiness</h1>

        {/* Available Integrations */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Available Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map(integration => (
              <div key={integration.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* <img src={integration.logo} alt={integration.name} className="h-10 w-10" /> */}
                  <div>
                    <p className="font-semibold text-gray-800">{integration.name}</p>
                    <p className="text-sm text-gray-500">{integration.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleConnectClick(integration)}
                  disabled={integration.status === "Connected"}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${integration.status === "Connected"
                      ? "bg-green-100 text-green-700 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}>
                  {integration.status === "Connected" ? "Connected" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Status Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Connection Status</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-sm font-medium text-gray-600">Platform</th>
                <th className="p-4 text-sm font-medium text-gray-600">Type</th>
                <th className="p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="p-4 text-sm font-medium text-gray-600">Last Sync</th>
                <th className="p-4 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {integrations.filter(int => int.status === "Connected").map(integration => (
                <tr key={integration.id} className="border-b">
                  <td className="p-4 flex items-center gap-3">
                    {/* <img src={integration.logo} alt={integration.name} className="h-8 w-8" /> */}
                    {integration.name}
                  </td>
                  <td className="p-4 text-gray-600">{integration.type}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      Connected
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{new Date(integration.lastSync!).toLocaleString()}</td>
                  <td className="p-4 flex items-center gap-2">
                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-md"><RefreshCw size={16} /></button>
                    <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-md"><List size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Integration Setup Wizard Modal */}
        {isModalOpen && selectedIntegration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Connect to {selectedIntegration.name}</h2>
              <p className="text-gray-600 mb-6">Follow the steps to securely connect your account.</p>

              {connectionStep === "initial" && (
                <>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                  <input
                    id="apiKey"
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your API key"
                  />
                  <div className="mt-6 flex justify-end gap-3">
                    <button onClick={handleModalClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleConnect} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Connect</button>
                  </div>
                </>
              )}

              {connectionStep === "verifying" && (
                <div className="text-center py-8">
                  <RefreshCw className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700">Verifying connection...</p>
                </div>
              )}

              {connectionStep === "successful" && (
                <div className="text-center py-8">
                  <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700">Integration Successful!</p>
                </div>
              )}

              {connectionStep === "failed" && (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-4">Connection Failed</p>
                  <p className="text-sm text-gray-600 mb-6">Please check your API key and try again.</p>
                  <button onClick={() => setConnectionStep("initial")} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Try Again</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
