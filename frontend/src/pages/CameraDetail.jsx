import React, { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container, Box, Paper, Typography, Grid, Button, Alert, CircularProgress,
  Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  VideoCall as StreamIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'
import { AuthContext } from '../context/AuthContext'
import VideoPlayer from '../components/VideoPlayer'
import api from '../services/api'

const CameraDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [camera, setCamera] = useState(null)
  const [recordings, setRecordings] = useState([])
  const [analytics, setAnalytics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [streamActive, setStreamActive] = useState(false)
  const [streamLoading, setStreamLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState({})
  const [streamUrl, setStreamUrl] = useState('')
  const [phase3Status, setPhase3Status] = useState({
    rtspToHls: false,
    liveStream: false,
    videoPlayer: true,
    qualityAdaptation: false,
    recordingFromStream: false
  })

  // Fetch camera details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        // Fetch camera details
        const cameraRes = await api.get(`/api/cameras/${id}`)
        setCamera(cameraRes.data)
        setEditData(cameraRes.data)

        // Fetch recordings for this camera
        try {
          const recordingsRes = await api.get(`/api/recordings/camera/${id}?limit=10`)
          setRecordings(recordingsRes.data.recordings || [])
        } catch (err) {
          console.log('No recordings found')
        }

        // Fetch analytics/events for this camera
        try {
          const analyticsRes = await api.get(`/api/analytics/camera/${id}?limit=10`)
          setAnalytics(analyticsRes.data.events || [])
        } catch (err) {
          console.log('No analytics found')
        }

        setLoading(false)
      } catch (err) {
        setError(`Failed to load camera details: ${err.response?.data?.error || err.message}`)
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  // Start live stream
  const handleStartStream = async () => {
    try {
      setStreamLoading(true)
      setError('')

      // Call Flask streaming service to start RTSP to HLS conversion
      const response = await api.post(`http://localhost:5001/stream/${id}/start`, {
        rtsp_url: camera.rtspUrl || camera.streamUrl
      })

      if (response.data.success) {
        // Set the HLS stream URL
        const hlsUrl = `http://localhost:5001/stream/${id}/hls/playlist.m3u8`
        setStreamUrl(hlsUrl)
        setStreamActive(true)

        // Update Phase 3 status
        setPhase3Status((prev) => ({
          ...prev,
          rtspToHls: true,
          liveStream: true,
          recordingFromStream: true
        }))
      }

      setStreamLoading(false)
    } catch (err) {
      setError(`Failed to start stream: ${err.message}`)
      setStreamLoading(false)
    }
  }

  // Stop live stream
  const handleStopStream = async () => {
    try {
      setStreamLoading(true)
      setError('')

      const response = await api.post(`http://localhost:5001/stream/${id}/stop`)

      if (response.data.success) {
        setStreamActive(false)
        setStreamUrl('')
      }

      setStreamLoading(false)
    } catch (err) {
      setError(`Failed to stop stream: ${err.message}`)
      setStreamLoading(false)
    }
  }

  // Update camera
  const handleUpdateCamera = async () => {
    try {
      setLoading(true)
      await api.put(`/api/cameras/${id}`, editData)
      setCamera(editData)
      setEditDialogOpen(false)
      setError('')
    } catch (err) {
      setError(`Failed to update camera: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete camera
  const handleDeleteCamera = async () => {
    if (window.confirm('Are you sure you want to delete this camera?')) {
      try {
        await api.delete(`/api/cameras/${id}`)
        navigate('/cameras')
      } catch (err) {
        setError(`Failed to delete camera: ${err.message}`)
      }
    }
  }

  // Update camera status
  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.patch(`/api/cameras/${id}/status`, { status: newStatus })
      setCamera((prev) => ({ ...prev, status: newStatus }))
    } catch (err) {
      setError(`Failed to update status: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (!camera) {
    return (
      <Container>
        <Alert severity="error">Camera not found</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/cameras')}>
            Back
          </Button>
          <Typography variant="h4">{camera.name}</Typography>
          <Chip
            label={camera.status || 'offline'}
            color={camera.status === 'online' ? 'success' : 'default'}
            size="small"
          />
        </Box>
        {user?.role === 'admin' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
              variant="outlined"
            >
              Edit
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              onClick={handleDeleteCamera}
              variant="outlined"
              color="error"
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Video Player Section - Phase 3 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Live Stream (Phase 3)</Typography>
          <Chip
            icon={<StreamIcon />}
            label={streamActive ? 'Streaming' : 'Offline'}
            color={streamActive ? 'success' : 'default'}
          />
        </Box>

        {streamActive ? (
          <>
            <VideoPlayer
              cameraId={id}
              rtspUrl={camera.rtspUrl || camera.streamUrl}
              streamUrl={streamUrl}
            />
            <Button
              fullWidth
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleStopStream}
              disabled={streamLoading}
              sx={{ mt: 2 }}
            >
              Stop Stream
            </Button>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              Click the button below to start a live stream
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<PlayIcon />}
              onClick={handleStartStream}
              disabled={streamLoading || !camera.rtspUrl}
            >
              {streamLoading ? 'Starting...' : 'Start Live Stream'}
            </Button>
            {!camera.rtspUrl && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This camera doesn't have an RTSP URL configured. Contact admin to add it.
              </Alert>
            )}
          </Box>
        )}

        {/* Phase 3 Feature Status */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#fff', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Phase 3: Video Streaming Features
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Chip
              label="RTSP to HLS"
              color={phase3Status.rtspToHls ? 'success' : 'default'}
              size="small"
            />
            <Chip
              label="Live Stream"
              color={phase3Status.liveStream ? 'success' : 'default'}
              size="small"
            />
            <Chip
              label="Video Player"
              color={phase3Status.videoPlayer ? 'success' : 'default'}
              size="small"
            />
            <Chip
              label="Quality Adaptation"
              color={phase3Status.qualityAdaptation ? 'success' : 'default'}
              size="small"
            />
            <Chip
              label="Recording from Stream"
              color={phase3Status.recordingFromStream ? 'success' : 'default'}
              size="small"
            />
          </Stack>
        </Box>
      </Paper>

      {/* Camera Information */}
      <Grid container spacing={3}>
        {/* Camera Details */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Camera Information
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Camera ID</TableCell>
                  <TableCell>{camera._id || id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                  <TableCell>{camera.location || 'Not specified'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell>{camera.cameraType || 'IP Camera'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Stream URL</TableCell>
                  <TableCell sx={{ wordBreak: 'break-word' }}>
                    {camera.streamUrl || 'Not configured'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>RTSP URL</TableCell>
                  <TableCell sx={{ wordBreak: 'break-word' }}>
                    {camera.rtspUrl || 'Not configured'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell>
                    <Chip
                      label={camera.status || 'offline'}
                      color={camera.status === 'online' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Camera Stats */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Statistics
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Recordings</TableCell>
                  <TableCell>{recordings.length}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Events Detected</TableCell>
                  <TableCell>{analytics.length}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell>
                    {camera.createdAt ? new Date(camera.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Last Updated</TableCell>
                  <TableCell>
                    {camera.updatedAt ? new Date(camera.updatedAt).toLocaleString() : 'N/A'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Recordings */}
      {recordings.length > 0 && (
        <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Recordings
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>File Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Start Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>End Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recordings.map((rec) => (
                  <TableRow key={rec._id}>
                    <TableCell>{rec.fileName}</TableCell>
                    <TableCell>{rec.duration ? `${Math.round(rec.duration)}s` : 'N/A'}</TableCell>
                    <TableCell>
                      {rec.startTime ? new Date(rec.startTime).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {rec.endTime ? new Date(rec.endTime).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rec.status || 'completed'}
                        color={rec.status === 'completed' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Events/Analytics */}
      {analytics.length > 0 && (
        <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Events
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Event Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Confidence</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>{event.eventType}</TableCell>
                    <TableCell>
                      {event.confidence
                        ? `${Math.round(event.confidence * 100)}%`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>{event.details || 'No details'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Edit Camera Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Camera</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Camera Name"
              fullWidth
              value={editData.name || ''}
              onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="Location"
              fullWidth
              value={editData.location || ''}
              onChange={(e) => setEditData((prev) => ({ ...prev, location: e.target.value }))}
            />
            <TextField
              label="Stream URL"
              fullWidth
              value={editData.streamUrl || ''}
              onChange={(e) => setEditData((prev) => ({ ...prev, streamUrl: e.target.value }))}
              helperText="HTTP/RTMP URL for streaming"
            />
            <TextField
              label="RTSP URL (for Phase 3)"
              fullWidth
              value={editData.rtspUrl || ''}
              onChange={(e) => setEditData((prev) => ({ ...prev, rtspUrl: e.target.value }))}
              helperText="RTSP URL for HLS conversion"
            />
            <TextField
              label="Camera Type"
              fullWidth
              value={editData.cameraType || ''}
              onChange={(e) => setEditData((prev) => ({ ...prev, cameraType: e.target.value }))}
              placeholder="e.g., IP Camera, Hikvision, Dahua"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateCamera} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default CameraDetail
