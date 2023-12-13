const schedule = require("node-schedule");
import FactoryCanisterService from "../canister/nft_factory_service";
import { Principal } from "@dfinity/principal";
import db from "../db.server";

function startScheduledTask() {
  const server = new FactoryCanisterService();
  const job1 = schedule.scheduleJob("*/1 * * * *", async function () {
    console.info(new Date(), "start get factory canisters....");
    let canister_infos = [];
    try {
      canister_infos = await server.factory_canister_list();
      // console.info(canister_infos);
      canister_infos.map(async (element) => {
        let canister_id = Principal.from(element.canister_id).toString();
        let status = element.canister_info;
        await db.nFTCollection.updateMany({
          where: { canister_id: canister_id },
          data: {
            status_cycles: parseInt(status.cycles),
            status_heap_memory_size: parseInt(status.heap_memory_size),
            status_memory_size: parseInt(status.memory_size),
          },
        });
      });
      console.info("update canister status");
    } catch (error) {
      console.info("call canister error");
    }
    console.info(new Date(), "end get factory canisters....");
  });
}

module.exports = { startScheduledTask };
