"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, ArrowDownToLine, ArrowUpFromLine, AlertCircle, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"

interface UnitTransaction {
  part_number: string
  description: string
  category: string
  inbound_number: string
  inbound_date: string
  supplier: string
  inbound_user: string
  outbound_number: string | null
  outbound_date: string | null
  destination: string | null
  outbound_user: string | null
  status: 'in_stock' | 'out_stock'
  inbound_created_at: string
  outbound_created_at: string | null
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalParts: 0,
    totalInbound: 0,
    totalOutbound: 0,
    lowStock: 0
  })
  const [units, setUnits] = useState<UnitTransaction[]>([])
  const [filteredUnits, setFilteredUnits] = useState<UnitTransaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchStats()
    fetchUnitTransactions()
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    filterUnits()
  }, [searchTerm, units])

  const fetchStats = async () => {
    try {
      setLoading(true)

      // Get total parts
      const { count: partsCount } = await supabase
        .from('parts')
        .select('*', { count: 'exact', head: true })

      // Get total inbound
      const { count: inboundCount } = await supabase
        .from('inbound_headers')
        .select('*', { count: 'exact', head: true })

      // Get total outbound
      const { count: outboundCount } = await supabase
        .from('outbound_headers')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalParts: partsCount || 0,
        totalInbound: inboundCount || 0,
        totalOutbound: outboundCount || 0,
        lowStock: 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnitTransactions = async () => {
    try {
      // Fetch inbound transactions with details
      const { data: inboundData, error: inboundError } = await supabase
        .from('inbound_headers')
        .select(`
          inbound_number,
          inbound_date,
          supplier,
          inbound_user,
          created_at,
          inbound_details (
            qty,
            parts (
              part_number,
              description,
              categories (category_name)
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (inboundError) throw inboundError

      // Fetch outbound transactions with details
      const { data: outboundData, error: outboundError } = await supabase
        .from('outbound_headers')
        .select(`
          outbound_number,
          outbound_date,
          destination,
          outbound_user,
          created_at,
          outbound_details (
            qty,
            parts (
              part_number,
              description,
              categories (category_name)
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (outboundError) throw outboundError

      // Create unit-level tracking
      const unitList: UnitTransaction[] = []
      
      // Process inbound - create individual units
      inboundData?.forEach((header: any) => {
        header.inbound_details?.forEach((detail: any) => {
          // Create individual units based on qty
          for (let i = 0; i < detail.qty; i++) {
            unitList.push({
              part_number: detail.parts?.part_number || '',
              description: detail.parts?.description || '',
              category: detail.parts?.categories?.category_name || '',
              inbound_number: header.inbound_number,
              inbound_date: header.inbound_date,
              supplier: header.supplier,
              inbound_user: header.inbound_user,
              outbound_number: null,
              outbound_date: null,
              destination: null,
              outbound_user: null,
              status: 'in_stock',
              inbound_created_at: header.created_at,
              outbound_created_at: null
            })
          }
        })
      })

      // Process outbound - match with inbound units
      outboundData?.forEach((header: any) => {
        header.outbound_details?.forEach((detail: any) => {
          const partNumber = detail.parts?.part_number
          let qtyToMatch = detail.qty
          
          // Find matching inbound units that haven't been outbounded yet
          for (let i = 0; i < unitList.length && qtyToMatch > 0; i++) {
            if (unitList[i].part_number === partNumber && unitList[i].status === 'in_stock') {
              // Update this unit with outbound info
              unitList[i].outbound_number = header.outbound_number
              unitList[i].outbound_date = header.outbound_date
              unitList[i].destination = header.destination
              unitList[i].outbound_user = header.outbound_user
              unitList[i].status = 'out_stock'
              unitList[i].outbound_created_at = header.created_at
              qtyToMatch--
            }
          }
        })
      })

      // Sort by most recent activity (either inbound or outbound)
      unitList.sort((a, b) => {
        const aDate = a.outbound_created_at || a.inbound_created_at
        const bDate = b.outbound_created_at || b.inbound_created_at
        return new Date(bDate).getTime() - new Date(aDate).getTime()
      })

      setUnits(unitList.slice(0, 100)) // Limit to 100 most recent
    } catch (error) {
      console.error('Error fetching unit transactions:', error)
    }
  }

  const filterUnits = () => {
    if (!searchTerm) {
      setFilteredUnits(units)
      return
    }

    const filtered = units.filter(u =>
      u.inbound_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.outbound_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUnits(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome to Mini Warehouse Inventory System</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
              <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalParts}</div>
              <p className="text-xs text-gray-500 mt-1">Active parts in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inbound Transactions</CardTitle>
              <ArrowDownToLine className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalInbound}</div>
              <p className="text-xs text-gray-500 mt-1">Total inbound records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outbound Transactions</CardTitle>
              <ArrowUpFromLine className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalOutbound}</div>
              <p className="text-xs text-gray-500 mt-1">Total outbound records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.lowStock}</div>
              <p className="text-xs text-gray-500 mt-1">Items need attention</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={() => router.push('/inbound')}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <ArrowDownToLine className="h-6 w-6 text-green-600 mb-2" />
                <h3 className="font-semibold">Add Inbound</h3>
                <p className="text-sm text-gray-500">Record incoming inventory</p>
              </button>

              <button
                onClick={() => router.push('/outbound')}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <ArrowUpFromLine className="h-6 w-6 text-red-600 mb-2" />
                <h3 className="font-semibold">Add Outbound</h3>
                <p className="text-sm text-gray-500">Record outgoing inventory</p>
              </button>

              <button
                onClick={() => router.push('/stock-monitor')}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Package className="h-6 w-6 text-blue-600 mb-2" />
                <h3 className="font-semibold">Stock Monitor</h3>
                <p className="text-sm text-gray-500">View current stock levels</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions (Unit Level)</CardTitle>
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by inbound number, supplier, part number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading transactions...</div>
            ) : filteredUnits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead className="text-xs">Part Number</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs">Inbound Number</TableHead>
                      <TableHead className="text-xs">Inbound Date</TableHead>
                      <TableHead className="text-xs">Supplier</TableHead>
                      <TableHead className="text-xs">Inbound User</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs">Qty (un)</TableHead>
                      <TableHead className="text-xs">Outbound Number</TableHead>
                      <TableHead className="text-xs">Outbound Date</TableHead>
                      <TableHead className="text-xs">Destination</TableHead>
                      <TableHead className="text-xs">Outbound User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnits.map((unit, index) => (
                      <TableRow 
                        key={index} 
                        className={unit.status === 'in_stock' ? 'bg-green-50 text-xs' : 'bg-white text-xs'}
                      >
                        <TableCell className="font-medium text-xs py-2">{unit.part_number}</TableCell>
                        <TableCell className="text-xs py-2">{unit.description}</TableCell>
                        <TableCell className="text-xs py-2">
                          <span className="text-green-700 font-medium">{unit.inbound_number}</span>
                        </TableCell>
                        <TableCell className="text-xs py-2">{formatDate(unit.inbound_date)}</TableCell>
                        <TableCell className="text-xs py-2">{unit.supplier}</TableCell>
                        <TableCell className="text-xs py-2">{unit.inbound_user}</TableCell>
                        <TableCell className="text-xs py-2">{unit.category || '-'}</TableCell>
                        <TableCell className="text-center text-xs py-2">1</TableCell>
                        <TableCell className="text-xs py-2">
                          {unit.outbound_number ? (
                            <span className="text-red-700 font-medium">{unit.outbound_number}</span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-xs py-2">
                          {unit.outbound_date ? formatDate(unit.outbound_date) : '-'}
                        </TableCell>
                        <TableCell className="text-xs py-2">{unit.destination || '-'}</TableCell>
                        <TableCell className="text-xs py-2">{unit.outbound_user || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Showing {filteredUnits.length} unit(s)</p>
                  <p className="mt-1">
                    <span className="inline-block w-4 h-4 bg-green-50 border mr-2"></span>
                    In Stock
                    <span className="inline-block w-4 h-4 bg-white border ml-4 mr-2"></span>
                    Out of Stock
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
