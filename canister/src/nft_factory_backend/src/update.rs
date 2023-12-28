use crate::canister_icrc7::{CanisterInfo, ICRC7};
use crate::stable::{is_admin, must_be_running, STATE};
use crate::types::{CanisterData, CreateArg, InitArg};
use candid::{Encode, Nat, Principal};
use ic_cdk::api::call::CallResult;
use ic_cdk::api::management_canister::main::{
    CanisterIdRecord, CanisterInstallMode, CanisterSettings, CreateCanisterArgument,
    InstallCodeArgument,
};

const WASM: &[u8] = std::include_bytes!("./../../icrc7_with_assets/wasm/icrc7_with_assets.wasm.gz");

pub async fn get_an_address(caller: &Principal, owner: &Principal) -> Principal {
    ic_cdk::println!("{}", caller.clone());
    let canister_setting = CanisterSettings {
        controllers: Some(vec![caller.clone(), owner.clone(), ic_cdk::id()]),
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
    let owner = arg.owner.clone();
    let nft_name = arg.name.clone();
    let nft_symbol = arg.symbol.clone();
    let arg = InitArg::from((caller, arg));
    let address = get_an_address(&caller, &owner).await;
    if address == Principal::anonymous() {
        ic_cdk::trap("Failed to get an address")
    }
    let arg = Encode!(&arg).unwrap();

    let result = match install_wasm(WASM.to_vec(), address, arg).await {
        true => address,
        false => ic_cdk::trap("Failed to install code"),
    };

    let record_id: u64 = STATE.with(|state| state.borrow().next_canister_id);
    let next_record_id = record_id + 1;
    let canister_info: CanisterData = CanisterData {
        id: record_id,
        name: nft_name,
        symbol: nft_symbol,
        owner: owner,
        proxy: caller,
        canister_id: result,
        created_at: ic_cdk::api::time(),
        canister_info: CanisterInfo::default(),
    };

    STATE.with(|state| state.borrow_mut().next_canister_id = next_record_id);
    STATE.with(|_state| {
        let mut state = _state.borrow_mut();
        state.canisters.canisters.insert(record_id, canister_info);
    });
    return result;
}

#[ic_cdk::update(name = "set_icrc7_admin", guard = "is_admin")]
#[candid::candid_method(update, rename = "set_icrc7_admin")]
pub async fn set_icrc7_admin(canister_id: Principal, admin: Principal) -> Principal {
    must_be_running();

    let icrc7_token = ICRC7::new(canister_id);
    let update_admin: Principal = icrc7_token.permission_set_admin(admin).await;
    return update_admin;
}

#[ic_cdk::update(name = "set_icrc7_cyclse", guard = "is_admin")]
#[candid::candid_method(update, rename = "set_icrc7_cyclse")]
pub async fn set_icrc7_cyclse(canister_id: Principal) -> CallResult<()> {
    must_be_running();

    let args: CanisterIdRecord = CanisterIdRecord {
        canister_id: canister_id,
    };

    ic_cdk::api::call::call_with_payment(
        Principal::management_canister(),
        "deposit_cycles",
        (args,),
        200_000_000_000,
    )
    .await
}
