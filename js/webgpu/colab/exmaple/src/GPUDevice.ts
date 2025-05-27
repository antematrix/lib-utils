import { create, globals } from "webgpu";

interface Ready {
    (): () => Promise<GPUDevice | undefined>;
    device: GPUDevice;
}

const gpu: {
    _device: GPUDevice | undefined | null;
    on: () => Promise<GPUDevice | null | undefined>;
    off: () => void;
} = { _device: null } as any;

const on = async () => {
    if (gpu._device) return gpu._device;

    Object.assign(globalThis, globals);
    Object.defineProperty(globalThis, "navigator", {
        value: { gpu: create([]) },
        writable: true,
        configurable: true,
    });

    return globalThis.navigator.gpu
        ?.requestAdapter()
        .then(async (adapter) => {
            const hasShaderF16 = adapter?.features.has("shader-f16");
            console.log("[GPU-init] hasShaderF16", hasShaderF16);
            const device = await adapter?.requestDevice({
                requiredFeatures: hasShaderF16 ? ["shader-f16"] : [],
            });
            gpu._device = device;
            return device;
        })
        .catch((e) => {
            console.error("WebGPU not supported", e);
            return null;
        });
};

const off = () => {
    Object.assign(globalThis, {
        navigator: {},
    });
    gpu._device = null;
};

gpu.on = on;
gpu.off = off;

export { gpu };
