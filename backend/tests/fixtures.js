/**
 * Test Fixtures and Mock Data
 * 
 * Provides reusable test data across all test suites
 */

export const fixtures = {
  // User fixtures
  users: {
    admin: {
      name: 'Admin Test User',
      email: 'admin@test.com',
      password: 'Admin@1234',
      role: 'admin'
    },
    operator: {
      name: 'Operator Test User',
      email: 'operator@test.com',
      password: 'Operator@1234',
      role: 'operator'
    },
    viewer: {
      name: 'Viewer Test User',
      email: 'viewer@test.com',
      password: 'Viewer@1234',
      role: 'viewer'
    },
    invalidEmail: {
      name: 'Invalid Email',
      email: 'not-an-email',
      password: 'Password@1234',
      role: 'viewer'
    },
    weakPassword: {
      name: 'Weak Password',
      email: 'weak@test.com',
      password: '123',
      role: 'viewer'
    },
    duplicateEmail: (baseEmail = 'duplicate@test.com') => ({
      name: 'Duplicate User',
      email: baseEmail,
      password: 'Password@1234',
      role: 'viewer'
    })
  },

  // Camera fixtures
  cameras: {
    entranceCamera: {
      name: 'Entrance Camera',
      location: 'Main Entrance',
      description: 'Front entrance surveillance',
      streamUrl: 'http://192.168.1.100:8080/stream',
      rtspUrl: 'rtsp://192.168.1.100:554/stream',
      cameraType: 'ip',
      frameRate: 30,
      resolution: { width: 1920, height: 1080 }
    },
    hallwayCamera: {
      name: 'Hallway Camera',
      location: 'Second Floor Hallway',
      description: 'Hallway surveillance',
      streamUrl: 'http://192.168.1.101:8080/stream',
      rtspUrl: 'rtsp://192.168.1.101:554/stream',
      cameraType: 'ip',
      frameRate: 24,
      resolution: { width: 1280, height: 720 }
    },
    parkingCamera: {
      name: 'Parking Lot Camera',
      location: 'Parking Lot',
      description: 'Parking area surveillance',
      streamUrl: 'http://192.168.1.102:8080/stream',
      cameraType: 'ip',
      frameRate: 30
    },
    rooftopCamera: {
      name: 'Rooftop Camera',
      location: 'Building Rooftop',
      streamUrl: 'http://192.168.1.103:8080/stream',
      cameraType: 'ptz'
    },
    usbCamera: {
      name: 'USB Camera',
      location: 'Reception Area',
      streamUrl: 'http://192.168.1.104:8080/stream',
      cameraType: 'usb'
    },
    invalidCamera: {
      name: 'Invalid Camera',
      // Missing required fields
      cameraType: 'ip'
    },
    longNameCamera: {
      name: 'A'.repeat(200) + ' Camera',
      location: 'Location',
      streamUrl: 'http://test.local/stream'
    }
  },

  // Recording fixtures
  recordings: {
    standardRecording: {
      fileName: 'recording_2024_01_15_120000.mp4',
      filePath: '/recordings/2024/01/15/recording_2024_01_15_120000.mp4',
      duration: 3600,
      fileSize: 1073741824, // 1GB
      startTime: new Date('2024-01-15T12:00:00Z'),
      endTime: new Date('2024-01-15T13:00:00Z'),
      recordingType: 'scheduled'
    },
    eventTriggeredRecording: {
      fileName: 'event_recording_2024_01_15_150000.mp4',
      filePath: '/recordings/events/event_recording_2024_01_15_150000.mp4',
      duration: 900,
      fileSize: 268435456, // 256MB
      startTime: new Date('2024-01-15T15:00:00Z'),
      endTime: new Date('2024-01-15T15:15:00Z'),
      recordingType: 'event-triggered'
    },
    manualRecording: {
      fileName: 'manual_recording_2024_01_15_160000.mp4',
      filePath: '/recordings/manual/manual_recording_2024_01_15_160000.mp4',
      duration: 1800,
      fileSize: 536870912, // 512MB
      startTime: new Date('2024-01-15T16:00:00Z'),
      endTime: new Date('2024-01-15T16:30:00Z'),
      recordingType: 'manual'
    },
    archivedRecording: {
      fileName: 'archive_recording_2024_01_10_100000.mp4',
      filePath: '/recordings/archive/archive_recording_2024_01_10_100000.mp4',
      duration: 3600,
      fileSize: 1073741824,
      startTime: new Date('2024-01-10T10:00:00Z'),
      endTime: new Date('2024-01-10T11:00:00Z'),
      recordingType: 'scheduled',
      isArchived: true
    },
    invalidRecording: {
      fileName: 'invalid_recording.mp4',
      // Missing required fields
      duration: 3600
    }
  },

  // Request payload fixtures
  requests: {
    validCameraCreate: {
      name: 'Test Camera',
      location: 'Test Location',
      streamUrl: 'http://192.168.1.100:8080/stream',
      cameraType: 'ip'
    },
    validCameraUpdate: {
      name: 'Updated Camera Name',
      description: 'Updated description',
      frameRate: 60
    },
    validRecordingCreate: (cameraId) => ({
      camera: cameraId,
      fileName: 'test_recording.mp4',
      filePath: '/recordings/test_recording.mp4',
      duration: 3600,
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date()
    }),
    validStatusUpdate: {
      status: 'online'
    }
  },

  // Security test fixtures
  security: {
    xssPayloads: [
      '<img src=x onerror=alert("XSS")>',
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '<body onload=alert("XSS")>'
    ],
    sqlInjectionPayloads: [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' OR 1=1 --",
      "admin' --",
      "' UNION SELECT * FROM users --"
    ],
    noSqlInjectionPayloads: [
      { $ne: null },
      { $gt: '' },
      { $where: '1==1' },
      { $regex: '.*' }
    ],
    directoryTraversalPayloads: [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32',
      '/etc/passwd',
      'C:\\windows\\system32\\config\\sam'
    ],
    longStrings: {
      veryLong: 'a'.repeat(100000),
      moderateLong: 'a'.repeat(10000)
    },
    nullBytes: '\x00',
    prototypePollution: {
      '__proto__': { isAdmin: true },
      'constructor': { prototype: { isAdmin: true } }
    }
  },

  // Response fixtures
  responses: {
    successResponse: (data) => ({
      success: true,
      message: 'Operation successful',
      ...data
    }),
    errorResponse: (message, statusCode = 400) => ({
      success: false,
      error: {
        message,
        statusCode
      }
    }),
    paginatedResponse: (data, total, limit, skip) => ({
      success: true,
      data,
      pagination: {
        total,
        limit,
        skip,
        pages: Math.ceil(total / limit)
      }
    })
  },

  // Token fixtures
  tokens: {
    validPayload: {
      userId: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'admin'
    },
    expiredPayload: {
      userId: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000) - 7200,
      exp: Math.floor(Date.now() / 1000) - 3600
    }
  },

  // Timestamp fixtures
  timestamps: {
    now: new Date(),
    oneHourAgo: new Date(Date.now() - 3600000),
    oneDayAgo: new Date(Date.now() - 86400000),
    oneWeekAgo: new Date(Date.now() - 604800000),
    oneMonthAgo: new Date(Date.now() - 2592000000)
  },

  // Pagination fixtures
  pagination: {
    smallPage: { limit: 10, skip: 0 },
    mediumPage: { limit: 50, skip: 0 },
    largePage: { limit: 100, skip: 0 },
    secondPage: { limit: 50, skip: 50 },
    lastPage: { limit: 50, skip: 1000 }
  },

  // Search and filter fixtures
  filters: {
    cameraStatusOnline: { status: 'online' },
    cameraStatusOffline: { status: 'offline' },
    cameraLocationEntrance: { location: 'Entrance' },
    recordingTypeScheduled: { recordingType: 'scheduled' },
    recordingTypeEvent: { recordingType: 'event-triggered' },
    dateRangeToday: {
      startDate: new Date(new Date().toDateString()),
      endDate: new Date(new Date().toDateString() + ' 23:59:59')
    }
  },

  // Error fixtures
  errors: {
    notFound: {
      status: 404,
      message: 'Resource not found'
    },
    unauthorized: {
      status: 401,
      message: 'Unauthorized access'
    },
    forbidden: {
      status: 403,
      message: 'Forbidden access'
    },
    badRequest: {
      status: 400,
      message: 'Bad request'
    },
    internalServer: {
      status: 500,
      message: 'Internal server error'
    },
    conflict: {
      status: 409,
      message: 'Resource conflict'
    }
  },

  // Database fixtures
  database: {
    validObjectId: '507f1f77bcf86cd799439011',
    invalidObjectId: 'invalid-id-123',
    nullId: null,
    undefinedId: undefined
  }
};

/**
 * Utility function to generate mock data with timestamps
 */
export const generateMockData = {
  recording: (overrides = {}) => ({
    ...fixtures.recordings.standardRecording,
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    ...overrides
  }),

  camera: (overrides = {}) => ({
    ...fixtures.cameras.entranceCamera,
    ...overrides
  }),

  user: (role = 'viewer', overrides = {}) => ({
    ...fixtures.users[role],
    email: `${role}-${Date.now()}@test.com`,
    ...overrides
  }),

  recordingBatch: (count, cameraId, overrides = {}) => {
    const recordings = [];
    for (let i = 0; i < count; i++) {
      recordings.push({
        ...fixtures.recordings.standardRecording,
        camera: cameraId,
        fileName: `recording_${Date.now()}_${i}.mp4`,
        filePath: `/recordings/recording_${Date.now()}_${i}.mp4`,
        startTime: new Date(Date.now() - (count - i) * 3600000),
        endTime: new Date(Date.now() - (count - i - 1) * 3600000),
        ...overrides
      });
    }
    return recordings;
  },

  cameraBatch: (count, owner, overrides = {}) => {
    const cameras = [];
    for (let i = 0; i < count; i++) {
      cameras.push({
        ...fixtures.cameras.entranceCamera,
        name: `Camera ${i}`,
        location: `Location ${i}`,
        streamUrl: `http://192.168.1.${100 + i}:8080/stream`,
        owner,
        ...overrides
      });
    }
    return cameras;
  }
};

/**
 * Assertion helpers for common test scenarios
 */
export const assertions = {
  isValidId: (id) => /^[0-9a-fA-F]{24}$/.test(id),
  
  isValidJWT: (token) => {
    const parts = token.split('.');
    return parts.length === 3;
  },

  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidResponse: (response) => {
    return response && typeof response === 'object' && 'success' in response;
  },

  isValidPaginatedResponse: (response) => {
    return response && 
           response.success === true && 
           Array.isArray(response.data || response.recordings || response.cameras) &&
           response.pagination &&
           'total' in response.pagination &&
           'limit' in response.pagination &&
           'skip' in response.pagination;
  }
};

export default fixtures;
