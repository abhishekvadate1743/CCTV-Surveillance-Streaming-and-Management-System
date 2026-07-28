import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Grid, Card, CardContent, CardActions, Button, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
  Alert, Chip
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material'
import { cameraAPI } from '../services/api'

const Cameras = () => {
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '', location: '', streamUrl: '', rtspUrl: '', cameraType: 'ip'
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchCameras()
  }, [])

  const fetchCameras = async () => {
    try {
      const res = await cameraAPI.getAll()
      setCameras(res.data.cameras)
    } catch (err) {
      setError('Failed to fetch cameras')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = () => setOpenDialog(true)
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setFormData({ name: '', location: '', streamUrl: '', rtspUrl: '', cameraType: 'ip' })
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.location || !formData.streamUrl) {
        setError('Please fill all required fields')
        return
      }
      await cameraAPI.create(formData)
      fetchCameras()
      handleCloseDialog()
    } catch (err) {
      setError('Failed to create camera')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this camera?')) {
      try {
        await cameraAPI.delete(id)
        fetchCameras()
      } catch (err) {
        setError('Failed to delete camera')
      }
    }
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Cameras</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
          Add Camera
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={2}>
        {cameras.map((camera) => (
          <Grid item xs={12} sm={6} md={4} key={camera._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {camera.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {camera.location}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${camera.status.toUpperCase()}`}
                    color={camera.status === 'online' ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip label={camera.cameraType} size="small" variant="outlined" />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  <strong>Stream:</strong> {camera.streamUrl.substring(0, 30)}...
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<VisibilityIcon />} onClick={() => navigate(`/cameras/${camera._id}`)}>
                  View
                </Button>
                <Button size="small" startIcon={<DeleteIcon />} color="error" onClick={() => handleDelete(camera._id)}>
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {cameras.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="textSecondary">No cameras found. Add one to get started!</Typography>
        </Box>
      )}

      {/* Add Camera Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Camera</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Camera Name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleFormChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Stream URL (HTTP)"
            name="streamUrl"
            value={formData.streamUrl}
            onChange={handleFormChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="RTSP URL (Optional)"
            name="rtspUrl"
            value={formData.rtspUrl}
            onChange={handleFormChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Cameras
