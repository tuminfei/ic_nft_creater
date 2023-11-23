mod types;
mod system;
mod stable;

#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}
