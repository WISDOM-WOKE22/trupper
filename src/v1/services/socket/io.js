let ioInstance = null;

async function setIO(io) {
  if (!io) {
    console.error('[io.js] setIO called without a valid io instance.');
    throw new Error('A valid Socket.io instance must be provided to setIO.');
  }
  ioInstance = io;
  // Uncomment for debugging if needed
  // console.debug("[io.js] ioInstance set.");
}

function getIO() {
  if (!ioInstance) {
    // Only log error once to avoid spamming logs if called repeatedly
    if (!getIO._warned) {
      console.error('[io.js] getIO called before initialization.');
      getIO._warned = true;
    }
    throw new Error('Socket.io not initialized yet');
  }
  // Uncomment for debugging if needed
  // console.debug("[io.js] getIO returning ioInstance.");
  return ioInstance;
}

module.exports = {
  setIO,
  getIO,
};
