use std::cell::{RefCell, RefMut};

use crate::types::{StableCanisters, StableCanistersState};
use ic_canister_kit::{
    identity::caller,
    types::{Initial, Maintainable, MaintainableState, Permissions, PermissionsState, Stable},
};

pub const PERMISSION_ADMIN: &str = "admin";

#[derive(Debug, Default)]
pub struct State {
    pub permissions: Permissions,
    pub maintainable: Maintainable,
    pub next_canister_id: u64,
    pub canisters: StableCanisters,
}

impl Initial for State {
    fn init(&mut self) {
        self.permissions.insert(PERMISSION_ADMIN, caller());
    }
}

type RestoreState = (
    PermissionsState,
    MaintainableState,
    u64,
    StableCanistersState,
);
type StoreState = RestoreState;

impl Stable<StoreState, RestoreState> for State {
    fn store(&mut self) -> StoreState {
        (
            self.permissions.store(),
            self.maintainable.store(),
            self.next_canister_id,
            self.canisters.store(),
        )
    }

    fn restore(&mut self, restore: RestoreState) {
        self.permissions.restore(restore.0);
        self.maintainable.restore(restore.1);
    }
}

thread_local! {
    static STATE: RefCell<State> = RefCell::default();
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    STATE.with(|state_ref| {
        let mut state: RefMut<dyn Stable<StoreState, RestoreState>> = state_ref.borrow_mut();
        ic_canister_kit::stable::post_upgrade(&mut state);
    });
}

#[ic_cdk::pre_upgrade]
fn pre_upgrade() {
    STATE.with(|state_ref| {
        let mut state: RefMut<dyn Stable<StoreState, RestoreState>> = state_ref.borrow_mut();
        ic_canister_kit::stable::pre_upgrade(&mut state);
    });
}

pub fn with_state<F, R>(callback: F) -> R
where
    F: FnOnce(&State) -> R,
{
    STATE.with(|_state| {
        let state = _state.borrow();
        callback(&state)
    })
}

pub fn with_mut_state<F, R>(callback: F) -> R
where
    F: FnOnce(&mut State) -> R,
{
    STATE.with(|_state| {
        let mut state = _state.borrow_mut();
        callback(&mut state)
    })
}

#[ic_cdk::init]
fn initial() {
    with_mut_state(|s| s.init())
}

pub fn is_admin() -> Result<(), String> {
    let caller = caller();
    with_state(|s| {
        if s.permissions.has_permission(PERMISSION_ADMIN, caller) {
            return Ok(());
        }
        return Err(format!("{} is not admin", caller.to_text()));
    })
}

pub fn must_be_running() {
    with_state(|s| s.maintainable.must_be_running())
}
