<script setup>
import { ref, computed } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { saveFault, updateFault, deleteFault } from '@/api/fault'

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
    ElMessage.error('加载故障列表失败')
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  if (!searchQuery.value) return list.value
  const q = searchQuery.value.toLowerCase()
  return list.value.filter(f =>
    (f.name && f.name.toLowerCase().includes(q)) ||
    (f.code && f.code.toLowerCase().includes(q)) ||
    (f.category && f.category.toLowerCase().includes(q))
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
const dialogTitle = ref('新增故障')
const editForm = ref({ id: null, code: '', name: '', description: '', severity: '', category: '', occurrenceTime: '', reportedBy: '' })

function openAdd() {
  dialogTitle.value = '新增故障'
  editForm.value = { id: null, code: '', name: '', description: '', severity: '', category: '', occurrenceTime: '', reportedBy: '' }
  dialogVisible.value = true
}

function openEdit(row) {
  dialogTitle.value = '编辑故障'
  editForm.value = { ...row }
  dialogVisible.value = true
}

async function handleSave() {
  try {
    if (editForm.value.id) {
      await updateFault(editForm.value)
    } else {
      await saveFault(editForm.value)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadList()
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除故障「${row.name}」吗？`, '提示', { type: 'warning' })
  await deleteFault(row.id)
  ElMessage.success('删除成功')
  loadList()
}

function severityClass(s) {
  if (s === '高' || s === 'critical') return 'high'
  if (s === '中' || s === 'medium') return 'medium'
  return 'low'
}

loadList()
</script>

<template>
  <div class="sub-page">
    <div class="page-header">
      <div class="page-title-area">
        <h2 class="page-title">故障管理</h2>
        <p class="page-desc">管理系统中的设备故障记录</p>
      </div>
      <el-button type="primary" @click="openAdd">
        <el-icon><Plus /></el-icon>新增故障
      </el-button>
    </div>

    <div class="search-bar">
      <el-input v-model="searchQuery" placeholder="搜索故障名称、编号或分类..." clearable @keyup.enter="handleSearch" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <div class="data-table">
      <el-table :data="paginated" v-loading="loading" style="width:100%">
        <el-table-column prop="code" label="故障编号" width="130" />
        <el-table-column prop="name" label="故障名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="severity" label="严重程度" width="100">
          <template #default="{ row }">
            <span class="severity-tag" :class="severityClass(row.severity)">{{ row.severity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="occurrenceTime" label="发生时间" width="160">
          <template #default="{ row }">{{ row.occurrenceTime ? row.occurrenceTime.replace('T', ' ').slice(0, 16) : '-' }}</template>
        </el-table-column>
        <el-table-column prop="reportedBy" label="报告人" width="100" />
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="故障编号"><el-input v-model="editForm.code" /></el-form-item>
        <el-form-item label="故障名称"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="editForm.category" /></el-form-item>
        <el-form-item label="严重程度"><el-input v-model="editForm.severity" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="editForm.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="报告人"><el-input v-model="editForm.reportedBy" /></el-form-item>
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
.severity-tag { padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; }
.severity-tag.high { background: rgba(239,68,68,0.1); color: var(--el-color-danger); }
.severity-tag.medium { background: rgba(245,158,11,0.1); color: #f59e0b; }
.severity-tag.low { background: rgba(34,197,94,0.1); color: var(--app-success); }
</style>
