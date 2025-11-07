<template>
  <div class="content-mask"></div>
</template>

<style scoped>
.content-mask {
  position: absolute;
  top: 0;
  left: 10px;
  width: calc(100% - 20px);
  height: 100%;
  background: rgba(250, 250, 250, 0.4);
  pointer-events: none; /* Сама маска не блокирует */
  z-index: 10;
  border-radius: 8px;
}

/* Блокируем только определенные элементы внутри карточки */
.content-mask ~ * {
  pointer-events: none;
}

/* Но разрешаем определенным элементам */
.content-mask ~ .button,
.content-mask ~ .action-element {
  pointer-events: all;
}
</style>