require("dotenv").config();

const schedule = require("node-schedule");
const factory = require("../canister/nft_factory_service");

const job1 = schedule.scheduleJob("1 * * * *", async function () {
  console.info(new Date(), "start get factory canisters....");
  let canister_infos = await factory.factoryService.factory_canister_list();
  console.info(canister_infos);
  console.info(new Date(), "end get factory canisters....");
});
