import { useState, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, AppBar, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Toolbar, Typography, IconButton, Menu, MenuItem, Badge
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Videocam as VideocamIcon,
  VideoLibrary as VideoLibraryIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { AuthContext } from '../context/AuthContext'

const DRAWER_WIDTH = 240

const Layout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useContext(AuthContext)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifications, setNotifications] = useState(0)

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
    handleMenuClose()
  }

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Cameras', path: '/cameras', icon: <VideocamIcon /> },
    { label: 'Recordings', path: '/recordings', icon: <VideoLibraryIcon /> },
    { label: 'Analytics', path: '/analytics', icon: <AnalyticsIcon /> },
    ...(user?.role === 'admin' ? [{ label: 'Users', path: '/users', icon: <PeopleIcon /> }] : [])
  ]

  const drawer = (
    <Box sx={{ width: DRAWER_WIDTH, bgcolor: '#1976d2', height: '100%', color: 'white' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          CCTV System
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => {
              navigate(item.path)
              setMobileOpen(false)
            }}
            selected={location.pathname === item.path}
            sx={{
              bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: 1201, boxShadow: 2 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            CCTV Surveillance System
          </Typography>
          
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={notifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={handleMenuOpen}>
            <AccountCircleIcon />
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>
              <Typography variant="body2">{user?.name}</Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="textSecondary">{user?.role}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              mt: 8
            }
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          overflow: 'auto',
          backgroundColor: '#f5f5f5'
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout
