const idlFactory = ({ IDL }) => {
  const CanisterStatusType = IDL.Variant({
    'stopped' : IDL.Null,
    'stopping' : IDL.Null,
    'running' : IDL.Null,
  });
  const DefiniteCanisterSettings = IDL.Record({
    'freezing_threshold' : IDL.Nat,
    'controllers' : IDL.Vec(IDL.Principal),
    'memory_allocation' : IDL.Nat,
    'compute_allocation' : IDL.Nat,
  });
  const CanisterStatusResponse = IDL.Record({
    'status' : CanisterStatusType,
    'memory_size' : IDL.Nat,
    'cycles' : IDL.Nat,
    'settings' : DefiniteCanisterSettings,
    'idle_cycles_burned_per_day' : IDL.Nat,
    'module_hash' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const CreateArg = IDL.Record({
    'supply_cap' : IDL.Opt(IDL.Nat),
    'tx_window' : IDL.Nat16,
    'owner' : IDL.Principal,
    'permitted_drift' : IDL.Nat16,
    'name' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
    'royalties' : IDL.Opt(IDL.Nat16),
    'image' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'royalties_recipient' : IDL.Opt(Account),
    'symbol' : IDL.Text,
  });
  const CanisterInfo = IDL.Record({
    'memory_size' : IDL.Nat64,
    'cycles' : IDL.Nat64,
    'heap_memory_size' : IDL.Nat64,
  });
  const CanisterData = IDL.Record({
    'id' : IDL.Nat64,
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'canister_id' : IDL.Principal,
    'created_at' : IDL.Nat64,
    'canister_info' : CanisterInfo,
    'proxy' : IDL.Principal,
    'symbol' : IDL.Text,
  });
  const RejectionCode = IDL.Variant({
    'NoError' : IDL.Null,
    'CanisterError' : IDL.Null,
    'SysTransient' : IDL.Null,
    'DestinationInvalid' : IDL.Null,
    'Unknown' : IDL.Null,
    'SysFatal' : IDL.Null,
    'CanisterReject' : IDL.Null,
  });
  const Result = IDL.Variant({
    'Ok' : IDL.Null,
    'Err' : IDL.Tuple(RejectionCode, IDL.Text),
  });
  const MaintainingReason = IDL.Record({
    'created' : IDL.Nat64,
    'message' : IDL.Text,
  });
  const WalletReceiveResult = IDL.Record({ 'accepted' : IDL.Nat64 });
  return IDL.Service({
    '__get_candid_interface_tmp_hack' : IDL.Func([], [IDL.Text], ['query']),
    'canister_status' : IDL.Func([], [CanisterStatusResponse], []),
    'create_icrc7_collection' : IDL.Func([CreateArg], [IDL.Principal], []),
    'factory_canister_info' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(CanisterData)],
        ['query'],
      ),
    'factory_canister_list' : IDL.Func([], [IDL.Vec(CanisterData)], ['query']),
    'factory_canister_set_admin' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Principal],
        [],
      ),
    'factory_canister_set_cyclse' : IDL.Func([IDL.Principal], [Result], []),
    'maintainable_is_maintaining' : IDL.Func([], [IDL.Bool], ['query']),
    'maintainable_set_maintaining' : IDL.Func(
        [IDL.Opt(MaintainingReason)],
        [],
        [],
      ),
    'permission_get_admins' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'permission_is_admin' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'permission_remove_admin' : IDL.Func([IDL.Principal], [], []),
    'permission_set_admin' : IDL.Func([IDL.Principal], [], []),
    'schedule_start' : IDL.Func([IDL.Nat64], [], []),
    'schedule_stop' : IDL.Func([], [], []),
    'schedule_trigger' : IDL.Func([], [], []),
    'wallet_balance' : IDL.Func([], [IDL.Nat], ['query']),
    'wallet_receive' : IDL.Func([], [WalletReceiveResult], []),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
};
module.exports = { idlFactory };