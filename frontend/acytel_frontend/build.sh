#!/bin/bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env
cd src/audio-engine
cargo fix --lib -p audio-engine
wasm-pack build --target web
cd ../..
vite build