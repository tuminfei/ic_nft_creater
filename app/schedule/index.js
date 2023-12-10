const schedule = require("node-schedule");
const factoryService = require("../canister/nft_factory_service");

const job = schedule.scheduleJob('*/1 * * * *', async function(){
    console.info(new Date(),"start get factory canisters....")
    console.info(new Date(),"end get factory canisters....")
});
