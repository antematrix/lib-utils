import { gpu } from "./GPUDevice.js";

const L = console.log;
L("hello");
L(gpu);
await gpu.on();
L(gpu);
