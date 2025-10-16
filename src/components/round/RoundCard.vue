<template>
  <div :class="['card', {
        'ready-status': roundCard.judgeRoundStatus === 'READY',
        'not-ready-status': roundCard.judgeRoundStatus === 'NOT_READY'}]" 
      @click="() => navigateToParticipants(roundCard.milestone.id, roundCard.id)">
    <div class="card-header">
      <h4>{{ store.getCard(roundCard.id).name }}</h4>
    </div>
    <div class="card-content">
        <Field label="Состояние" :value= "store.getCard(roundCard.id).stateDisplayValue"/>
        <Field label="Статус" :value= "store.getCard(roundCard.id).roundResultStatusDisplayValue"/>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>

import Field from '../common/Field.vue'
import { useRoundCardStore } from './RoundCardStore.js'
import { roundStateEnum, roundResultStatusEnum } from '../../utils/EnumLocalizator.js'
import { useRouter } from 'vue-router'

export default {
  name: 'RoundCardComponent',
  components: {
    Field
  },
  props: {
    roundCard: {
      type: Object,
      default: () => ({})
    },
  },

  setup(props) {
    const store = useRoundCardStore()
    const card = props.roundCard;
    store.setCard(card.id, Object.assign({
      stateDisplayValue: roundStateEnum[card.state],
      roundResultStatusDisplayValue: roundResultStatusEnum[card.judgeRoundStatus]
    }, card));

    const router = useRouter();

    const navigateToParticipants = (milestoneId, roundId) => {
      router.push({
          name: 'Participants',
          params: { 
            milestoneId: milestoneId,
            roundId: roundId
          }
        })
    }

    return {
        store,
        card,
        navigateToParticipants,
    }
  }
}
</script>

<style scoped>

  .ready-status {
    background: #6bc94e8a;
  }

  .not-ready-status {
    background: #ebe72d7d;
  }
</style>