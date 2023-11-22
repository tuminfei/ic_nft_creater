use crate::assets_stable::{is_admin, must_be_running, with_mut_state, State};

#[ic_cdk::update(name = "assets_delete", guard = "is_admin")]
#[candid::candid_method(update, rename = "assets_delete")]
fn assets_delete(names: Vec<String>) {
    must_be_running();

    with_mut_state(|s: &mut State| {
        for name in names {
            s.uploading.clean(&name);
            s.assets.clean(&name);
        }
    })
}
