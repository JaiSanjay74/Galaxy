<template>
<b @click="dt = 'p'">run</b>
<b @click="()=>{dt = 'p';op='suc';}" >run2</b>
<Test2 :tst="dt" :op="op"/>
</template>
<script setup>
import Test2 from "./Test2.vue"
import { onUpdated, ref } from 'vue';

var dt = ref(6)
var op = ref(0)
onUpdated(()=>{console.log("mo")})
</script>
<style scoped>

</style>