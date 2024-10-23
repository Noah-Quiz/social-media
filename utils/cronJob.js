const cron = require("node-cron");

const MemberGroupRepository = require("../repositories/MemberGroupRepository");

cron.schedule("* * * * *", async () => {
  try {
    const memberGroup = new MemberGroupRepository();
    await memberGroup.handleExpire();
  } catch (error) {
    console.error(error);
  }
});
