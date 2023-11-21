use std::borrow::Cow;
use std::collections::HashMap;
use std::iter::FromIterator;

use crate::state::COLLECTION;
use candid::CandidType;
use ic_cdk::{api::call, export::candid};
use percent_encoding::percent_decode_str;
use serde::Deserialize;

#[derive(CandidType, Deserialize)]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub headers: HashMap<String, String>,
    pub body: Vec<u8>,
}

#[derive(CandidType)]
pub struct HttpResponse<'a> {
    pub status_code: u16,
    pub headers: HashMap<&'a str, Cow<'a, str>>,
    pub body: Cow<'a, [u8]>,
}

#[candid::candid_method(query, rename = "http_request")]
fn __http_request(_req: HttpRequest) -> HttpResponse<'static> {
    todo!()
}

// This could reply with a lot of data. To return this data from the function would require it to be cloned,
// because the thread_local! closure prevents us from returning data borrowed from inside it.
// Luckily, it doesn't actually get returned from the exported WASM function, that's just an abstraction.
// What happens is it gets fed to call::reply, and we can do that explicitly to save the cost of cloning the data.
// #[query] calls call::reply unconditionally, and calling it twice would trap, so we use #[export_name] directly.
// This requires duplicating the rest of the abstraction #[query] provides for us, like setting up the panic handler with
// ic_cdk::setup() and fetching the function parameters via call::arg_data.
// cdk 0.5 makes this unnecessary, but it has not been released at the time of writing this example.
#[export_name = "canister_query http_request"]
fn http_request(/* req: HttpRequest */) /* -> HttpResponse */
{
    ic_cdk::setup();
    let req = call::arg_data::<(HttpRequest,)>().0;
    COLLECTION.with(|collection| {
        let collection = collection.borrow();
        let url = req.url.split('?').next().unwrap_or("/");
        let mut path = url[1..]
            .split('/')
            .map(|segment| percent_decode_str(segment).decode_utf8().unwrap());
        let mut headers = HashMap::from_iter([(
            "Content-Security-Policy",
            "default-src 'self' ; script-src 'none' ; frame-src 'none' ; object-src 'none'".into(),
        )]);
        if cfg!(mainnet) {
            headers.insert(
                "Strict-Transport-Security",
                "max-age=31536000; includeSubDomains".into(),
            );
        }
        let root = path.next().unwrap_or_else(|| "".into());
        let mut body: Vec<u8> = vec![];
        let mut code = 200;
        if root == "" {
            body = format!("Total NFTs: {}", collection.total_supply())
                .into_bytes()
                .into();
        } else {
            if let Ok(num) = root.parse::<u128>() {
                // /:something
                if let Some(nft) = collection.tokens.get(&num) {
                    // /:nft
                    match nft.image {
                        Some(image) => {
                            body = image.as_slice().into();
                            headers.insert("Content-Type", "image/jpeg".into());
                        }
                        None => {
                            println!("The value is None");
                        }
                    }
                } else {
                    code = 404;
                    body = b"No such NFT"[..].into();
                }
            } else {
                code = 400;
                body = format!("Invalid NFT ID {}", root).into_bytes().into();
            }
        }
        call::reply((HttpResponse {
            status_code: code,
            headers,
            body: body.into(),
        },));
    });
}
