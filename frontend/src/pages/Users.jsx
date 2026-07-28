import { useEffect, useState, useContext } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, CircularProgress, Alert, Button, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material'
import { userAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'

const Users = () => {
  const { user: currentUser } = useContext(AuthContext)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAll()
      setUsers(res.data.users)
    } catch (err) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenRoleDialog = (user) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedUser(null)
  }

  const handleChangeRole = async () => {
    try {
      await userAPI.changeRole(selectedUser._id, newRole)
      fetchUsers()
      handleCloseDialog()
    } catch (err) {
      setError('Failed to change role')
    }
  }

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await userAPI.deactivate(id)
        fetchUsers()
      } catch (err) {
        setError('Failed to deactivate user')
      }
    }
  }

  const handleActivate = async (id) => {
    try {
      await userAPI.activate(id)
      fetchUsers()
    } catch (err) {
      setError('Failed to activate user')
    }
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
  }

  const getRoleColor = (role) => {
    const colors = { 'admin': 'error', 'operator': 'warning', 'viewer': 'info' }
    return colors[role] || 'default'
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Users</Typography>
        <Typography variant="body2" color="textSecondary">
          Total: {users.length}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Last Login</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                </TableCell>
                <TableCell>{user.department || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Inactive'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </TableCell>
                <TableCell align="right">
                  {currentUser._id !== user._id && (
                    <>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenRoleDialog(user)}
                      >
                        Role
                      </Button>
                      {user.isActive ? (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeactivate(user._id)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          onClick={() => handleActivate(user._id)}
                        >
                          Activate
                        </Button>
                      )}
                    </>
                  )}
                  {currentUser._id === user._id && (
                    <Chip label="Current User" size="small" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Change Role Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 300 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            User: {selectedUser?.name}
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="viewer">Viewer</MenuItem>
              <MenuItem value="operator">Operator</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleChangeRole} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Users
