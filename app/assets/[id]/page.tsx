"use client"

import { useParams } from 'next/navigation'
import AssetDetailsContent from '@/components/assets/asset-details-content'
import DashboardLayout from '@/components/dashboard/dashboard-layout'

export default function AssetDetailsPage() {
  const { id } = useParams()

  return (
    <DashboardLayout>
      <AssetDetailsContent assetId={id as string} />
    </DashboardLayout>
  )
}
