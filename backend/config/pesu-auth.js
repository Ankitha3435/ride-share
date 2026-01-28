const axios = require('axios');
require('dotenv').config();

// PESU Authentication Server Configuration
// You MUST run the PESU Auth server locally or deploy it yourself
// See PESU_AUTH_SETUP.md for instructions
const PESU_AUTH_URL = process.env.PESU_AUTH_URL || 'http://localhost:5000';

/**
 * Authenticate user with PESU Authentication Server
 * @param {string} username - PESU username (SRN)
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User profile data from PESU server
 */
const authenticateWithPESU = async (username, password) => {
  try {
    console.log(`Attempting PESU auth for username: ${username}`);
    const response = await axios.post(`${PESU_AUTH_URL}/authenticate`, {
      username,
      password,
      profile: true  // Request profile data from PESU Auth
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('PESU auth response status:', response.status);
    console.log('PESU auth response data:', response.data);

    // The PESU auth server returns the profile in response.data.profile
    return {
      success: response.data.status || true,
      profile: response.data.profile || response.data
    };
  } catch (error) {
    console.error('PESU Authentication Error:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('PESU auth error response:', error.response.status, error.response.data);
      return {
        success: false,
        error: error.response.data?.message || 'Invalid username or password',
        statusCode: error.response.status
      };
    } else if (error.request) {
      // The request was made but no response was received
      console.error('PESU auth server unreachable');
      return {
        success: false,
        error: 'Unable to reach PESU authentication server. Please ensure the PESU Auth server is running.',
        statusCode: 503
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('PESU auth request setup error:', error);
      return {
        success: false,
        error: 'Authentication request failed. Please try again.',
        statusCode: 500
      };
    }
  }
};

/**
 * Map campus code to college name
 * @param {number} campusCode - Campus code from PESU profile
 * @returns {string} - College name
 */
const mapCampusToCollege = (campusCode, campusName) => {
  // If campus name is provided, try to match it first
  if (campusName) {
    if (campusName.toLowerCase().includes('ring road') || campusName.toLowerCase().includes('rr')) {
      return 'PES University Ring Road Campus';
    }
    if (campusName.toLowerCase().includes('electronic city') || campusName.toLowerCase().includes('ec')) {
      return 'PES University Electronic City Campus';
    }
  }
  
  // Fallback to campus code
  // Assuming: 1 = Ring Road Campus, 2 = Electronic City Campus
  if (campusCode === 1) {
    return 'PES University Ring Road Campus';
  } else if (campusCode === 2) {
    return 'PES University Electronic City Campus';
  }
  
  // Default to Electronic City if unknown
  return 'PES University Electronic City Campus';
};

module.exports = {
  authenticateWithPESU,
  mapCampusToCollege
};

