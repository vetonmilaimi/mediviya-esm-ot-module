import { createGlobalStore, getGlobalStore } from "@openmrs/esm-framework";

export interface IOtGlobalStore {
  otfreeze?: boolean;
  setOtFreeze?: (freeze?: boolean) => void;
}

createGlobalStore<IOtGlobalStore>("ot-module-global-store", {
  otfreeze: true,
  setOtFreeze: (freeze) => {
    getGlobalStore<IOtGlobalStore>("ot-module-global-store").setState({
      otfreeze: freeze
    })
  }
})

export const otGlobalStore = getGlobalStore<IOtGlobalStore>("ot-module-global-store");