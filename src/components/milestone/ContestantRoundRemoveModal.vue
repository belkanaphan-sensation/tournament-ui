<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-backdrop" @click="handleCancel"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Удалить из раунда</h3>
        <button class="modal-close" type="button" @click="handleCancel">×</button>
      </div>

      <div class="modal-body">
        <p class="confirm-text">
          Вы уверены что хотите удалить участника
          <strong>{{ participantLabel }}</strong>
          из раунда
          <strong>{{ roundName }}</strong>?
        </p>
      </div>

      <div class="modal-footer">
        <button class="modal-btn cancel-btn" type="button" @click="handleCancel">Отмена</button>
        <button class="modal-btn confirm-btn" type="button" @click="handleConfirm">Да</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContestantRoundRemoveModal',

  props: {
    show: {
      type: Boolean,
      required: true
    },
    participantLabel: {
      type: String,
      default: ''
    },
    roundName: {
      type: String,
      default: ''
    }
  },

  emits: ['cancel', 'confirm'],

  methods: {
    handleCancel() {
      this.$emit('cancel')
    },

    handleConfirm() {
      this.$emit('confirm')
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

.confirm-text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
}

.confirm-text strong {
  color: #111;
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
  background: #dc3545;
  color: white;
}

.confirm-btn:hover {
  background: #c82333;
}
</style>
