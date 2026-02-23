#  Quick File Share

A web-based file sharing application that allows users to share files instantly using unique codes without requiring any login or signup.

![React](https://img.shields.io/badge/React-18.2.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![Status](https://img.shields.io/badge/Status-Active-success)

##  Overview

A full-stack web application for secure, temporary file sharing. Users can upload files and receive a unique 6-character code to share, which others can use to download the file within 24 hours.

##  Features

- **No Authentication Required** - Instant file sharing without signup/login
- **Unique Code Generation** - Cryptographically secure 6-character codes
- **Automatic Expiry** - Files automatically delete after 24 hours
- **File Size Validation** - Support for files up to 100MB
- **Responsive Design** - Works seamlessly on mobile and desktop
- **Real-time File Information** - View file details before downloading
- **Error Handling** - Comprehensive validation and user feedback

##  Tech Stack

### Frontend
- **React.js** - UI framework
- **CSS3** - Modern styling with gradients and animations
- **Fetch API** - HTTP requests

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload middleware
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure
```
file-sharing-app/
├── backend/
│   ├── server.js          # Express server & API endpoints
│   ├── package.json       # Backend dependencies
│   └── uploads/           # Temporary file storage
│
├── frontend/
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Upload.js      # Upload component
│   │   │   ├── Upload.css
│   │   │   ├── Download.js    # Download component
│   │   │   └── Download.css
│   │   ├── App.js         # Main app component
│   │   ├── App.css
│   │   ├── index.js       # React entry point
│   │   └── index.css
│   └── package.json       # Frontend dependencies
│
├── .gitignore
└── README.md
```

##  Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/CoderParva/file-sharing-app.git
cd file-sharing-app
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
npm start
```
Server will run on `http://localhost:5000`

2. **Start the Frontend (in a new terminal)**
```bash
cd frontend
npm start
```
Frontend will open automatically at `http://localhost:3000`

##  How to Use

### Upload a File
1. Go to http://localhost:3000
2. Click on **"Upload File"** tab
3. Select a file (max 100MB)
4. Click **"Upload File"** button
5. Copy the generated 6-character code
6. Share the code with anyone

### Download a File
1. Click on **"Download File"** tab
2. Enter the 6-character code
3. Click **"Check"** to view file information
4. Click **"Download File"** to download

## API Endpoints

### POST `/api/upload`
Upload a file and get a unique code
- **Body**: multipart/form-data with 'file' field
- **Response**: `{ success, code, filename, size, expiryTime }`

### GET `/api/fileinfo/:code`
Get information about a file
- **Response**: `{ filename, size, uploadTime, expiryTime }`

### GET `/api/download/:code`
Download a file using its code
- **Response**: File download stream

### GET `/api/health`
Check server status
- **Response**: `{ status, activeFiles, timestamp }`

##  Key Features

### Secure Code Generation
- Uses Node.js `crypto.randomBytes()` for cryptographic security
- 6-character hexadecimal codes (16^6 = 16.7M possible combinations)

### Auto-Deletion Mechanism
- Implemented using JavaScript `setTimeout()`
- Files automatically deleted after 24 hours
- Both file and metadata are removed

### Multi-Layer Validation
- Client-side: Checks file size before upload
- Server-side: Multer middleware validates files
- Maximum file size: 100MB

##  Security Features

- CORS Protection for secure cross-origin requests
- File size limits to prevent server overload
- Temporary storage with automatic cleanup
- Cryptographically secure random code generation
- Input validation at multiple layers

##  Roadmap

- [ ] MongoDB integration for persistent metadata
- [ ] AWS S3 for cloud file storage
- [ ] File encryption
- [ ] Progress bars for upload/download
- [ ] Multiple file upload support
- [ ] QR code generation for sharing

##  License

This project is open source and available under the [MIT License](LICENSE).

##  Contact

**GitHub**: [@CoderParva](https://github.com/CoderParva)

---

**⭐ Star this repo if you find it useful!**