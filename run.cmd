echo Starting Crude Gradebook

cd backend
venv/Scripts/activate
pip install -r requirements.txt
flask run

cd ../frontend
npm install
npm start