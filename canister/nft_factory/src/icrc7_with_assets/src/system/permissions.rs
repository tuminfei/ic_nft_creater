use ic_canister_kit::types::UserId;

use crate::assets_stable::{with_mut_state, with_state, is_admin, PERMISSION_ADMIN};

// 增加管理员
#[ic_cdk::update(name = "permission_set_admin", guard = "is_admin")] // ! 该方法须检查权限
#[candid::candid_method(update, rename = "permission_set_admin")]
fn permission_set_admin(user_id: UserId) {
    with_mut_state(|s| s.permissions.insert(PERMISSION_ADMIN, user_id));
}

// 移除管理员
#[ic_cdk::update(name = "permission_remove_admin", guard = "is_admin")] // ! 该方法须检查权限
#[candid::candid_method(update, rename = "permission_remove_admin")]
fn permission_remove_admin(user_id: UserId) {
    with_mut_state(|s| s.permissions.remove(PERMISSION_ADMIN, &user_id));
}

// 获取所有管理员
#[ic_cdk::query(name = "permission_get_admins")]
#[candid::candid_method(query, rename = "permission_get_admins")]
fn permission_get_admins() -> Vec<UserId> {
    with_state(|s| {
        let users = s.permissions.users(PERMISSION_ADMIN);
        if users.is_none() {
            return vec![]; // 没有这个权限
        }
        users.unwrap().iter().cloned().collect()
    })
}

// 查询某个地址是不是管理员
#[ic_cdk::query(name = "permission_is_admin")]
#[candid::candid_method(query, rename = "permission_is_admin")]
fn permission_is_admin(user_id: UserId) -> bool {
    with_state(|s| s.permissions.has_permission(PERMISSION_ADMIN, user_id))
}
