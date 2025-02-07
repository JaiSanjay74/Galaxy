<template>
    <img :src="image">
</template>

<script setup>
import { onMounted, onUpdated, ref } from 'vue';

let image = ref()
let props = defineProps(["url"])
onMounted(async()=>{
    let base64 = await(await fetch(props.url
    )).text()
    image.value = base64

    console.log(base64)
})

onUpdated(async()=>{
    let base64 = await(await fetch(props.url
    )).text()
    image.value = base64

    console.log(base64)
})
</script>