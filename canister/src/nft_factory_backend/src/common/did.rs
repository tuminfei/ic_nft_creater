use candid::Principal;
use ic_cdk::api::call::CallResult;

#[candid::candid_method(query, rename = "__get_candid_interface_tmp_hack")]
fn __export_candid() -> String {
    todo!()
}

#[ic_cdk::query(name = "__get_candid_interface_tmp_hack")]
#[cfg(not(test))]
fn export_candid() -> String {
    #[allow(unused_imports)]
    use crate::types::*;

    candid::export_service!();
    __export_service()
}

#[test]
fn print_did() {
    #[allow(unused_imports)]
    use crate::types::*;
    candid::export_service!();
    let text = __export_service();
    std::println!("{}", text);

    use std::io::Write;
    let filename = "nft_factory_backend.did";
    std::fs::remove_file(filename).unwrap();
    std::fs::File::create(&filename)
        .expect("create failed")
        .write_all(text.as_bytes())
        .expect("write candid failed");
}
