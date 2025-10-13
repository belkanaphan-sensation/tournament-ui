import { defineStore } from 'pinia'

export const useOccasionCardStore = defineStore(`occasionCard`, {
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

    persist: {
        key: 'occasion-card-store',
        storage: localStorage,
        serializer: {
            serialize: (state) => {
                // Преобразуем Map в массив для сериализации
                const cardsArray = Array.from(state.cards.entries())
                return JSON.stringify({ cards: cardsArray })
            },
            deserialize: (str) => {
                const parsed = JSON.parse(str)
                // Восстанавливаем Map из массива
                const cardsMap = new Map(parsed.cards)
                return { cards: cardsMap }
            }
        }
    }
});