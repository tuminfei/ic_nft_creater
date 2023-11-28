use candid::{CandidType, Deserialize, Principal};

pub struct ICRC7 {
    principal: Principal,
}

#[derive(CandidType, Deserialize, Default, Debug, Clone)]
pub struct CanisterInfo {
    pub heap_memory_size: u64,
    pub memory_size: u64,
    pub cycles: u64,
}

#[allow(non_snake_case)]
#[derive(Debug, CandidType, Deserialize)]
pub struct StatusRequest {
    pub cycles: bool,
    pub memory_size: bool,
    pub heap_memory_size: bool,
}

#[allow(non_snake_case)]
#[derive(Debug, CandidType, Deserialize)]
pub struct StatusResponse {
    pub cycles: Option<u64>,
    pub memory_size: Option<u64>,
    pub heap_memory_size: Option<u64>,
}

impl ICRC7 {
    pub fn new(principal: Principal) -> Self {
        ICRC7 { principal }
    }

    pub async fn get_status(&self, status_request: StatusRequest) -> StatusResponse {
        let call_result: Result<(StatusResponse,), _> =
            ic_cdk::api::call::call(self.principal, "get_status", (status_request, )).await;

        call_result.unwrap().0
    }
}
