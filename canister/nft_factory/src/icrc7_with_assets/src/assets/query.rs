use crate::assets_stable::{with_state, State};

use super::types::QueryFile;

#[ic_cdk::query(name = "assets_files")]
#[candid::candid_method(query, rename = "assets_files")]
fn assets_files() -> Vec<QueryFile> {
    with_state(|s: &State| s.assets.files())
}
