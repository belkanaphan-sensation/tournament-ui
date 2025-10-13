<template>
  <div class="card" @click="() => navigateToParticipants(roundCard.milestone.id, roundCard.id)">
    <div class="card-header">
      <h4>{{ store.getCard(roundCard.id).name }}</h4>
    </div>
    <div class="card-content">
        <Field label="Описание" :value= "store.getCard(roundCard.id).description"/>
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

    roundResultStatus: {
      type: String,
    }
  },

  setup(props) {
    const store = useRoundCardStore()
    const card = props.roundCard;
    const roundResultStatus = props.roundResultStatus;
    store.setCard(card.id, Object.assign({
      stateDisplayValue: roundStateEnum[card.state],
      roundResultStatus: roundResultStatus,
      roundResultStatusDisplayValue: roundResultStatusEnum[roundResultStatus]
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