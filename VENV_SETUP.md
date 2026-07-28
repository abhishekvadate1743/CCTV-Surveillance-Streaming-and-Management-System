# Python Virtual Environment Setup

## ✅ Status

Virtual environment has been created and all requirements installed successfully!

- **Location**: `./venv/`
- **Python Version**: 3.11.9
- **Total Packages**: 40+
- **Status**: ✓ Ready to use

## 🚀 Quick Start

### Windows - CMD
```bash
venv\Scripts\activate.bat
python -c "import flask; print('Flask is ready!')"
```

### Windows - PowerShell
```powershell
.\venv\Scripts\Activate.ps1
python -c "import flask; print('Flask is ready!')"
```

### Windows - Automated (PowerShell)
```powershell
.\activate-venv.ps1
```

### Linux/Mac
```bash
source venv/bin/activate
python -c "import flask; print('Flask is ready!')"
```

## 📦 Installed Packages

### Web Framework
- **Flask** 2.3.2 - Web framework
- **Flask-CORS** 4.0.0 - Cross-origin support
- **Werkzeug** 3.1.8 - WSGI utilities
- **Gunicorn** 21.2.0 - Production server

### Real-time Communication
- **python-socketio** 5.9.0 - WebSocket support
- **python-engineio** 4.13.3 - Engine.IO server

### Video & Image Processing
- **OpenCV** (opencv-python) 4.8.0.74 - Computer vision
- **Pillow** 10.0.0 - Image processing
- **NumPy** 1.24.3 - Numerical computing

### Machine Learning & Data Science
- **scikit-learn** 1.3.0 - Machine learning
- **SciPy** 1.11.1 - Scientific computing

### Database & Caching
- **PyMongo** 4.4.1 - MongoDB driver
- **Redis** 5.0.0 - In-memory store

### Task Queue
- **Celery** 5.3.1 - Distributed task queue
- **kombu** 5.6.2 - Celery messaging
- **billiard** 4.2.4 - Celery parallel
- **vine** 5.1.0 - Celery utilities

### Configuration & Validation
- **python-dotenv** 1.0.0 - .env file support
- **Pydantic** 2.0.2 - Data validation
- **Jinja2** 3.1.6 - Templating

### Utilities
- **Requests** 2.31.0 - HTTP library
- **Click** 8.4.2 - CLI framework
- **python-dateutil** 2.9.0 - Date utilities

## 🔧 Common Commands

### Activate Virtual Environment
```bash
# Windows CMD
venv\Scripts\activate.bat

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Linux/Mac
source venv/bin/activate
```

### Deactivate Virtual Environment
```bash
deactivate
```

### List Installed Packages
```bash
pip list
```

### Install Additional Package
```bash
pip install package-name
```

### Update requirements.txt
```bash
pip freeze > requirements.txt
```

### Run Python Services

#### Stream Service
```bash
# Make sure venv is activated
python services/stream_service.py
# Runs on http://localhost:5001
```

#### Analytics Service
```bash
# Make sure venv is activated
python services/analytics_service.py
```

#### Test Packages
```bash
# Verify all packages are installed correctly
python test-venv.py
```

## 📂 Files Created

- `venv/` - Virtual environment directory
- `requirements.txt` - Pinned package versions
- `setup-venv.bat` - Automated setup (Windows CMD)
- `setup-venv.ps1` - Automated setup (PowerShell)
- `activate-venv.bat` - Quick activation (Windows CMD)
- `activate-venv.ps1` - Quick activation (PowerShell)
- `test-venv.py` - Package verification script
- `VENV_SETUP.md` - This file

## ✅ Verification

Run this to verify everything works:

```bash
# Activate venv
.\venv\Scripts\Activate.ps1

# Test packages
python test-venv.py
```

Expected output:
```
✓ All packages loaded successfully!
✓ Virtual environment is properly configured!
```

## 🎯 Next Steps

1. **Activate venv** before running any Python scripts
2. **Use Flask services** in `services/` folder
3. **Monitor processes** with separate terminals per service

## ⚠️ Important Notes

1. **Always activate venv** before running Python code
2. **Don't commit venv/** folder (it's in .gitignore)
3. **Do commit requirements.txt** for reproducibility
4. **Different OS** might need different activation commands
5. **Update requirements.txt** if you install new packages

## 🆘 Troubleshooting

### "venv command not found"
```bash
python -m venv venv
```

### "Packages not found"
```bash
pip install -r requirements.txt
```

### "Script cannot be loaded"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Module not found"
Make sure venv is activated and package is installed:
```bash
.\venv\Scripts\Activate.ps1
pip list
```

## 📚 Resources

- [Python venv documentation](https://docs.python.org/3/library/venv.html)
- [Flask documentation](https://flask.palletsprojects.com/)
- [OpenCV documentation](https://docs.opencv.org/)
- [PyMongo documentation](https://pymongo.readthedocs.io/)

## ✨ Summary

Your Python virtual environment is now ready! 

- ✓ 40+ packages installed
- ✓ All dependencies resolved
- ✓ Ready for development
- ✓ Services ready to run

Happy coding! 🚀
