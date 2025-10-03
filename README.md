# Marcos-CaseVault

### Prerequisites
- Node.js ≥ 16.x
- npm
- Python >= 3.9
- Git

### Clone the repository

```bash
git clone git@github.com:0xshr00msz/Marcos-CaseVault.git
cd Marcos-CaseVault
```
### Frontend Setup (React)

```bash
cd frontend
npm install
npm start           # Run app locally
```

### Backend Setup (Python + AWS Lambda)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run locally with AWS SAM
# sam local start-api
```

### Requirements Files
backend/requirements.txt → Python libraries (e.g. boto3, psycopg2-binary)
frontend/package.json → Node dependencies

### Running Locally
Frontend: `npm start`
Backend: test locally with `uvicorn` or AWS SAM
