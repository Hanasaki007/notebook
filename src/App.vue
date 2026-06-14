<script setup>
import { useRoute } from 'vue-router'
import TabBar from './components/TabBar.vue'

const route = useRoute()
</script>

<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <TabBar v-if="!route.meta.hideTabBar" />
  </div>
</template>

<style>
@import './styles/global.css';
</style>
