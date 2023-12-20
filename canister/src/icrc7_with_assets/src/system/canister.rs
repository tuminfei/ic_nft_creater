use super::types::{StatusRequest, StatusResponse, WalletReceiveResponse};
use crate::ic_util;

#[ic_cdk::query(name = "get_status")]
#[candid::candid_method(query, rename = "get_status")]
pub fn get_status(request: StatusRequest) -> StatusResponse {
    let cycles = obtain_value(request.cycles, get_current_cycles);
    let memory_size = obtain_value(request.memory_size, get_current_memory_size);
    let heap_memory_size = obtain_value(request.heap_memory_size, get_current_heap_memory_size);

    StatusResponse {
        cycles,
        memory_size,
        heap_memory_size,
    }
}

#[ic_cdk::update(name = "wallet_receive")]
#[candid::candid_method(update, rename = "wallet_receive")]
pub fn wallet_receive() -> WalletReceiveResponse {
    let available = ic_cdk::api::call::msg_cycles_available128();

    if available == 0 {
        return WalletReceiveResponse { accepted: 0 };
    }
    let accepted = ic_cdk::api::call::msg_cycles_accept128(available);
    assert!(accepted == available);
    WalletReceiveResponse {
        accepted: accepted as u64,
    }
}

fn obtain_value<T, F>(need: bool, supplier: F) -> Option<T>
where
    F: Fn() -> T,
{
    if need {
        Some(supplier())
    } else {
        None
    }
}

fn get_current_cycles() -> u64 {
    ic_util::get_cycles()
}

fn get_current_memory_size() -> u64 {
    ic_util::get_stable_memory_size() + ic_util::get_heap_memory_size()
}

fn get_current_heap_memory_size() -> u64 {
    ic_util::get_heap_memory_size()
}
