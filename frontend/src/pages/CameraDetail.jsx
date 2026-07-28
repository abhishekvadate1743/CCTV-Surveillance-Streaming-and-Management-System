import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Button, CircularProgress, Alert, Chip, Grid, Card, CardContent
} from '@mui/material'
import { ArrowBack as ArrowBackIcon, Videocam as VideocamIcon } from '@mui/icons-material'
import { cameraAPI, recordingAPI, analyticsAPI } from '../services/api'

const CameraDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [camera, setCamera] = useState(null)
  const [recordings, setRecordings] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDetails()
  }, [id])

  const fetchDetails = async () => {
    try {
      const [cameraRes, recordingsRes, eventsRes] = await Promise.all([
        cameraAPI.getById(id),
        recordingAPI.getByCamera(id, '2024-01-01', new Date().toISOString()),
        analyticsAPI.getByCamera(id)
      ])
      setCamera(cameraRes.data.camera)
      setRecordings(recordingsRes.data.recordings)
      setEvents(eventsRes.data.events)
    } catch (err) {
      setError('Failed to load camera details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
  }

  if (!camera) {
    return <Alert severity="error">Camera not found</Alert>
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/cameras')} sx={{ mb: 2 }}>
        Back to Cameras
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Camera Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              {camera.name}
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              {camera.location}
            </Typography>
          </Box>
          <Chip
            label={camera.status.toUpperCase()}
            color={camera.status === 'online' ? 'success' : 'error'}
          />
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">
              Camera Type
            </Typography>
            <Typography variant="body1">{camera.cameraType}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">
              Stream URL
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              {camera.streamUrl}
            </Typography>
          </Grid>
          {camera.rtspUrl && (
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                RTSP URL
              </Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                {camera.rtspUrl}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Live Stream Preview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Live Stream Preview
        </Typography>
        <Box
          sx={{
            width: '100%',
            height: 400,
            backgroundColor: '#000',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <VideocamIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography>Live stream integration coming soon</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Recent Recordings & Events */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Recent Recordings ({recordings.length})
            </Typography>
            {recordings.slice(0, 5).map((rec) => (
              <Box key={rec._id} sx={{ p: 1, borderBottom: '1px solid #eee' }}>
                <Typography variant="body2">{rec.fileName}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(rec.startTime).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Recent Events ({events.length})
            </Typography>
            {events.slice(0, 5).map((event) => (
              <Box key={event._id} sx={{ p: 1, borderBottom: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{event.eventType}</Typography>
                  <Chip label={`${event.confidence}%`} size="small" />
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {new Date(event.timestamp).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CameraDetail
