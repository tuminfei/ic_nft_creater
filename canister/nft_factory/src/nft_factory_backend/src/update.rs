use crate::stable::{is_admin, must_be_running};
use crate::types::{CreateArg, InitArg};
use candid::{Encode, Nat, Principal};
use ic_cdk::api::management_canister::main::{
    CanisterIdRecord, CanisterInstallMode, CanisterSettings, CreateCanisterArgument,
    InstallCodeArgument,
};

const WASM: &[u8] = std::include_bytes!("./../../icrc7_with_assets/wasm/icrc7_with_assets.wasm.gz");

pub async fn get_an_address(caller: &Principal) -> Principal {
    ic_cdk::println!("{}", caller.clone());
    let canister_setting = CanisterSettings {
        controllers: Some(vec![caller.clone(), ic_cdk::id()]),
        compute_allocation: Some(Nat::from(0_u64)),
        memory_allocation: Some(Nat::from(0_u64)),
        freezing_threshold: Some(Nat::from(0_u64)),
    };
    let args = CreateCanisterArgument {
        settings: Some(canister_setting),
    };
    let (canister_id,): (CanisterIdRecord,) = match ic_cdk::api::call::call_with_payment(
        Principal::management_canister(),
        "create_canister",
        (args,),
        200_000_000_000,
    )
    .await
    {
        Ok(x) => x,
        Err((_, _)) => (CanisterIdRecord {
            canister_id: candid::Principal::anonymous(),
        },),
    };
    canister_id.canister_id
}

pub async fn install_wasm(wasm: Vec<u8>, canister_id: Principal, args: Vec<u8>) -> bool {
    let install_config = InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        wasm_module: wasm,
        canister_id,
        arg: args,
    };
    match ic_cdk::api::call::call(
        Principal::management_canister(),
        "install_code",
        (install_config,),
    )
    .await
    {
        Ok(x) => x,
        Err((rejection_code, msg)) => {
            ic_cdk::println!("{:?} {:?}", rejection_code, msg);
            return false;
        }
    }
    true
}

#[ic_cdk::update(name = "create_icrc7_collection", guard = "is_admin")]
#[candid::candid_method(update, rename = "create_icrc7_collection")]
pub async fn create_icrc7_collection(arg: CreateArg) -> Principal {
    must_be_running();

    let caller = ic_cdk::caller();
    let arg = InitArg::from((caller, arg));
    let address = get_an_address(&caller).await;
    if address == Principal::anonymous() {
        ic_cdk::trap("Failed to get an address")
    }
    let arg = Encode!(&arg).unwrap();
    match install_wasm(WASM.to_vec(), address, arg).await {
        true => address,
        false => ic_cdk::trap("Failed to install code"),
    }
}
