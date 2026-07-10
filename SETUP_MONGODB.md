# MongoDB Setup Guide for WorkSchedule

## Option 1: Using Docker (Recommended - Easiest)

### Step 1: Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Start MongoDB Container
```bash
docker run -d \
  --name workschedule-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  mongo:latest
```

### Step 3: Verify MongoDB is Running
```bash
docker ps | grep workschedule-mongodb
```

### Step 4: Set Environment Variable
```bash
export MONGODB_URI=mongodb://admin:password123@localhost:27017/workschedule?authSource=admin
```

---

## Option 2: Using MongoDB Atlas (Cloud - Free Tier)

### Step 1: Create Free Account
- Go to https://www.mongodb.com/cloud/atlas
- Sign up for free account
- Create a new project called "workschedule"

### Step 2: Create a Cluster
- Click "Create" → Select "Free Tier"
- Choose region closest to you
- Wait for cluster to be deployed (5-10 min)

### Step 3: Create Database User
- Go to "Database Access"
- Click "Add New Database User"
- Username: `admin`
- Password: `YourSecurePassword123!`
- Click "Add User"

### Step 4: Get Connection String
- Click "Clusters" → "Connect" button
- Select "Connect your application"
- Choose Node.js driver
- Copy the connection string

### Step 5: Set Environment Variable
Replace `<password>` and `<cluster>` in the connection string:
```bash
export MONGODB_URI="mongodb+srv://admin:<password>@<cluster>.mongodb.net/workschedule?retryWrites=true&w=majority"
```

---

## Step 3: Install Dependencies

```bash
cd /workspaces/workschedule/work-schedule
npm install
```

---

## Step 4: Start the Server

### Terminal 1 - Start Backend Server
```bash
export MONGODB_URI="mongodb://admin:password123@localhost:27017/workschedule?authSource=admin"
npm run start
```

Wait for output like:
```
Node Express server listening on http://localhost:4000
Connected to MongoDB: mongodb://admin:password123@localhost:27017/workschedule?authSource=admin
```

### Terminal 2 - Start Frontend (if separate)
```bash
cd /workspaces/workschedule/work-schedule
ng serve
```

---

## Step 5: Test the Connection

### Verify MongoDB Connection (in new terminal):
```bash
mongosh "mongodb://admin:password123@localhost:27017/workschedule" --authenticationDatabase admin --eval "db.adminCommand('ping')"
```

Expected output:
```
{ ok: 1 }
```

### Test Booking API:
```bash
curl -X POST http://localhost:4000/api/bookWorkspace \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "1",
    "workspaceName": "Meeting Room A",
    "date": "2026-07-10",
    "time": "09:00",
    "endTime": "10:00",
    "duration": 1,
    "notes": "Test booking",
    "price": 5,
    "status": "Confirmed"
  }'
```

Expected response:
```json
{
  "success": true,
  "booking": {...},
  "bookingId": "..."
}
```

---

## Troubleshooting

### MongoDB Connection Timeout
- Check if MongoDB is running: `docker ps`
- Check MongoDB logs: `docker logs workschedule-mongodb`
- Verify connection string in MONGODB_URI

### Port 27017 Already in Use
```bash
lsof -i :27017  # Find what's using the port
docker stop workschedule-mongodb  # Stop the container
docker rm workschedule-mongodb  # Remove it
```

### CORS/Connection Issues
- Make sure backend is running on http://localhost:4000
- Check browser console for errors
- Check server logs for connection details

### Cannot Connect to Atlas
- Whitelist your IP: MongoDB Atlas → Security → Network Access → Add IP Address
- Use `+` to add current IP automatically
