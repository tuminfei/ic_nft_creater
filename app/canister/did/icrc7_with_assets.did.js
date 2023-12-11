const idlFactory = ({ IDL }) => {
  const QueryFile = IDL.Record({
    'created': IDL.Nat64,
    'modified': IDL.Nat64,
    'hash': IDL.Text,
    'path': IDL.Text,
    'size': IDL.Nat64,
    'headers': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });
  const UploadingArg = IDL.Record({
    'chunk': IDL.Vec(IDL.Nat8),
    'path': IDL.Text,
    'size': IDL.Nat64,
    'headers': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'index': IDL.Nat32,
    'chunk_size': IDL.Nat64,
  });
  const StatusRequest = IDL.Record({
    'memory_size': IDL.Bool,
    'cycles': IDL.Bool,
    'heap_memory_size': IDL.Bool,
  });
  const StatusResponse = IDL.Record({
    'memory_size': IDL.Opt(IDL.Nat64),
    'cycles': IDL.Opt(IDL.Nat64),
    'heap_memory_size': IDL.Opt(IDL.Nat64),
  });
  const CustomHttpRequest = IDL.Record({
    'url': IDL.Text,
    'method': IDL.Text,
    'body': IDL.Vec(IDL.Nat8),
    'headers': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });
  const StreamingCallbackToken = IDL.Record({
    'end': IDL.Nat64,
    'path': IDL.Text,
    'headers': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'start': IDL.Nat64,
    'params': IDL.Text,
  });
  const StreamingCallbackHttpResponse = IDL.Record({
    'token': IDL.Opt(StreamingCallbackToken),
    'body': IDL.Vec(IDL.Nat8),
  });
  const StreamingStrategy = IDL.Variant({
    'Callback': IDL.Record({
      'token': StreamingCallbackToken,
      'callback': IDL.Func(
        [StreamingCallbackToken],
        [StreamingCallbackHttpResponse],
        ['query'],
      ),
    }),
  });
  const CustomHttpResponse = IDL.Record({
    'body': IDL.Vec(IDL.Nat8),
    'headers': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'streaming_strategy': IDL.Opt(StreamingStrategy),
    'status_code': IDL.Nat16,
  });
  const Account = IDL.Record({
    'owner': IDL.Principal,
    'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const ApprovalArgs = IDL.Record({
    'memo': IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
    'token_ids': IDL.Opt(IDL.Vec(IDL.Nat)),
    'created_at_time': IDL.Opt(IDL.Nat64),
    'expires_at': IDL.Opt(IDL.Nat64),
    'spender': Account,
  });
  const ApprovalError = IDL.Variant({
    'GenericError': IDL.Record({ 'msg': IDL.Text, 'error_code': IDL.Nat }),
    'TemporaryUnavailable': IDL.Null,
    'Unauthorized': IDL.Record({ 'tokens_ids': IDL.Vec(IDL.Nat) }),
    'TooOld': IDL.Null,
  });
  const Result = IDL.Variant({ 'Ok': IDL.Nat, 'Err': ApprovalError });
  const CollectionMetadata = IDL.Record({
    'icrc7_supply_cap': IDL.Opt(IDL.Nat),
    'icrc7_description': IDL.Opt(IDL.Text),
    'icrc7_total_supply': IDL.Nat,
    'icrc7_royalty_recipient': IDL.Opt(Account),
    'icrc7_royalties': IDL.Opt(IDL.Nat16),
    'icrc7_symbol': IDL.Text,
    'icrc7_image': IDL.Opt(IDL.Text),
    'icrc7_name': IDL.Text,
  });
  const MetadataValue = IDL.Variant({
    'Int': IDL.Int,
    'Nat': IDL.Nat,
    'Blob': IDL.Vec(IDL.Nat8),
    'Text': IDL.Text,
  });
  const MintArgs = IDL.Record({
    'id': IDL.Nat,
    'to': Account,
    'name': IDL.Text,
    'description': IDL.Opt(IDL.Text),
    'image': IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Standard = IDL.Record({ 'url': IDL.Text, 'name': IDL.Text });
  const TransferArgs = IDL.Record({
    'to': Account,
    'spender_subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from': Account,
    'memo': IDL.Opt(IDL.Vec(IDL.Nat8)),
    'is_atomic': IDL.Opt(IDL.Bool),
    'token_ids': IDL.Vec(IDL.Nat),
    'created_at_time': IDL.Opt(IDL.Nat64),
  });
  const TransferError = IDL.Variant({
    'GenericError': IDL.Record({ 'msg': IDL.Text, 'error_code': IDL.Nat }),
    'TemporaryUnavailable': IDL.Null,
    'Duplicate': IDL.Record({ 'duplicate_of': IDL.Nat }),
    'Unauthorized': IDL.Record({ 'tokens_ids': IDL.Vec(IDL.Nat) }),
    'CreatedInFuture': IDL.Record({ 'ledger_time': IDL.Nat64 }),
    'TooOld': IDL.Null,
  });
  const Result_1 = IDL.Variant({ 'Ok': IDL.Nat, 'Err': TransferError });
  const MaintainingReason = IDL.Record({
    'created': IDL.Nat64,
    'message': IDL.Text,
  });
  return IDL.Service({
    'assets_delete': IDL.Func([IDL.Vec(IDL.Text)], [], []),
    'assets_download': IDL.Func([IDL.Text], [IDL.Vec(IDL.Nat8)], ['query']),
    'assets_download_by': IDL.Func(
      [IDL.Text, IDL.Nat64, IDL.Nat64],
      [IDL.Vec(IDL.Nat8)],
      ['query'],
    ),
    'assets_files': IDL.Func([], [IDL.Vec(QueryFile)], ['query']),
    'assets_upload': IDL.Func([IDL.Vec(UploadingArg)], [], []),
    'get_status': IDL.Func([StatusRequest], [StatusResponse], ['query']),
    'http_request': IDL.Func(
      [CustomHttpRequest],
      [CustomHttpResponse],
      ['query'],
    ),
    'icrc7_approve': IDL.Func([ApprovalArgs], [Result], []),
    'icrc7_balance_of': IDL.Func([Account], [IDL.Nat], ['query']),
    'icrc7_collection_metadata': IDL.Func([], [CollectionMetadata], ['query']),
    'icrc7_description': IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'icrc7_image': IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'icrc7_metadata': IDL.Func(
      [IDL.Nat],
      [IDL.Vec(IDL.Tuple(IDL.Text, MetadataValue))],
      ['query'],
    ),
    'icrc7_mint': IDL.Func([MintArgs], [IDL.Nat], []),
    'icrc7_name': IDL.Func([], [IDL.Text], ['query']),
    'icrc7_owner_of': IDL.Func([IDL.Nat], [Account], ['query']),
    'icrc7_royalties': IDL.Func([], [IDL.Opt(IDL.Nat16)], ['query']),
    'icrc7_royalty_recipient': IDL.Func([], [IDL.Opt(Account)], ['query']),
    'icrc7_supply_cap': IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    'icrc7_supported_standards': IDL.Func([], [IDL.Vec(Standard)], ['query']),
    'icrc7_symbol': IDL.Func([], [IDL.Text], ['query']),
    'icrc7_tokens_ids': IDL.Func([], [IDL.Vec(IDL.Nat)], ['query']),
    'icrc7_tokens_of': IDL.Func([Account], [IDL.Vec(IDL.Nat)], ['query']),
    'icrc7_total_supply': IDL.Func([], [IDL.Nat], ['query']),
    'icrc7_transfer': IDL.Func([TransferArgs], [Result_1], []),
    'maintainable_is_maintaining': IDL.Func([], [IDL.Bool], ['query']),
    'maintainable_set_maintaining': IDL.Func(
      [IDL.Opt(MaintainingReason)],
      [],
      [],
    ),
    'permission_get_admins': IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'permission_is_admin': IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'permission_remove_admin': IDL.Func([IDL.Principal], [], []),
    'permission_set_admin': IDL.Func([IDL.Principal], [], []),
  });
};
module.exports = { idlFactory };
