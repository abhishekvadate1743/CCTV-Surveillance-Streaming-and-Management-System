import React, { useEffect, useState } from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Stack, Alert, CircularProgress
} from '@mui/material'
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  DirectionsCar as VehicleIcon,
  SecurityCameras as MotionIcon,
  SecurityAlert as IntrusionIcon
} from '@mui/icons-material'
import axios from 'axios'

const AlertPanel = ({ cameraId }) => {
  const [alerts, setAlerts] = useState([])
  const [unacknowledgedAlerts, setUnacknowledgedAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [acknowledgeDialogOpen, setAcknowledgeDialogOpen] = useState(false)
  const [userId, setUserId] = useState(localStorage.getItem('userId') || 'admin')

  // Fetch alerts
  useEffect(() => {
    fetchAlerts()
    fetchUnacknowledgedAlerts()

    // Poll for new alerts every 5 seconds
    const interval = setInterval(() => {
      fetchAlerts()
      fetchUnacknowledgedAlerts()
    }, 5000)

    return () => clearInterval(interval)
  }, [cameraId])

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:5002/alerts', {
        params: {
          camera_id: cameraId,
          limit: 50,
          days: 7
        }
      })
      setAlerts(response.data.alerts || [])
    } catch (err) {
      console.log('Error fetching alerts:', err.message)
    }
  }

  const fetchUnacknowledgedAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:5002/alerts/unacknowledged')
      setUnacknowledgedAlerts(response.data.alerts || [])
    } catch (err) {
      console.log('Error fetching unacknowledged alerts:', err.message)
    }
  }

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      setLoading(true)
      await axios.patch(`http://localhost:5002/alerts/${alertId}/acknowledge`, {
        user_id: userId
      })
      setError('')
      setAcknowledgeDialogOpen(false)
      fetchAlerts()
      fetchUnacknowledgedAlerts()
    } catch (err) {
      setError(`Failed to acknowledge alert: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'person_detected':
        return <PersonIcon />
      case 'vehicle_detected':
        return <VehicleIcon />
      case 'motion_detected':
        return <MotionIcon />
      case 'intrusion_detected':
        return <IntrusionIcon />
      default:
        return <WarningIcon />
    }
  }

  const getAlertColor = (alertType) => {
    switch (alertType) {
      case 'intrusion_detected':
        return 'error'
      case 'person_detected':
        return 'warning'
      case 'vehicle_detected':
        return 'info'
      case 'motion_detected':
        return 'default'
      default:
        return 'default'
    }
  }

  const getAlertLabel = (alertType) => {
    switch (alertType) {
      case 'person_detected':
        return 'Person Detected'
      case 'vehicle_detected':
        return 'Vehicle Detected'
      case 'motion_detected':
        return 'Motion Detected'
      case 'intrusion_detected':
        return 'Intrusion Detected'
      default:
        return 'Alert'
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Unacknowledged Alerts Summary */}
      {unacknowledgedAlerts.length > 0 && (
        <Alert severity="warning" icon={<WarningIcon />}>
          {unacknowledgedAlerts.length} unacknowledged alert(s) - Action required!
        </Alert>
      )}

      {/* Active Alerts */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Active Alerts</Typography>
          <Chip
            label={`${unacknowledgedAlerts.length} New`}
            color={unacknowledgedAlerts.length > 0 ? 'error' : 'default'}
            size="small"
          />
        </Box>

        {unacknowledgedAlerts.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Confidence</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unacknowledgedAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Chip
                        icon={getAlertIcon(alert.type)}
                        label={getAlertLabel(alert.type)}
                        color={getAlertColor(alert.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{(alert.confidence * 100).toFixed(0)}%</TableCell>
                    <TableCell>
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setSelectedAlert(alert)
                          setAcknowledgeDialogOpen(true)
                        }}
                      >
                        Acknowledge
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
            No active alerts
          </Typography>
        )}
      </Paper>

      {/* Alert History */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Alert History (Last 7 Days)
        </Typography>

        {alerts.length > 0 ? (
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Confidence</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Chip
                        icon={getAlertIcon(alert.type)}
                        label={getAlertLabel(alert.type)}
                        color={getAlertColor(alert.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{(alert.confidence * 100).toFixed(0)}%</TableCell>
                    <TableCell>
                      {new Date(alert.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {alert.acknowledged ? (
                        <Chip
                          icon={<CheckIcon />}
                          label="Acknowledged"
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<WarningIcon />}
                          label="Pending"
                          color="warning"
                          size="small"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
            No alerts in history
          </Typography>
        )}
      </Paper>

      {/* Acknowledge Alert Dialog */}
      <Dialog open={acknowledgeDialogOpen} onClose={() => setAcknowledgeDialogOpen(false)}>
        <DialogTitle>Acknowledge Alert</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Typography>
                <strong>Alert Type:</strong> {getAlertLabel(selectedAlert.type)}
              </Typography>
              <Typography>
                <strong>Confidence:</strong> {(selectedAlert.confidence * 100).toFixed(0)}%
              </Typography>
              <Typography>
                <strong>Time:</strong> {new Date(selectedAlert.timestamp).toLocaleString()}
              </Typography>
              <TextField
                label="User ID"
                fullWidth
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <Typography variant="body2" color="textSecondary">
                Click "Confirm" to acknowledge this alert
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcknowledgeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleAcknowledgeAlert(selectedAlert.id)}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AlertPanel
