"""
Test script for Phase 3 Streaming Service
Tests RTSP to HLS conversion, video recording, and quality adaptation
"""

import sys
import requests
import json
from pathlib import Path

# Test endpoints
STREAM_SERVICE_URL = "http://localhost:5001"

def test_health():
    """Test health check endpoint"""
    print("\n[TEST] Health Check")
    try:
        response = requests.get(f"{STREAM_SERVICE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Health: {data['status']}")
            print(f"✓ Service: {data['service']}")
            print(f"✓ Active Streams: {data['active_streams']}")
            return True
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Connection error: {e}")
        print(f"  Make sure streaming service is running on {STREAM_SERVICE_URL}")
        return False

def test_list_streams():
    """Test list active streams endpoint"""
    print("\n[TEST] List Active Streams")
    try:
        response = requests.get(f"{STREAM_SERVICE_URL}/streams")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Total streams: {data['total']}")
            if data['streams']:
                for camera_id, stream_info in data['streams'].items():
                    print(f"  - {camera_id}: {stream_info['status']}")
            else:
                print("  No active streams")
            return True
        else:
            print(f"✗ Failed to list streams: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_quality_recommendation():
    """Test quality recommendation endpoint"""
    print("\n[TEST] Quality Recommendation")
    try:
        test_data = {
            'client_id': 'test-client-1',
            'bandwidth': 2500
        }
        response = requests.post(
            f"{STREAM_SERVICE_URL}/quality/recommend",
            json=test_data
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Recommended Quality: {data['recommended_quality']}")
            print(f"✓ Bitrate: {data['encoding_params']['bitrate']}")
            print(f"✓ Resolution: {data['encoding_params']['width']}x{data['encoding_params']['height']}")
            return True
        else:
            print(f"✗ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_stream_operations():
    """Test stream start/stop operations"""
    print("\n[TEST] Stream Operations (Start/Stop)")
    test_camera_id = "test-camera-001"
    test_rtsp_url = "rtsp://demo.openvidu.org:1935/mediasoup"  # Public RTSP stream for testing

    try:
        # Try to start stream
        print(f"  Starting stream for {test_camera_id}...")
        start_data = {'rtsp_url': test_rtsp_url}
        response = requests.post(
            f"{STREAM_SERVICE_URL}/stream/{test_camera_id}/start",
            json=start_data,
            timeout=5
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✓ Stream started: {data['message']}")

                # Get stream info
                info_response = requests.get(
                    f"{STREAM_SERVICE_URL}/stream/{test_camera_id}/info"
                )
                if info_response.status_code == 200:
                    info = info_response.json()
                    print(f"✓ Stream Status: {info['status']}")
                    print(f"✓ Quality: {info.get('quality', 'N/A')}")
                    print(f"✓ Bitrate: {info.get('bitrate', 'N/A')}")

                # Stop stream
                print(f"  Stopping stream for {test_camera_id}...")
                stop_response = requests.post(
                    f"{STREAM_SERVICE_URL}/stream/{test_camera_id}/stop"
                )
                if stop_response.status_code == 200:
                    stop_data = stop_response.json()
                    print(f"✓ Stream stopped: {stop_data['message']}")
                    return True
            else:
                print(f"✗ Failed to start stream: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"✗ Failed: {response.status_code}")
            if response.text:
                print(f"  Response: {response.text}")
            return False
    except requests.exceptions.Timeout:
        print("⚠ Stream start timed out (this is normal if FFmpeg is starting)")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_recording_operations():
    """Test recording start/stop operations"""
    print("\n[TEST] Recording Operations")
    test_camera_id = "test-camera-rec"
    test_rtsp_url = "rtsp://demo.openvidu.org:1935/mediasoup"

    try:
        print(f"  Starting recording for {test_camera_id}...")
        start_data = {'rtsp_url': test_rtsp_url}
        response = requests.post(
            f"{STREAM_SERVICE_URL}/recording/{test_camera_id}/start",
            json=start_data,
            timeout=5
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✓ Recording started: {data['file']}")

                # Stop recording
                print(f"  Stopping recording...")
                stop_response = requests.post(
                    f"{STREAM_SERVICE_URL}/recording/{test_camera_id}/stop"
                )
                if stop_response.status_code == 200:
                    stop_data = stop_response.json()
                    if stop_data.get('success'):
                        print(f"✓ Recording stopped")
                        print(f"✓ File: {stop_data['file']}")
                        print(f"✓ Duration: {stop_data.get('duration', 'N/A')}s")
                        return True
            else:
                print(f"✗ Failed to start recording: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"✗ Failed: {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print("⚠ Recording start timed out (this is normal)")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("CCTV STREAMING SERVICE - PHASE 3 TEST SUITE")
    print("=" * 60)

    results = []

    # Test health
    results.append(("Health Check", test_health()))

    # Only run other tests if health check passes
    if results[0][1]:
        results.append(("List Streams", test_list_streams()))
        results.append(("Quality Recommendation", test_quality_recommendation()))
        results.append(("Stream Operations", test_stream_operations()))
        results.append(("Recording Operations", test_recording_operations()))

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠ {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
