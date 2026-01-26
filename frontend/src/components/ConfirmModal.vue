<template>
  <div class="modal-backdrop" @click.self="onBackdrop">
    <div class="modal modal-sm">
      <h3 class="modal-title">{{ title }}</h3>
      <p class="modal-text">{{ message }}</p>
      <div class="modal-actions">
        <button v-if="showCancel" class="button secondary" @click="$emit('cancel')">{{ cancelText }}</button>
        <button class="button" @click="$emit('confirm')">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["confirm", "cancel"]);

const props = defineProps({
  title: { type: String, default: "确认操作" },
  message: { type: String, required: true },
  showCancel: { type: Boolean, default: true },
  confirmText: { type: String, default: "确认" },
  cancelText: { type: String, default: "取消" }
});

function onBackdrop() {
  if (props.showCancel) {
    return emit("cancel");
  }
  return null;
}
</script>
