<template>
    <img :src="image">
</template>

<script setup>
import { onMounted, ref } from 'vue';

let image = ref()
let props = defineProps(["url"])
onMounted(async()=>{
    let base64 = await(await fetch(props.url,{
    })).text()
    image.value = base64
})
</script>