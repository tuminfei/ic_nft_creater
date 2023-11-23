use crate::stable::with_state;
use crate::types::CanisterData;

#[ic_cdk::query(name = "factory_canister_list")]
#[candid::candid_method(query, rename = "factory_canister_list")]
fn factory_canister_list() -> Vec<CanisterData> {
    with_state(|s| {
        s.canisters
            .canisters
            .clone()
            .into_iter()
            .map(|(_, canister)| canister)
            .collect()
    })
}

#[ic_cdk::query(name = "factory_canister_info")]
#[candid::candid_method(query, rename = "factory_canister_info")]
fn factory_canister_info(record_id: u64) -> Option<CanisterData> {
    with_state(|s| s.canisters.canisters.get(&record_id).cloned())
}
