// frontend/src/config.js
const getBackendUrl = () => {
  const hostname = window.location.hostname;
  const backendPort = process.env.REACT_APP_BACKEND_PORT || 5000; // set via frontend/.env
  return `http://${hostname}:${backendPort}`;
};

export const BACKEND_URL = getBackendUrl();
console.log('🔗 Backend URL:', BACKEND_URL);
