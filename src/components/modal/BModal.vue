<template>
  <div class="modal fade" ref="modalElement" aria-hidden="true" aria-labelledby="{{modalId}}" tabindex="-1">
    <div class="modal-dialog" :class="{ 'modal-lg': !(small ?? false), 'modal-fullscreen-md-down': !(small ?? false) }">
      <div class="modal-content rounded-md">
        <Loader :state="loading">
          <div class="modal-header py-2 px-3 bg-main rounded-md-top text-white" v-if="title">
            <h5 class="modal-title" id="{{modalId}}">{{ title }}</h5>
            <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div class="modal-footer" v-if="buttons.length > 0">
            <button class="btn" type="button"
                    :class="btn.classes"
                    @click="onButton(btn)"
                    v-for="btn in buttons"
                    :disabled="(btn.processing ?? false) || (btn.disabled ?? false)">
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" v-show="btn.processing"></span>
              {{ btn.text }}
            </button>
          </div>
        </Loader>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Modal} from "bootstrap";
import {ref, watch} from "vue";
import { v4 as uuid } from "uuid";
import {isPresent, OperationState, Optional} from "@/utils/core-utils";
import { ModalInstance } from "./modal-types";
import {Subject} from "rxjs";
import Loader from "@/components/loader/Loader.vue";

const props = withDefaults(defineProps<{
  title?: string;
  buttons?: ModalButton[];
  loading?: OperationState,
  small?: boolean
}>(), {
  buttons: () => [{ result: 'ok', text: 'OK', classes: 'btn-primary' }],
  loading: () => OperationState.Unknown
});

watch(
  () => props.loading,
  (value) => loading.value = value
);

const emit = defineEmits<{
  (e: 'shown'): void,
  (e: 'show'): void,
  (e: 'hidden', result?: string): void,
  (e: 'result:ok'): void,
  (e: 'result:yes'): void,
  (e: 'result:no'): void,
  (e: 'result:cancel'): void,
  (e: 'result:close'): void,
  (e: 'result:add'): void,
  (e: 'result:edit'): void,
  (e: 'result:delete'): void,
  (e: 'result:save'): void,
  (e: 'update:title', title: string): void
}>();

const modalId: string = 'modal_' + uuid().replace(/-/g, '');
const modalElement = ref<HTMLElement>();
const loading = ref(OperationState.Unknown);
const shown = new Subject<void>();
const hidden = new Subject<void>();
const visibility = ref(false);
let modal: Modal;
let _result: Optional<string> = null;

function show(): void {
  init();
  modal.show();
}

function init(): void {
  _result = undefined;
  modal = new Modal(modalElement.value, {
    backdrop: true,
    focus: true,
    keyboard: true
  });
  modalElement.value.addEventListener('show.bs.modal', onModalShow);
  modalElement.value.addEventListener('shown.bs.modal', onModalShown);
  modalElement.value.addEventListener('hidden.bs.modal', onModalHidden);
}

function onButton(button: ModalButton): void {
  if (isPresent(button.result)) _result = button.result;
  button.click?.();
  if (button.autoClose === false) return;
  modal.hide();
}

function close(result?: string): void {
  _result = result;
  modal.hide();
}

function onModalShown(): void {
  emit('shown');
  shown.next();
  visibility.value = true;
}

function onModalShow(): void {
  emit('show');
}

function onModalHidden(): void {
  modal.dispose();
  modalElement.value.removeEventListener('show.bs.modal', onModalShow);
  modalElement.value.removeEventListener('shown.bs.modal', onModalShown);
  modalElement.value.removeEventListener('hidden.bs.modal', onModalHidden);
  emitResult(_result);
  emit('hidden', _result);
  hidden.next();
  visibility.value = false;
}

function emitResult(result?: string): void {
  switch (result) {
    case 'ok':
      emit('result:ok');
      break;
    case 'yes':
      emit('result:yes');
      break;
    case 'no':
      emit('result:no');
      break;
    case 'cancel':
      emit('result:cancel');
      break;
    case 'close':
      emit('result:close');
      break;
    case 'add':
      emit('result:add');
      break;
    case 'edit':
      emit('result:edit');
      break;
    case 'delete':
      emit('result:delete');
      break;
    case 'save':
      emit('result:save');
      break;
  }
}

defineExpose<ModalInstance>({
  shown: shown,
  hidden: hidden,
  get visibility() { return visibility.value; },
  get loading() { return loading.value as OperationState; },
  set loading(value) { loading.value = value; },
  show: show,
  close: close
});

interface ModalButton {
  result?: string;
  text: string;
  classes?: string;
  autoClose?: boolean;
  click?: () => void;
  disabled?: boolean;
  processing?: boolean;
}

</script>
