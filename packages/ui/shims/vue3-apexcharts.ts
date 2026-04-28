import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'ApexChartsShim',
  setup() {
    return () => h('div');
  },
});
