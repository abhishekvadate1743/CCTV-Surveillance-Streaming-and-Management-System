import { useEffect, useState } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, CircularProgress, Alert, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, Card, CardContent
} from '@mui/material'
import { Check as CheckIcon } from '@mui/icons-material'
import { analyticsAPI } from '../services/api'

const Analytics = () => {
  const [events, setEvents] = useState([])
  const [unacknowledged, setUnacknowledged] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [openDetail, setOpenDetail] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [eventsRes, alertsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getUnacknowledged()
      ])
      setUnacknowledged(alertsRes.data.alerts)
    } catch (err) {
      setError('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async (id) => {
    try {
      await analyticsAPI.acknowledge(id)
      fetchAnalytics()
    } catch (err) {
      setError('Failed to acknowledge alert')
    }
  }

  const handleShowDetail = (event) => {
    setSelectedEvent(event)
    setOpenDetail(true)
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
  }

  const getEventColor = (type) => {
    const colors = {
      'motion': '#1976d2',
      'person-detected': '#4caf50',
      'vehicle-detected': '#ff9800',
      'intrusion': '#f44336',
      'unusual-activity': '#9c27b0'
    }
    return colors[type] || '#666'
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Analytics & Alerts
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Unacknowledged Alerts Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#fff3e0' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unacknowledged Alerts
              </Typography>
              <Typography variant="h4">{unacknowledged.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Unacknowledged Alerts */}
      {unacknowledged.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#fff3e0', border: '2px solid #ff9800' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#f57c00' }}>
            ⚠️ Pending Alerts - Action Required
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#ffe0b2' }}>
                  <TableCell><strong>Event</strong></TableCell>
                  <TableCell><strong>Camera</strong></TableCell>
                  <TableCell><strong>Confidence</strong></TableCell>
                  <TableCell><strong>Time</strong></TableCell>
                  <TableCell align="right"><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unacknowledged.map((event) => (
                  <TableRow key={event._id} hover>
                    <TableCell>
                      <Chip label={event.eventType} size="small" style={{ backgroundColor: getEventColor(event.eventType), color: 'white' }} />
                    </TableCell>
                    <TableCell>{event.camera?.name || 'N/A'}</TableCell>
                    <TableCell>{event.confidence}%</TableCell>
                    <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckIcon />}
                        onClick={() => handleAcknowledge(event._id)}
                      >
                        Acknowledge
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {unacknowledged.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#c8e6c9', border: '2px solid #4caf50' }}>
          <Typography variant="h6" sx={{ color: '#2e7d32' }}>
            ✓ All alerts acknowledged
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default Analytics
