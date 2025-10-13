import { defineStore } from 'pinia'

export const useActivityCardStore = defineStore(`activityCard`, {
    state: () => ({
        cards: new Map()
    }),

    getters: {
        getCard: (state) => (id) => state.cards.get(id),
        getAllCards: (state) => Array.from(state.cards.values())
    },

    actions: {
        setCard(id, data) {
            this.cards.set(id, { id, ...data })
        },
        updateCardName(id, name) {
            const card = this.cards.get(id)
            if (card) {
                card.name = name
            }
        },
        removeCard(id) {
            this.cards.delete(id)
        }
    },
});