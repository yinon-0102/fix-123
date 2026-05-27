<script setup>
import { ref, shallowRef } from 'vue'
import BusinessFaults from './subPages/BusinessFaults.vue'
import BusinessSolutions from './subPages/BusinessSolutions.vue'
import BusinessCases from './subPages/BusinessCases.vue'

const activeTab = ref('faults')

const tabMap = {
  faults: shallowRef(BusinessFaults),
  solutions: shallowRef(BusinessSolutions),
  cases: shallowRef(BusinessCases),
}
</script>

<template>
  <div class="business-manage">
    <div class="business-tabs">
      <el-tabs v-model="activeTab" class="business-tabs-inner">
        <el-tab-pane label="故障管理" name="faults" />
        <el-tab-pane label="解决方案" name="solutions" />
        <el-tab-pane label="案例记录" name="cases" />
      </el-tabs>
    </div>
    <div class="tab-content">
      <component :is="tabMap[activeTab]" />
    </div>
  </div>
</template>

<style scoped>
.business-manage {
  max-width: 1200px;
  margin: 0 auto;
}

.business-tabs {
  margin-bottom: 24px;
}

.business-tabs-inner :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.business-tabs-inner :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

.business-tabs-inner :deep(.el-tabs__item) {
  font-size: 15px;
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  color: var(--plaza-text-muted);
}

.business-tabs-inner :deep(.el-tabs__item.is-active) {
  color: var(--plaza-accent);
  font-weight: 600;
}

.business-tabs-inner :deep(.el-tabs__active-bar) {
  background-color: var(--plaza-accent);
  height: 2px;
}

.business-tabs-inner :deep(.el-tabs__nav) {
  border: 1px solid var(--plaza-border);
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}

.business-tabs-inner :deep(.el-tabs__nav-wrap) {
  border-radius: 8px;
}

.tab-content {
  /* 子页面渲染区 */
}
</style>
