const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const getLogger = require("../utils/logger");
const logger = getLogger("LOGIN_STREAK");

const handleLoginStreakService = async (user, rate) => {
  const type = checkStreakDate(new Date(), user.lastLogin);
  switch (type) {
    //user login at first day of the month
    case 0:
      user.streak = 1;
      user.point += rate.dailyPoint + rate.streakBonus * user.streak;

      // Replace console.log with logger.info
      logger.info(
        `Case 0: new month, streak: ${user.streak}, user ${
          user._id
        } successfully received: ${
          rate.dailyPoint + rate.streakBonus * user.streak
        } point, current point: ${user.point}`
      );
      break;

    //user have already logged in the same day and receive their point
    case 1:
      logger.info(
        `Case 1: same day, streak: ${
          user.streak
        }, You've already received today's login bonus: ${
          rate.dailyPoint + rate.streakBonus * user.streak
        } points, current point: ${user.point}`
      );
      break;
    case 2:
      user.streak += 1;
      user.point += rate.dailyPoint + rate.streakBonus * user.streak;
      logger.info(
        `Case 2: next day, streak: ${user.streak}, user ${
          user._id
        } successfully received: ${
          rate.dailyPoint + rate.streakBonus * user.streak
        } points, current point: ${user.point}`
      );

      break;
    case 3:
      user.streak = 1;

      user.point += rate.dailyPoint + rate.streakBonus * user.streak;

      logger.info(
        `Case 3: not next day, streak: ${user.streak}, user ${
          user._id
        } successfully received: ${
          rate.dailyPoint + rate.streakBonus * user.streak
        } points, current point: ${user.point}`
      );

      break;
    default:
      break;
  }
};

const checkStreakDate = (date1, date2) => {
  // Normalize the dates to midnight to avoid time issues
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  // Calculate the difference in days
  const diffInTime = d1 - d2;
  const diffInDays = diffInTime / (1000 * 60 * 60 * 24);

  //same day
  if (diffInDays === 0) {
    return 1; //same day
  } else if (d1.getDate() === 1) {
    return 0; //user login first day of the month
  } else if (diffInDays === 1) {
    return 2; // Next day
  } else {
    return 3; // More than one day apart
  }
};

module.exports = { handleLoginStreakService, checkStreakDate };
