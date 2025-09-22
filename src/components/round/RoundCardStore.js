import { defineStore } from 'pinia'

export const createRoundCardStore = (id) => {
    return defineStore(`roundCard-${id}`, {

    state: () => ({
        id: undefined,
        name: undefined,
        description: undefined,
        status: undefined,
    }),

    actions: {
        setId(id) {
            this.id = id;
        },
        setName(name) {
            this.name = name ?? '';
        },
        setDescription(description) {
            this.description = description ?? '';
        },
        setStatus(status) {
            this.status = status ?? '';
        },
    }
}) ()
}