use candid::{CandidType, Deserialize};

#[allow(non_snake_case)]
#[derive(Debug, CandidType, Deserialize)]
pub struct StatusRequest {
    pub cycles: bool,
    pub memory_size: bool,
    pub heap_memory_size: bool,
}

#[allow(non_snake_case)]
#[derive(Debug, CandidType)]
pub struct StatusResponse {
    pub cycles: Option<u64>,
    pub memory_size: Option<u64>,
    pub heap_memory_size: Option<u64>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct WalletReceiveResponse {
    pub accepted: u64,
}
