'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import {
  Calendar,
  DollarSign,
  ShoppingBag,
  Utensils,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import React from 'react'

const salesData = [
  { month: 'Jan', sales: 4000 },
  { month: 'Feb', sales: 3000 },
  { month: 'Mar', sales: 5000 },
  { month: 'Apr', sales: 4500 },
  { month: 'May', sales: 6000 },
  { month: 'Jun', sales: 5500 }
]

const popularItems = [
  { name: 'Margherita Pizza', orders: 150, color: '#FF6384' },
  { name: 'Spaghetti Carbonara', orders: 120, color: '#36A2EB' },
  { name: 'Caesar Salad', orders: 100, color: '#FFCE56' },
  { name: 'Tiramisu', orders: 80, color: '#4BC0C0' },
  { name: 'Grilled Salmon', orders: 75, color: '#9966FF' }
]

const revenueData = [
  { date: '2023-01-01', revenue: 10000 },
  { date: '2023-02-01', revenue: 12000 },
  { date: '2023-03-01', revenue: 11000 },
  { date: '2023-04-01', revenue: 13000 },
  { date: '2023-05-01', revenue: 15000 },
  { date: '2023-06-01', revenue: 14000 },
  { date: '2023-07-01', revenue: 16000 },
  { date: '2023-08-01', revenue: 18000 },
  { date: '2023-09-01', revenue: 17000 },
  { date: '2023-10-01', revenue: 19000 },
  { date: '2023-11-01', revenue: 20000 },
  { date: '2023-12-01', revenue: 22000 }
]

export default function RestaurantDashboard() {
  const [dateRange, setDateRange] = useState('6m')
  const [ordersFinished, setOrdersFinished] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setOrdersFinished((prev) => prev + 1)
    }, 5000) // Increment orders every 5 seconds for demo purposes

    return () => clearInterval(interval)
  }, [])

  const currentRevenue = revenueData[revenueData.length - 1].revenue
  const previousRevenue = revenueData[revenueData.length - 2].revenue
  const revenueChange =
    ((currentRevenue - previousRevenue) / previousRevenue) * 100

  return (
    <div className="p-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${currentRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              {revenueChange >= 0 ? (
                <>
                  <ArrowUp className="text-green-500 mr-1" />
                  <span className="text-green-500">
                    +{revenueChange.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDown className="text-red-500 mr-1" />
                  <span className="text-red-500">
                    {revenueChange.toFixed(1)}%
                  </span>
                </>
              )}
              {' from last month'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Orders Finished
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersFinished}</div>
            <p className="text-xs text-muted-foreground">
              +12.2% from last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Order Value
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$32.50</div>
            <p className="text-xs text-muted-foreground">+8% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">Last Month</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={popularItems}
                  dataKey="orders"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {popularItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
