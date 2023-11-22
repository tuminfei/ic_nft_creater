use ic_canister_kit::types::MaintainingReason;

use crate::assets_stable::{with_mut_state, with_state, is_admin};

// 设置维护状态
#[ic_cdk::update(name = "maintainable_set_maintaining", guard = "is_admin")] // ! 该方法须检查权限
#[candid::candid_method(update, rename = "maintainable_set_maintaining")]
fn maintainable_set_maintaining(maintaining: Option<MaintainingReason>) {
    with_mut_state(|s| s.maintainable.set_maintaining(maintaining));
}

// 查询维护状态
#[ic_cdk::query(name = "maintainable_is_maintaining")]
#[candid::candid_method(query, rename = "maintainable_is_maintaining")]
fn maintainable_is_maintaining() -> bool {
    with_state(|s| s.maintainable.is_maintaining())
}
