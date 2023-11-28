#[ic_cdk::query(name = "wallet_balance")]
#[candid::candid_method(query, rename = "wallet_balance")]
pub fn wallet_balance() -> candid::Nat {
    ic_canister_kit::canister::cycles::wallet_balance()
}

#[ic_cdk::update(name = "wallet_receive")]
#[candid::candid_method(update, rename = "wallet_receive")]
pub fn wallet_receive() -> ic_canister_kit::canister::cycles::WalletReceiveResult {
    ic_canister_kit::canister::cycles::wallet_receive()
}

#[ic_cdk::update(name = "canister_status")]
#[candid::candid_method(update, rename = "canister_status")]
async fn canister_status() -> ic_canister_kit::canister::status::CanisterStatusResult {
    ic_canister_kit::canister::status::canister_status(ic_canister_kit::identity::self_canister_id()).await
}

#[ic_cdk::query(name = "whoami")]
#[candid::candid_method(query, rename = "whoami")]
async fn whoami() -> ic_canister_kit::types::UserId {
    ic_canister_kit::identity::caller()
}
