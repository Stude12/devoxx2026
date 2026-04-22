<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import * as Phaser from 'phaser';
import { EventBus } from './game/EventBus';
import StartGame from './game/main';

const scene = ref();
const game = ref();
const emit = defineEmits(['current-active-scene']);

onMounted(() => {
    game.value = StartGame('game-container');
    
    EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
        emit('current-active-scene', scene_instance);
        scene.value = scene_instance;
    });
});

onUnmounted(() => {
    if (game.value) {
        game.value.destroy(true);
        game.value = null;
    }
});

defineExpose({ scene, game });
</script>

<template>
    <div id="game-container"></div>
</template>

<style scoped>
#game-container {
    width: 1024px;
    height: 768px;
    position: relative;
}

:deep(canvas) {
    display: block;
}
</style>
