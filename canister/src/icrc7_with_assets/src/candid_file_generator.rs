use crate::{errors::*, types::*};
use candid::export_service;
use ic_cdk_macros::query;
use icrc_ledger_types::{icrc::generic_metadata_value::MetadataValue, icrc1::account::Account};

use crate::assets::types::*;
use crate::system::types::*;
use ic_canister_kit::types::*;

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    export_service!();
    __export_service()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn save_candid() {
        use std::env;
        use std::fs::write;
        use std::path::PathBuf;

        let dir = PathBuf::from(env::current_dir().unwrap());
        write(dir.join("icrc7_with_assets.did"), export_candid()).expect("Write failed.");
    }
}
