use crate::assets_stable::{with_state, State};

#[ic_cdk::query(name = "assets_download")]
#[candid::candid_method(query, rename = "assets_download")]
fn assets_download(path: String) -> Vec<u8> {
    with_state(|s: &State| s.assets.download(path))
}

#[ic_cdk::query(name = "assets_download_by")]
#[candid::candid_method(query, rename = "assets_download_by")]
fn assets_download_by(path: String, offset: u64, offset_end: u64) -> Vec<u8> {
    with_state(|s: &State| s.assets.download_by(path, offset, offset_end))
}
