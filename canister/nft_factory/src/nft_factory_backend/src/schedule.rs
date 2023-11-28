use super::types::*;
use crate::canister_icrc7::{CanisterInfo, StatusRequest, StatusResponse, ICRC7};
use crate::stable::{is_admin, must_be_running, with_mut_state, with_state};
use candid::Principal;
use ic_canister_kit::times::now;

#[allow(unused)]
#[allow(unused_variables)]
pub async fn schedule_task() {
    ic_cdk::println!("do schedule task... ({}) ", now());

    let canisters: Vec<CanisterData> = with_state(|s| {
        s.canisters
            .canisters
            .clone()
            .into_iter()
            .map(|(_, canister)| canister)
            .collect()
    });
    for (canister_info) in canisters.iter() {
        fetch_canister(canister_info.id, canister_info.canister_id).await;
    }
}

pub async fn fetch_canister(index_id: u64, canister_id: Principal) {
    let icrc7_token = ICRC7::new(canister_id);
    let arg: StatusRequest = StatusRequest {
        cycles: true,
        memory_size: true,
        heap_memory_size: true,
    };

    let status: StatusResponse = icrc7_token.get_status(arg).await;
    let canister_info: CanisterInfo = CanisterInfo {
        cycles: status.cycles.unwrap_or(0),
        heap_memory_size: status.heap_memory_size.unwrap_or(0),
        memory_size: status.memory_size.unwrap_or(0),
    };

    with_mut_state(|s| {
        if let Some(data) = s.canisters.canisters.get_mut(&index_id) {
            data.canister_info = canister_info.clone()
        }
    });
}

#[ic_cdk::update(name = "schedule_trigger", guard = "is_admin")]
#[candid::candid_method(update, rename = "schedule_trigger")]
async fn schedule_trigger() {
    must_be_running();

    schedule_task().await;
}
