use super::types::{StatusRequest, StatusResponse};
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
