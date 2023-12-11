use std::cell::{RefCell, RefMut};

use ic_canister_kit::{
    identity::caller,
    types::{Initial, Maintainable, MaintainableState, Permissions, PermissionsState, Stable},
};

use crate::assets::types::{CoreAssets, CoreAssetsState, UploadingAssets, UploadingAssetsState};

pub const PERMISSION_ADMIN: &str = "admin";

#[derive(Debug, Default)]
pub struct State {
    pub permissions: Permissions,
    pub maintainable: Maintainable,
    pub assets: CoreAssets,
    pub uploading: UploadingAssets,
}

impl Initial for State {
    fn init(&mut self) {
        self.permissions.insert(PERMISSION_ADMIN, caller());
    }
}

type RestoreState = (
    PermissionsState,
    MaintainableState,
    CoreAssetsState,
    UploadingAssetsState,
);
type StoreState = RestoreState;

impl Stable<StoreState, RestoreState> for State {
    fn store(&mut self) -> StoreState {
        (
            self.permissions.store(),
            self.maintainable.store(),
            self.assets.store(),
            self.uploading.store(),
        )
    }

    fn restore(&mut self, restore: RestoreState) {
        self.permissions.restore(restore.0);
        self.maintainable.restore(restore.1);
        self.assets.restore(restore.2);
        self.uploading.restore(restore.3);
    }
}

thread_local! {
    pub static STATE: RefCell<State> = RefCell::default();
}

pub fn post_upgrade() {
    STATE.with(|state_ref| {
        let mut state: RefMut<dyn Stable<StoreState, RestoreState>> = state_ref.borrow_mut();
        ic_canister_kit::stable::post_upgrade(&mut state);
    });
}

pub fn pre_upgrade() {
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
