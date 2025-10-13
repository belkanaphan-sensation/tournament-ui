<template>
  <div class="mask"></div>
</template>

<style scoped>
.mask {
  position: absolute;
  top: 0;
  left: 10px;
  width: calc(100% - 20px);
  height: 100%;
  background: rgba(128, 128, 128, 0.3);
  pointer-events: all;
  z-index: 10;
  border-radius: 8px;
}
</style>