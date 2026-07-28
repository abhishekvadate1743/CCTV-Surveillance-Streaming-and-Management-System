import { useEffect, useState } from 'react'
import {
  Box, Grid, Paper, Typography, Card, CardContent, CircularProgress,
  Alert
} from '@mui/material'
import {
  Videocam as VideocamIcon,
  VideoLibrary as VideoLibraryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import { analyticsAPI, cameraAPI } from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, camerasRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        cameraAPI.getAll()
      ])
      setStats(statsRes.data.summary)
      setCameras(camerasRes.data.cameras)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ fontSize: 40, opacity: 0.3 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  const onlineCameras = cameras.filter(c => c.status === 'online').length
  const offlineCameras = cameras.filter(c => c.status === 'offline').length

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Cameras"
            value={cameras.length}
            icon={<VideocamIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Online Cameras"
            value={onlineCameras}
            icon={<CheckCircleIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Offline Cameras"
            value={offlineCameras}
            icon={<WarningIcon />}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Unacknowledged Alerts"
            value={stats?.unacknowledgedAlerts || 0}
            icon={<VideoLibraryIcon />}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      {/* Events Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Last 24 Hours Events
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#1976d2' }}>
                    {stats?.motionEvents || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Motion Events
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#4caf50' }}>
                    {stats?.personDetected || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    People Detected
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#ff9800' }}>
                    {stats?.vehicleDetected || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Vehicles Detected
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#f44336' }}>
                    {stats?.intrusions || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Intrusions
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Camera Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Camera Status Overview
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { name: 'Online', value: onlineCameras },
                  { name: 'Offline', value: offlineCameras }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Cameras */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Recent Cameras
        </Typography>
        <Grid container spacing={2}>
          {cameras.slice(0, 6).map((camera) => (
            <Grid item xs={12} sm={6} md={4} key={camera._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {camera.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {camera.location}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      Status:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: camera.status === 'online' ? '#4caf50' : '#f44336',
                        fontWeight: 'bold'
                      }}
                    >
                      {camera.status.toUpperCase()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  )
}

export default Dashboard
