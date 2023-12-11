use std::{borrow::Cow, collections::HashMap};

use crate::assets_stable::State;

pub const HTML: &str = include_str!("../../explore/index.html");
pub const CSS: &str = include_str!("../../explore/index.css");

pub fn explore<'a>(headers: &mut HashMap<&'a str, Cow<'a, str>>, state: &State) -> Vec<u8> {
    headers.insert("Content-Type", "text/html".into());

    let files = state.assets.files();
    let mut json = String::from("");
    json.push_str("[");
    json.push_str(
        &files
            .iter()
            .map(|file| {
                format!(
                    "{{path:\"{}\",size:{},headers:[{}],created:{},modified:{},hash:\"{}\"}}",
                    file.path,
                    file.size,
                    file.headers
                        .iter()
                        .map(|(key, value)| format!("{{key:\"{}\",value:\"{}\"}}", key, value))
                        .collect::<Vec<String>>()
                        .join(","),
                    file.created / 1000000,
                    file.modified / 1000000,
                    file.hash
                )
            })
            .collect::<Vec<String>>()
            .join(","),
    );
    json.push_str("]");

    HTML.replace("/* CSS */", CSS)
        .replace("const _files = [];", &format!("const _files = {};", json))[..]
        .into()
}
