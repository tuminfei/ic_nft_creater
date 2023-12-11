use super::types::*;
use crate::canister_icrc7::{CanisterInfo, StatusRequest, StatusResponse, ICRC7};
use crate::stable::{is_admin, must_be_running, with_mut_state, with_state, TIMER_IDS};
use candid::Principal;
use ic_canister_kit::times::now;
use std::time::Duration;

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
    ()
}

fn static_schedule_task() {
    ic_cdk::spawn(async move { schedule_task().await });
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

#[ic_cdk::update(name = "schedule_start", guard = "is_admin")]
#[candid::candid_method(update, rename = "schedule_start")]
fn schedule_start(secs: u64) {
    let secs = Duration::from_secs(secs);
    ic_cdk::println!("Timer canister: Starting a new timer with {secs:?} interval...");
    let timer_id = ic_cdk_timers::set_timer_interval(secs, static_schedule_task);
    TIMER_IDS.with(|timer_ids| timer_ids.borrow_mut().push(timer_id));
}

#[ic_cdk::update(name = "schedule_stop", guard = "is_admin")]
#[candid::candid_method(update, rename = "schedule_stop")]
fn schedule_stop() {
    TIMER_IDS.with(|timer_ids| {
        if let Some(timer_id) = timer_ids.borrow_mut().pop() {
            ic_cdk::println!("Timer canister: Stopping timer ID {timer_id:?}...");
            ic_cdk_timers::clear_timer(timer_id);
        }
    });
}
