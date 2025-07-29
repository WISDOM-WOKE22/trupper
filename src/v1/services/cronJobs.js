const cron = require('node-cron');
const ExamMode = require('../models/examMode');
const { getIO } = require('./socket/io');

// Function to disable expired active exam modes
const disableExpiredActiveExamModes = async () => {
  try {
    console.log('🕐 Running cron job: Checking for expired exam modes...');

    const currentTime = new Date();

    // Find all active exam modes that have expired (validTill < currentTime)
    const expiredExamModes = await ExamMode.find({
      status: true,
      validTill: { $lt: currentTime },
    });

    if (expiredExamModes.length === 0) {
      console.log('✅ No expired exam modes found to disable');
      return;
    }

    // Disable only expired exam modes
    const result = await ExamMode.updateMany(
      {
        status: true,
        validTill: { $lt: currentTime },
      },
      { status: false }
    );

    console.log(
      `✅ Successfully disabled ${result.modifiedCount} expired exam modes`
    );

    // Log details of disabled exam modes
    expiredExamModes.forEach((examMode) => {
      console.log(
        `📅 Disabled: "${examMode.name}" (Expired: ${examMode.validTill})`
      );
    });

    // Emit socket event to notify clients about deactivated exam modes
    const io = getIO();
    if (io) {
      expiredExamModes.forEach((examMode) => {
        io.emit('examModeDeactivated', examMode);
      });
      console.log('📡 Emitted examModeDeactivated events to connected clients');
    }
  } catch (error) {
    console.error(
      '❌ Error in cron job - disableExpiredActiveExamModes:',
      error
    );
  }
};

// Initialize cron jobs
const initializeCronJobs = () => {
  console.log('🚀 Initializing cron jobs...');

  // Cron job to disable expired active exam modes every hour
  cron.schedule(
    '0 * * * *',
    () => {
      disableExpiredActiveExamModes();
    },
    {
      scheduled: true,
      timezone: 'UTC',
    }
  );

  console.log(
    '✅ Cron job scheduled: Disable expired exam modes every hour (0 * * * *)'
  );
};

module.exports = {
  initializeCronJobs,
  disableExpiredActiveExamModes,
};
