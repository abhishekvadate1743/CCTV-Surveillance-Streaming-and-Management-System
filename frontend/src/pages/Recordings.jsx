import { useEffect, useState } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, CircularProgress, Alert, Button, Chip
} from '@mui/material'
import { Delete as DeleteIcon, Archive as ArchiveIcon } from '@mui/icons-material'
import { recordingAPI } from '../services/api'
import { formatDistanceToNow } from 'date-fns'

const Recordings = () => {
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRecordings()
  }, [])

  const fetchRecordings = async () => {
    try {
      const res = await recordingAPI.getAll(100, 0)
      setRecordings(res.data.recordings)
    } catch (err) {
      setError('Failed to fetch recordings')
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async (id) => {
    try {
      await recordingAPI.archive(id)
      fetchRecordings()
    } catch (err) {
      setError('Failed to archive recording')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      try {
        await recordingAPI.delete(id)
        fetchRecordings()
      } catch (err) {
        setError('Failed to delete recording')
      }
    }
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Recordings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>File Name</strong></TableCell>
              <TableCell><strong>Camera</strong></TableCell>
              <TableCell><strong>Start Time</strong></TableCell>
              <TableCell><strong>Duration (s)</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recordings.map((rec) => (
              <TableRow key={rec._id} hover>
                <TableCell>{rec.fileName}</TableCell>
                <TableCell>{rec.camera?.name || 'N/A'}</TableCell>
                <TableCell>{new Date(rec.startTime).toLocaleString()}</TableCell>
                <TableCell>{rec.duration || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={rec.isArchived ? 'Archived' : 'Active'}
                    color={rec.isArchived ? 'default' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {!rec.isArchived && (
                    <Button size="small" startIcon={<ArchiveIcon />} onClick={() => handleArchive(rec._id)}>
                      Archive
                    </Button>
                  )}
                  <Button size="small" startIcon={<DeleteIcon />} color="error" onClick={() => handleDelete(rec._id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {recordings.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="textSecondary">No recordings found</Typography>
        </Box>
      )}
    </Box>
  )
}

export default Recordings
