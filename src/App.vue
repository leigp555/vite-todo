<script >
import {ref} from "vue";
import HelloWorld from "./components/HelloWorld.vue"
export default {
  components: {HelloWorld},
  setup(){
    console.log("ok")
    const count=ref(1)
    const add=()=>{
      count.value+=1
    }
    return {add,count}
  }
}

</script>

<template>
  <div >{{count}}</div>
  <button @click="add">按钮</button>
  <HelloWorld/>
</template>

<style></style>
