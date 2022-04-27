<script >
import { ref } from 'vue'
export default {
  setup(){
    const count = ref(0)
    return {count}
  }
}
</script>

<template>
 <div>{{count}}</div>
  <div>我是hello world 页面</div>
</template>

<style scoped>

</style>
