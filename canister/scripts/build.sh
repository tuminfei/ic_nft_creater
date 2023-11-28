cargo build --release --target wasm32-unknown-unknown --package icrc7
ic-wasm target/wasm32-unknown-unknown/release/icrc7.wasm -o target/wasm32-unknown-unknown/release/icrc7.wasm shrink
gzip -f target/wasm32-unknown-unknown/release/icrc7.wasm > src/icrc7/wasm/icrc7.wasm.gz

cargo build --release --target wasm32-unknown-unknown --package icrc7_with_assets
ic-wasm target/wasm32-unknown-unknown/release/icrc7_with_assets.wasm -o target/wasm32-unknown-unknown/release/icrc7_with_assets.wasm shrink
cp target/wasm32-unknown-unknown/release/icrc7_with_assets.wasm src/icrc7_with_assets/wasm/icrc7_with_assets.wasm
gzip -f target/wasm32-unknown-unknown/release/icrc7_with_assets.wasm > src/icrc7_with_assets/wasm/icrc7_with_assets.wasm.gz


dfx deploy icrc7 --argument '(record {
  tx_window=24;
  permitted_drift=2;
  name="Space";
  symbol="Space";
  minting_authority=opt principal"3yyxm-t5fpe-v32em-ac6lr-xyort-wuscb-dvl4x-3wnwi-hqkyj-xortw-oqe";
  royalties=null;
  royalties_recipient=null;    
  description=opt "ICRC7 Standard Token";
  image=null;    
  supply_cap=null;    
})'

dfx canister call icrc7 icrc7_mint '(record{
  id=100;
  name="Icrc7 100";
  description=opt "100th token of the collection";
  image=null;
  to=record{
  owner=principal"3yyxm-t5fpe-v32em-ac6lr-xyort-wuscb-dvl4x-3wnwi-hqkyj-xortw-oqe";
  subaccount=null;
  };
})'

dfx deploy icrc7_with_assets --argument '(record {
  tx_window=24;
  permitted_drift=2;
  name="Space";
  symbol="Space";
  minting_authority=opt principal"3yyxm-t5fpe-v32em-ac6lr-xyort-wuscb-dvl4x-3wnwi-hqkyj-xortw-oqe";
  royalties=null;
  royalties_recipient=null;    
  description=opt "ICRC7 Standard Token";
  image=null;    
  supply_cap=null;  
})'

dfx deploy nft_factory_backend

dfx canister call nft_factory_backend create_icrc7_collection '(record{
  supply_cap=null;
  owner=principal"3yyxm-t5fpe-v32em-ac6lr-xyort-wuscb-dvl4x-3wnwi-hqkyj-xortw-oqe";
  name="Icrc7 100";
  description=opt "100th token of the collection";
  image=null;
  royalties_recipient=null;
  symbol="Icrc7";
  tx_window=24;
  permitted_drift=2;
})'

dfx canister call nft_factory_backend schedule_trigger