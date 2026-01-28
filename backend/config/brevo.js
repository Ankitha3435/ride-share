const brevo = require('@getbrevo/brevo');
require('dotenv').config();

// Create Brevo API instance
const createBrevoClient = () => {
  try {
    // Validate required environment variables
    if (!process.env.BREVO_API_KEY) {
      throw new Error('Missing Brevo API key. Please set BREVO_API_KEY in environment variables');
    }

    const apiInstance = new brevo.TransactionalEmailsApi();
    const apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    return apiInstance;
  } catch (error) {
    console.error('Error creating Brevo client:', error.message);
    throw error;
  }
};

// Verify Brevo API connection
const verifyBrevoConnection = async () => {
  try {
    const apiInstance = createBrevoClient();
    // Test the connection by getting account info
    const accountApi = new brevo.AccountApi();
    const apiKey = accountApi.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    
    await accountApi.getAccount();
    console.log('✅ Brevo API connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Brevo API connection failed:', error.message);
    return false;
  }
};

module.exports = {
  createBrevoClient,
  verifyBrevoConnection
};

