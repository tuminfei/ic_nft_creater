use ic_canister_kit::types::MaintainingReason;
use crate::stable::{with_mut_state, with_state, is_admin};

#[ic_cdk::update(name = "maintainable_set_maintaining", guard = "is_admin")]
#[candid::candid_method(update, rename = "maintainable_set_maintaining")]
fn maintainable_set_maintaining(maintaining: Option<MaintainingReason>) {
    with_mut_state(|s| s.maintainable.set_maintaining(maintaining));
}

#[ic_cdk::query(name = "maintainable_is_maintaining")]
#[candid::candid_method(query, rename = "maintainable_is_maintaining")]
fn maintainable_is_maintaining() -> bool {
    with_state(|s| s.maintainable.is_maintaining())
}
