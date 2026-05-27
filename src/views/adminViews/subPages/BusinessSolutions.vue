<script setup>
import { ref, computed } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { saveSolution, updateSolution, deleteSolution } from '@/api/solution'

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
    ElMessage.error('加载解决方案列表失败')
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  if (!searchQuery.value) return list.value
  const q = searchQuery.value.toLowerCase()
  return list.value.filter(s =>
    (s.title && s.title.toLowerCase().includes(q)) ||
    (s.code && s.code.toLowerCase().includes(q))
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
const dialogTitle = ref('新增解决方案')
const editForm = ref({ id: null, code: '', title: '', description: '', toolsRequired: '', estimatedTime: null, difficulty: '', verified: false })

function openAdd() {
  dialogTitle.value = '新增解决方案'
  editForm.value = { id: null, code: '', title: '', description: '', toolsRequired: '', estimatedTime: null, difficulty: '', verified: false }
  dialogVisible.value = true
}

function openEdit(row) {
  dialogTitle.value = '编辑解决方案'
  editForm.value = { ...row }
  dialogVisible.value = true
}

async function handleSave() {
  try {
    if (editForm.value.id) {
      await updateSolution(editForm.value)
    } else {
      await saveSolution(editForm.value)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadList()
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除解决方案「${row.title}」吗？`, '提示', { type: 'warning' })
  await deleteSolution(row.id)
  ElMessage.success('删除成功')
  loadList()
}

function verifiedClass(v) { return v ? 'verified' : 'unverified' }
function verifiedText(v) { return v ? '已验证' : '未验证' }

loadList()
</script>

<template>
  <div class="sub-page">
    <div class="page-header">
      <div class="page-title-area">
        <h2 class="page-title">解决方案</h2>
        <p class="page-desc">管理系统中的故障解决方案</p>
      </div>
      <el-button type="primary" @click="openAdd">
        <el-icon><Plus /></el-icon>新增解决方案
      </el-button>
    </div>

    <div class="search-bar">
      <el-input v-model="searchQuery" placeholder="搜索解决方案标题或编号..." clearable @keyup.enter="handleSearch" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <div class="data-table">
      <el-table :data="paginated" v-loading="loading" style="width:100%">
        <el-table-column prop="code" label="方案编号" width="130" />
        <el-table-column prop="title" label="方案标题" min-width="200" />
        <el-table-column prop="difficulty" label="难度" width="80" />
        <el-table-column prop="estimatedTime" label="预计时间(分钟)" width="130" />
        <el-table-column prop="toolsRequired" label="所需工具" min-width="150" show-overflow-tooltip />
        <el-table-column prop="verified" label="验证状态" width="100">
          <template #default="{ row }">
            <span class="verify-tag" :class="verifiedClass(row.verified)">{{ verifiedText(row.verified) }}</span>
          </template>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="方案编号"><el-input v-model="editForm.code" /></el-form-item>
        <el-form-item label="方案标题"><el-input v-model="editForm.title" /></el-form-item>
        <el-form-item label="难度"><el-input v-model="editForm.difficulty" /></el-form-item>
        <el-form-item label="预计时间"><el-input-number v-model="editForm.estimatedTime" :min="0" /> 分钟</el-form-item>
        <el-form-item label="所需工具"><el-input v-model="editForm.toolsRequired" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="editForm.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="已验证"><el-switch v-model="editForm.verified" /></el-form-item>
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
.verify-tag { padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; }
.verify-tag.verified { background: rgba(34,197,94,0.1); color: var(--app-success); }
.verify-tag.unverified { background: rgba(239,68,68,0.1); color: var(--el-color-danger); }
</style>
