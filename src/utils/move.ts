import { WasmFs } from '@wasmer/wasmfs'
import { Git, MovePackage } from '@starcoin/move-js'

export const startWasiTask = async () => {
    const wasmfs = new WasmFs()
    const git = new Git(wasmfs)

    await git.download("/data/starcoin-framework.zip", "/workspace/starcoin-framework")
    await git.download("/data/my-counter.zip", "/workspace/my-counter")

    const mp = new MovePackage(wasmfs, {
      packagePath: "/workspace/my-counter",
      test: false,
      alias: new Map([
        ["StarcoinFramework", "/workspace/starcoin-framework"]
      ]),
      initFunction: "0xABCDE::MyCounter::init"
    })
    
    await mp.build()

    const blobBuf = wasmfs.fs.readFileSync("/workspace/my-counter/target/starcoin/release/package.blob")
    const base64Data = blobBuf.toString("base64")
    console.log("my-counter blob:", base64Data)
}