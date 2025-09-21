<template>
  <div class="info-panel">
    <div class="panel-item">
      <span class="label">{{ label }}:</span>
      <span class="value">{{ value }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfoPanel',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      default: ''
    }
  }
}
</script>

<style scoped>
info-panel {
  border: 1px solid #f3ebeb;
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
  background: #c42828;
}

.panel-item {
  display: flex;
  gap: 10px;
  padding-top: 3px;
  padding-bottom: 3px;
}

.label {
  font-weight: bold;
  color: #f0eaea;
}

.value {
  color: #eed7d7;
}
</style>