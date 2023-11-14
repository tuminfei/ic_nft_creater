cargo build --release --target wasm32-unknown-unknown --package icrc7
ic-wasm target/wasm32-unknown-unknown/release/icrc7.wasm -o target/wasm32-unknown-unknown/release/icrc7.wasm shrink
gzip -f target/wasm32-unknown-unknown/release/icrc7.wasm


dfx deploy icrc7
--argument '(record {
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