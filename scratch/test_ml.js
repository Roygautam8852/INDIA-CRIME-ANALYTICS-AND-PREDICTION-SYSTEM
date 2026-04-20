const axios = require('axios');

async function testPredict() {
  try {
    const res = await axios.post('http://localhost:5001/api/predict', {
      Year: 2025,
      State_UT_Name: "MAHARASHTRA",
      model: "random_forest",
      IPC_Crimes: 180000,
      SLL_Crimes: 50000
    });
    console.log('Prediction Response:', res.status, res.data);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) console.log('Data:', err.response.data);
  }
}

testPredict();
