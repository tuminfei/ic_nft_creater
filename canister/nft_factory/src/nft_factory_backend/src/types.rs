use candid::{CandidType, Deserialize, Principal};
use ic_canister_kit::types::Stable;
pub use ic_canister_kit::types::*;
use icrc_ledger_types::icrc1::account::Account;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct CanisterData {
    pub id: u64,
    pub name: String,
    pub symbol: String,
    pub owner: Principal,
    pub proxy: Principal,
    pub canister_id: Principal,
    pub created_at: u64,
}

impl Default for CanisterData {
    fn default() -> Self {
        CanisterData {
            id: 0,
            name: String::from("name"),
            symbol: String::from("symbol"),
            owner: Principal::anonymous(),
            proxy: Principal::anonymous(),
            canister_id: Principal::anonymous(),
            created_at: 0,
        }
    }
}

#[derive(Default, Debug, Clone)]
pub struct StableCanisters {
    pub canisters: HashMap<u64, CanisterData>,
}

pub type StableCanistersState = (Vec<CanisterData>,);

impl Stable<StableCanistersState, StableCanistersState> for StableCanisters {
    fn store(&mut self) -> StableCanistersState {
        let canisters = std::mem::take(&mut self.canisters);
        let canisters = canisters
            .into_iter()
            .map(|(_, canister)| canister)
            .collect();
        (canisters,)
    }

    fn restore(&mut self, restore: StableCanistersState) {
        let canisters = restore.0;
        // let next_canister_id = canisters.len();
        let canisters: HashMap<u64, CanisterData> = canisters
            .into_iter()
            .map(|canister| (canister.id, canister))
            .collect();

        let _ = std::mem::replace(&mut self.canisters, canisters);
    }
}

#[derive(CandidType)]
pub struct InitArg{
    pub name: String,
    pub symbol: String,
    pub minting_authority: Option<Principal>,
    pub royalties: Option<u16>,
    pub royalties_recipient: Option<Account>,
    pub description: Option<String>,
    pub image: Option<Vec<u8>>,
    pub supply_cap: Option<u128>,
}

#[derive(CandidType, Deserialize)]
pub struct CreateArg {
    pub name: String,
    pub symbol: String,
    pub royalties: Option<u16>,
    pub royalties_recipient: Option<Account>,
    pub description: Option<String>,
    pub image: Option<Vec<u8>>,
    pub supply_cap: Option<u128>,
}

impl From<(Principal, CreateArg)> for InitArg{
    fn from((minting_authority, arg): (Principal, CreateArg)) -> Self {
        InitArg { name: arg.name, symbol: arg.symbol, minting_authority: Some(minting_authority), royalties: arg.royalties, royalties_recipient: arg.royalties_recipient, description: arg.description, image: arg.image, supply_cap: arg.supply_cap }
    }
}
