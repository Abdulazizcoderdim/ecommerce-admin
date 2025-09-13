"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type Operator, apiService } from "@/lib/api"
import { Users, UserCheck, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchOperators = async () => {
    try {
      setLoading(true)
      const operatorData = await apiService.getOperators()
      setOperators(operatorData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch operators",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOperators()
  }, [])

  return (
    <div className="space-y-6">
      <DashboardHeader title="Operators" description="Manage system operators and their assignments" />

      <div className="grid gap-4 md:grid-cols-3 px-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operators.length}</div>
            <p className="text-xs text-muted-foreground">Registered operators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(operators.length * 0.8)}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">Average order processing</p>
          </CardContent>
        </Card>
      </div>

      <div className="px-6">
        <Card>
          <CardHeader>
            <CardTitle>Operator List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading operators...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Orders Handled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operators.map((operator, index) => (
                      <TableRow key={operator._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-secondary-foreground">
                                {operator.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{operator.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>{operator.email}</TableCell>
                        <TableCell>
                          <Badge variant={index % 3 === 0 ? "default" : "secondary"}>
                            {index % 3 === 0 ? "Active" : "Offline"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(operator.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className="font-medium">{Math.floor(Math.random() * 50) + 10}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
