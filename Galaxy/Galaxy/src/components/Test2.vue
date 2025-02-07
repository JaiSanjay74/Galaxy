<template>
   <b></b>
   <b>{{ dt }}</b>
</template>
<script setup>
import { ref ,defineProps,onUpdated} from 'vue';

var props = defineProps(["tst","op"])

var dt = ref(props.op)
/*onUpdated(()=>{console.log("lo")
dt.value = props.op
   console.log(props.op)
})*/
</script>
<style scoped>

</style>