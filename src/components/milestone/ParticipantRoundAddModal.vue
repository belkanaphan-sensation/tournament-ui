<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-backdrop" @click="handleClose"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Добавить участника</h3>
        <button class="modal-close" type="button" @click="handleClose">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <Picker
            v-model="participant"
            label="Участник"
            required
            placeholder="Номер, фамилия или имя..."
            :search="searchParticipants"
            :error="participantError"
          />
        </div>

        <div class="form-group">
          <Picker
            v-model="toRound"
            label="В какой заход"
            required
            :search="searchToRounds"
            :error="toRoundError"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="modal-btn cancel-btn" type="button" @click="handleClose">Закрыть</button>
        <button
          class="modal-btn confirm-btn"
          type="button"
          :disabled="!canConfirm"
          @click="handleConfirm"
        >
          Готово
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Picker from '../common/Picker.vue'
import { roundApi } from '@/services/roundApi.js'
import { participantApi } from '@/services/participantApi.js'

export default {
  name: 'ParticipantRoundAddModal',

  components: {
    Picker
  },

  props: {
    show: {
      type: Boolean,
      required: true
    },
    milestoneId: {
      type: [Number, String],
      required: true
    }
  },

  emits: ['close', 'confirm'],

  data() {
    return {
      participant: null,
      toRound: null,
      participantError: '',
      toRoundError: ''
    }
  },

  computed: {
    canConfirm() {
      return !!(this.participant?.id && this.toRound?.id)
    }
  },

  watch: {
    show: {
      immediate: true,
      handler(visible) {
        if (visible) {
          this.resetState()
        }
      }
    }
  },

  methods: {
    resetState() {
      this.participant = null
      this.toRound = null
      this.participantError = ''
      this.toRoundError = ''
    },

    async searchParticipants(query) {
      return participantApi.searchRegisteredNotInMilestoneRounds({
        milestoneId: Number(this.milestoneId),
        name: query
      })
    },

    async searchToRounds(query) {
      return roundApi.searchRounds({
        milestoneId: Number(this.milestoneId),
        name: query
      })
    },

    handleClose() {
      this.$emit('close')
    },

    handleConfirm() {
      this.participantError = ''
      this.toRoundError = ''

      if (!this.participant?.id) {
        this.participantError = 'Выберите участника'
        return
      }
      if (!this.toRound?.id) {
        this.toRoundError = 'Выберите заход'
        return
      }

      this.$emit('confirm', {
        participantId: this.participant.id,
        toRoundId: this.toRound.id,
        participant: this.participant,
        toRound: this.toRound
      })
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 520px;
  max-width: 90vw;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: modal-appear 0.3s ease-out;
  position: relative;
  z-index: 1001;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 25px;
  border-top: 1px solid #e0e0e0;
}

.modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  min-width: 100px;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

.confirm-btn {
  background: #007bff;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: #0056b3;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
