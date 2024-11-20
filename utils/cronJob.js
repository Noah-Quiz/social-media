const cron = require("node-cron");

const MemberGroupRepository = require("../repositories/MemberGroupRepository");
const VipRepository = require("../repositories/VipRepository");
cron.schedule("* * * * *", async () => {
  try {
    const memberGroup = new MemberGroupRepository();
    await memberGroup.handleExpire();
    const vip = new VipRepository();
    await vip.handleExpire();
  } catch (error) {
    console.error(error);
  }
});
