<script setup>
import { ref, computed } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { saveCaseRecord, updateCaseRecord, deleteCaseRecord } from '@/api/caseRecord'

const loading = ref(false)
const list = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(15)

async function loadList() {
  loading.value = true
  try {
    // TODO: 后端补充 list 接口后替换
    list.value = []
  } catch (e) {
    ElMessage.error('加载案例列表失败')
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  if (!searchQuery.value) return list.value
  const q = searchQuery.value.toLowerCase()
  return list.value.filter(c =>
    (c.title && c.title.toLowerCase().includes(q)) ||
    (c.caseNumber && c.caseNumber.toLowerCase().includes(q))
  )
})

const paginated = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

function handleSearch() {
  currentPage.value = 1
  loadList()
}

const dialogVisible = ref(false)
const dialogTitle = ref('新增案例')
const editForm = ref({
  id: null, caseNumber: '', title: '', summary: '', diagnosis: '',
  resolution: '', result: '', downtime: null, cost: null, recorder: '', reviewedBy: '', tags: ''
})

function openAdd() {
  dialogTitle.value = '新增案例'
  editForm.value = { id: null, caseNumber: '', title: '', summary: '', diagnosis: '', resolution: '', result: '', downtime: null, cost: null, recorder: '', reviewedBy: '', tags: '' }
  dialogVisible.value = true
}

function openEdit(row) {
  dialogTitle.value = '编辑案例'
  editForm.value = { ...row }
  dialogVisible.value = true
}

async function handleSave() {
  try {
    if (editForm.value.id) {
      await updateCaseRecord(editForm.value)
    } else {
      await saveCaseRecord(editForm.value)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadList()
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除案例「${row.title}」吗？`, '提示', { type: 'warning' })
  await deleteCaseRecord(row.id)
  ElMessage.success('删除成功')
  loadList()
}

loadList()
</script>

<template>
  <div class="sub-page">
    <div class="page-header">
      <div class="page-title-area">
        <h2 class="page-title">案例记录</h2>
        <p class="page-desc">管理系统中的检修案例记录</p>
      </div>
      <el-button type="primary" @click="openAdd">
        <el-icon><Plus /></el-icon>新增案例
      </el-button>
    </div>

    <div class="search-bar">
      <el-input v-model="searchQuery" placeholder="搜索案例标题或编号..." clearable @keyup.enter="handleSearch" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <div class="data-table">
      <el-table :data="paginated" v-loading="loading" style="width:100%">
        <el-table-column prop="caseNumber" label="案例编号" width="130" />
        <el-table-column prop="title" label="案例标题" min-width="200" />
        <el-table-column prop="result" label="结果" width="100" show-overflow-tooltip />
        <el-table-column prop="downtime" label="停机时间(分钟)" width="130" />
        <el-table-column prop="cost" label="成本(元)" width="100">
          <template #default="{ row }">{{ row.cost != null ? row.cost.toFixed(2) : '-' }}</template>
        </el-table-column>
        <el-table-column prop="recorder" label="记录人" width="100" />
        <el-table-column prop="reviewedBy" label="审核人" width="100" />
        <el-table-column prop="recordedAt" label="记录时间" width="160">
          <template #default="{ row }">{{ row.recordedAt ? row.recordedAt.split('T')[0] : '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="openEdit(row)"><el-icon><Edit /></el-icon></el-button>
            <el-button size="small" text type="danger" @click="handleDelete(row)"><el-icon><Delete /></el-icon></el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination background layout="prev, pager, next" :page-size="pageSize" :total="filtered.length" :current-page="currentPage" @current-change="p => currentPage = p" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="案例编号"><el-input v-model="editForm.caseNumber" /></el-form-item>
        <el-form-item label="案例标题"><el-input v-model="editForm.title" /></el-form-item>
        <el-form-item label="摘要"><el-input v-model="editForm.summary" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="诊断"><el-input v-model="editForm.diagnosis" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="解决方案"><el-input v-model="editForm.resolution" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="结果"><el-input v-model="editForm.result" /></el-form-item>
        <el-form-item label="停机时间"><el-input-number v-model="editForm.downtime" :min="0" /> 分钟</el-form-item>
        <el-form-item label="成本"><el-input-number v-model="editForm.cost" :precision="2" :min="0" /> 元</el-form-item>
        <el-form-item label="记录人"><el-input v-model="editForm.recorder" /></el-form-item>
        <el-form-item label="审核人"><el-input v-model="editForm.reviewedBy" /></el-form-item>
        <el-form-item label="标签"><el-input v-model="editForm.tags" placeholder="用逗号分隔" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.sub-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--plaza-text); margin-bottom: 4px; }
.page-desc { font-size: 14px; color: var(--plaza-text-muted); }
.search-bar { display: flex; gap: 12px; margin-bottom: 20px; }
.search-bar .el-input { max-width: 300px; }
.data-table { background: var(--plaza-bg-card); border: 1px solid var(--plaza-border); border-radius: 14px; padding: 20px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
