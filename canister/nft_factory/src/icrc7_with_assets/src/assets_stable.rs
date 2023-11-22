use std::cell::{RefCell, RefMut};

use ic_canister_kit::{
    identity::caller,
    types::{Initial, Maintainable, MaintainableState, Permissions, PermissionsState, Stable},
};

use crate::assets::types::{CoreAssets, CoreAssetsState, UploadingAssets, UploadingAssetsState};

pub const PERMISSION_ADMIN: &str = "admin"; // 所有权限

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

// ================= 需要持久化的数据 ================

thread_local! {
    // 存储系统数据
    pub static STATE: RefCell<State> = RefCell::default();
}

// ==================== 升级时的恢复逻辑 ====================
pub fn post_upgrade() {
    STATE.with(|state_ref| {
        let mut state: RefMut<dyn Stable<StoreState, RestoreState>> = state_ref.borrow_mut();
        ic_canister_kit::stable::post_upgrade(&mut state);
    });
}

// ==================== 升级时的保存逻辑，下次升级执行 ====================
pub fn pre_upgrade() {
    STATE.with(|state_ref| {
        let mut state: RefMut<dyn Stable<StoreState, RestoreState>> = state_ref.borrow_mut();
        ic_canister_kit::stable::pre_upgrade(&mut state);
    });
}

// 工具方法
/// 外界需要系统状态时
pub fn with_state<F, R>(callback: F) -> R
where
    F: FnOnce(&State) -> R,
{
    STATE.with(|_state| {
        let state = _state.borrow(); // 取得不可变对象
        callback(&state)
    })
}

/// 需要可变系统状态时
pub fn with_mut_state<F, R>(callback: F) -> R
where
    F: FnOnce(&mut State) -> R,
{
    STATE.with(|_state| {
        let mut state = _state.borrow_mut(); // 取得不可变对象
        callback(&mut state)
    })
}

// 相关方法
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
