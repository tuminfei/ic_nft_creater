const schedule = require("node-schedule");
import FactoryCanisterService from "../canister/nft_factory_service";

function startScheduledTask() {
  const server = new FactoryCanisterService();
  const job1 = schedule.scheduleJob("1 * * * *", async function () {
    console.info(new Date(), "start get factory canisters....");
    let canister_infos = [];
    try {
      canister_infos = await server.factory_canister_list();
    } catch (error) {
      console.info("call canister error");
    }
    console.info(canister_infos);
    console.info(new Date(), "end get factory canisters....");
  });
}

module.exports = { startScheduledTask };
