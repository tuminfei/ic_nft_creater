use crate::assets_stable::{is_admin, must_be_running, with_mut_state, State};

use super::types::UploadingArg;

#[ic_cdk::update(name = "assets_upload", guard = "is_admin")]
#[candid::candid_method(update, rename = "assets_upload")]
fn assets_upload(args: Vec<UploadingArg>) {
    must_be_running();

    with_mut_state(|s: &mut State| {
        for arg in args {
            let done = s.uploading.put(arg);

            if let Some(file) = done {
                s.assets.put(&file);
                let path = file.path.clone();
                s.uploading.clean(&path);
            }
        }
    })
}
