<template>
    <div class="load">
        <div class="ld">
            <div></div>
        </div>
        <b>Please wait </b>
    </div>
</template>

<style scoped>
@import url("../res/RobotoFont.css");
.load{
    position: absolute;
    width: 100%;
    background-color: white;
    top: 0px;
    left: 0px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.load .ld{
    height: 40px;
    width: 20px;
    border-top-left-radius: 50px;
    border-bottom-left-radius:50px;
    border-top-width: 2px;
    border-left-width: 2px;
    border-left-style: solid;
    border-top-style: solid;
    border-color: rgb(166, 166, 166);
    animation-name: ld;
    animation-timing-function: ease-in-out;
    animation-duration:1s;
    animation-iteration-count: infinite;
    transform-origin: right;
    margin-right: 40px;
}
@keyframes ld {
    from{
        transform: rotateZ(0deg);
    }
    to{
        transform: rotateZ(360deg);
    }
}
.load b{
    font-size: 1.10rem;
    color: rgb(52, 52, 52);
    font-family: rob-bld;
}
</style>