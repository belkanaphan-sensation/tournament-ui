import { defineStore } from 'pinia'

export const createFieldStore = (id) => {
    return defineStore(`field-${id}`, {

    state: () => ({
        // label: undefined,
        value: undefined,
    }),

    actions: {
        // setLabel(label) {
        //     this.label = label;
        // },
        setValue(value) {
            this.value = value;
        }
    }
}) ()
}