import React, { useEffect, useRef, useState } from 'react'
import {
  Box, Paper, Button, CircularProgress, Alert, Slider, Typography,
  Stack, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
  FitnessCenter as QualityIcon,
  Videocam as RecordIcon,
  StopCircle as StopRecordIcon
} from '@mui/icons-material'
import axios from 'axios'

const VideoPlayer = ({ cameraId, rtspUrl, streamUrl }) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quality, setQuality] = useState('720p')
  const [isRecording, setIsRecording] = useState(false)
  const [bandwidth, setBandwidth] = useState(2500)
  const [showSettings, setShowSettings] = useState(false)
  const [stats, setStats] = useState({
    frameRate: 0,
    bitrate: 0,
    resolution: '720p'
  })

  const QUALITY_OPTIONS = [
    { label: '1080p', value: '1080p' },
    { label: '720p', value: '720p' },
    { label: '480p', value: '480p' },
    { label: '360p', value: '360p' },
    { label: '240p', value: '240p' }
  ]

  // Initialize video player with HLS
  useEffect(() => {
    if (streamUrl && videoRef.current) {
      initializePlayer()
    }
  }, [streamUrl, cameraId])

  const initializePlayer = async () => {
    try {
      setLoading(true)
      setError('')

      // Ensure HLS is available globally
      if (!window.Hls) {
        setError('HLS.js library not loaded')
        setLoading(false)
        return
      }

      // Check if browser supports HLS playback
      if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari, iOS)
        videoRef.current.src = streamUrl
        setIsPlaying(true)
      } else if (window.Hls.isSupported()) {
        // Use HLS.js library for other browsers
        const hls = new window.Hls({
          debug: false,
          autoStartLoad: true,
          startLevel: -1 // Auto quality
        })

        hls.loadSource(streamUrl)
        hls.attachMedia(videoRef.current)

        // Listen for quality levels
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          const qualityLevels = hls.levels.map((l) => ({
            label: `${l.height}p`,
            value: l.height
          }))
          console.log('Available qualities:', qualityLevels)
        })

        hls.on(window.Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data)
          if (data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setError('Network error during streaming')
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setError('Media error during playback')
            } else {
              setError(`HLS Error: ${data.type}`)
            }
          }
        })

        // Store reference for quality changes
        window.HLSInstance = hls

        // Autoplay
        videoRef.current.play().catch(() => {
          console.log('Autoplay prevented')
        })
        setIsPlaying(true)
      } else {
        setError('HLS player not supported in this browser')
      }

      setLoading(false)
    } catch (err) {
      setError(`Failed to initialize player: ${err.message}`)
      setLoading(false)
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e, newValue) => {
    setVolume(newValue)
    if (videoRef.current) {
      videoRef.current.volume = newValue / 100
    }
  }

  const handleQualityChange = async (newQuality) => {
    try {
      // Request quality recommendation from server
      const response = await axios.post('http://localhost:5001/quality/recommend', {
        client_id: cameraId,
        bandwidth: bandwidth
      })

      setQuality(newQuality)

      // Update video quality if HLS.js is available
      if (window.HLSInstance) {
        const hls = window.HLSInstance
        const levelIndex = hls.levels.findIndex((l) => l.height === parseInt(newQuality))
        if (levelIndex !== -1) {
          hls.currentLevel = levelIndex
        }
      }
    } catch (err) {
      setError(`Failed to change quality: ${err.message}`)
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen()
      } else if (videoRef.current.mozRequestFullScreen) {
        videoRef.current.mozRequestFullScreen()
      }
    }
  }

  const handleStartRecording = async () => {
    try {
      setLoading(true)
      await axios.post(`http://localhost:5001/recording/${cameraId}/start`, {
        rtsp_url: rtspUrl
      })
      setIsRecording(true)
      setError('')
    } catch (err) {
      setError(`Failed to start recording: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStopRecording = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`http://localhost:5001/recording/${cameraId}/stop`)
      setIsRecording(false)
      setError('')
      alert(`Recording saved: ${response.data.file}`)
    } catch (err) {
      setError(`Failed to stop recording: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAdaptiveQuality = async () => {
    try {
      // Simulate bandwidth measurement
      const newBandwidth = Math.random() * 5000 + 500
      setBandwidth(newBandwidth)

      const response = await axios.post('http://localhost:5001/quality/recommend', {
        client_id: cameraId,
        bandwidth: newBandwidth
      })

      setQuality(response.data.recommended_quality)
      setStats((prev) => ({
        ...prev,
        resolution: response.data.recommended_quality
      }))
    } catch (err) {
      setError(`Failed to adapt quality: ${err.message}`)
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ position: 'relative', backgroundColor: '#000' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Video Element */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            paddingBottom: '56.25%',
            backgroundColor: '#000',
            borderRadius: 1,
            overflow: 'hidden',
            '& video': {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }
          }}
        >
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <video
            ref={videoRef}
            controls={false}
            playsInline
            crossOrigin="anonymous"
          />
        </Box>

        {/* Controls */}
        <Box sx={{ mt: 2 }}>
          {/* Top Control Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {cameraId} - {quality}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={`${Math.round(bandwidth)} Mbps`}
                size="small"
                icon={<QualityIcon />}
              />
              {isRecording && (
                <Chip
                  label="Recording"
                  size="small"
                  color="error"
                  icon={<RecordIcon />}
                />
              )}
            </Box>
          </Box>

          {/* Playback Controls */}
          <Stack spacing={1}>
            {/* Play/Pause & Volume */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton
                color="primary"
                onClick={handlePlayPause}
                disabled={loading}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>

              <IconButton color="primary" onClick={handleMute} disabled={loading}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>

              <Slider
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={100}
                sx={{ width: 100 }}
                disabled={loading}
              />

              <IconButton
                color="primary"
                onClick={handleFullscreen}
                disabled={loading}
              >
                <FullscreenIcon />
              </IconButton>

              <IconButton
                color="primary"
                onClick={() => setShowSettings(!showSettings)}
              >
                <SettingsIcon />
              </IconButton>
            </Box>

            {/* Recording Controls */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isRecording ? (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<RecordIcon />}
                  onClick={handleStartRecording}
                  disabled={loading}
                  size="small"
                >
                  Start Recording
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<StopRecordIcon />}
                  onClick={handleStopRecording}
                  disabled={loading}
                  size="small"
                >
                  Stop Recording
                </Button>
              )}

              <Button
                variant="outlined"
                onClick={handleAdaptiveQuality}
                disabled={loading}
                size="small"
              >
                Auto Quality
              </Button>
            </Box>

            {/* Quality Selection */}
            {showSettings && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {QUALITY_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    onClick={() => handleQualityChange(opt.value)}
                    color={quality === opt.value ? 'primary' : 'default'}
                    variant={quality === opt.value ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            )}
          </Stack>

          {/* Stream Stats */}
          <Box sx={{ mt: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" display="block">
              Status: {isPlaying ? 'Playing' : 'Paused'}
            </Typography>
            <Typography variant="caption" display="block">
              Quality: {stats.resolution}
            </Typography>
            <Typography variant="caption" display="block">
              Bitrate: {stats.bitrate}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)}>
        <DialogTitle>Streaming Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Quality</Typography>
            {QUALITY_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                onClick={() => {
                  handleQualityChange(opt.value)
                  setShowSettings(false)
                }}
                variant="outlined"
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default VideoPlayer
