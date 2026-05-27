<script setup>
import { ref, reactive } from 'vue'
import { Upload, Document, Check, Close, Plus, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// ===================== 文件上传 =====================
const uploadLoading = ref(false)
const uploadedFiles = ref([])
const dragOver = ref(false)

function handleDragOver(e) {
  dragOver.value = true
}

function handleDragLeave() {
  dragOver.value = false
}

function handleDrop(e) {
  dragOver.value = false
  const files = Array.from(e.dataTransfer.files)
  addFiles(files)
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files)
  addFiles(files)
  e.target.value = ''
}

function addFiles(files) {
  files.forEach(file => {
    const fileItem = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      status: 'pending', // pending | uploading | success | error
      file
    }
    uploadedFiles.value.push(fileItem)
  })
}

function removeFile(id) {
  const index = uploadedFiles.value.findIndex(f => f.id === id)
  if (index > -1) uploadedFiles.value.splice(index, 1)
}

async function uploadFiles() {
  if (uploadedFiles.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }

  uploadLoading.value = true

  // 模拟上传
  for (const item of uploadedFiles.value) {
    if (item.status === 'success') continue
    item.status = 'uploading'

    await new Promise(resolve => setTimeout(resolve, 1200))
    item.status = 'success'
  }

  uploadLoading.value = false
  ElMessage.success(`上传成功！${uploadedFiles.value.filter(f => f.status === 'success').length} 个文件已上传`)
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// ===================== 疑难杂症 =====================
const difficultForm = reactive({
  title: '',
  category: '',
  description: '',
  attachments: []
})
const difficultLoading = ref(false)
const difficultList = ref([
  {
    id: 1,
    title: '发电机启动无反应',
    category: '发动机故障',
    description: '设备型号XG-500，启动时无任何反应，检查电源正常，已尝试更换启动器无效',
    status: 'pending',
    submitTime: '2024-01-15',
    solution: ''
  },
  {
    id: 2,
    title: '液压系统压力异常波动',
    category: '液压系统',
    description: '液压站运行中压力在150-280bar之间频繁波动，滤网已清洗，油品刚更换',
    status: 'answered',
    submitTime: '2024-01-14',
    solution: '经现场检测，发现液压蓄能器气囊压力不足。补充氮气至设定值后恢复正常'
  }
])
const difficultDialogVisible = ref(false)
const isEditMode = ref(false)
const editingId = ref(null)
const selectedCategory = ref('')
const categories = ['发动机故障', '液压系统', '电气故障', '传动系统', '控制模块', '其他']

function openDifficultDialog() {
  isEditMode.value = false
  editingId.value = null
  difficultForm.title = ''
  difficultForm.category = ''
  difficultForm.description = ''
  difficultDialogVisible.value = true
}

function submitDifficult() {
  if (!difficultForm.title.trim()) {
    ElMessage.warning('请填写问题标题')
    return
  }
  if (!difficultForm.category) {
    ElMessage.warning('请选择问题分类')
    return
  }
  if (!difficultForm.description.trim()) {
    ElMessage.warning('请详细描述问题现象')
    return
  }

  difficultLoading.value = true
  setTimeout(() => {
    if (isEditMode.value) {
      const item = difficultList.value.find(f => f.id === editingId.value)
      if (item) {
        item.title = difficultForm.title
        item.category = difficultForm.category
        item.description = difficultForm.description
      }
    } else {
      difficultList.value.unshift({
        id: Date.now(),
        title: difficultForm.title,
        category: difficultForm.category,
        description: difficultForm.description,
        status: 'pending',
        submitTime: new Date().toISOString().split('T')[0],
        solution: ''
      })
    }
    difficultLoading.value = false
    difficultDialogVisible.value = false
    ElMessage.success(isEditMode.value ? '修改成功' : '提交成功，我们会尽快处理')
  }, 800)
}

function editDifficult(item) {
  isEditMode.value = true
  editingId.value = item.id
  difficultForm.title = item.title
  difficultForm.category = item.category
  difficultForm.description = item.description
  difficultDialogVisible.value = true
}

function deleteDifficult(id) {
  const index = difficultList.value.findIndex(f => f.id === id)
  if (index > -1) difficultList.value.splice(index, 1)
  ElMessage.info('已删除')
}

// 管理端回复
function openReplyDialog(item) {
  replyForm.solution = item.solution || ''
  replyDialogVisible.value = true
  replyTargetId.value = item.id
}

const replyForm = reactive({ solution: '' })
const replyDialogVisible = ref(false)
const replyTargetId = ref(null)

function submitReply() {
  if (!replyForm.solution.trim()) {
    ElMessage.warning('请填写解决方案')
    return
  }
  const item = difficultList.value.find(f => f.id === replyTargetId.value)
  if (item) {
    item.solution = replyForm.solution
    item.status = 'answered'
  }
  replyDialogVisible.value = false
  ElMessage.success('已提交解决方案，并加入知识库')
}
</script>

<template>
  <div class="upload-center">
    <!-- Page Header -->
    <div class="page-header">
      <h2 class="page-title">上传中心</h2>
      <p class="page-desc">上传设备资料文档，提交工作中遇到的疑难问题</p>
    </div>

    <!-- Two Column Layout -->
    <div class="content-grid">
      <!-- ===================== 左栏：文件上传 ===================== -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-icon"><el-icon><Upload /></el-icon></span>
          <h3 class="panel-title">文件上传</h3>
        </div>

        <!-- 拖拽区域 -->
        <div
          class="drop-zone"
          :class="{ 'drag-over': dragOver }"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop"
          @click="$refs.fileInput.click()"
        >
          <input
            ref="fileInput"
            type="file"
            multiple
            style="display:none"
            @change="handleFileSelect"
          />
          <div class="drop-content">
            <div class="drop-icon">
              <el-icon><Plus /></el-icon>
            </div>
            <p class="drop-text">拖拽文件到此处，或 <span class="highlight">点击选择文件</span></p>
            <p class="drop-hint">支持 PDF、Word、Excel、图片等格式</p>
          </div>
        </div>

        <!-- 文件列表 -->
        <div v-if="uploadedFiles.length > 0" class="file-list">
          <div v-for="item in uploadedFiles" :key="item.id" class="file-item">
            <div class="file-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="file-info">
              <span class="file-name">{{ item.name }}</span>
              <span class="file-size">{{ formatSize(item.size) }}</span>
            </div>
            <div class="file-status">
              <span v-if="item.status === 'pending'" class="status-dot pending"></span>
              <span v-else-if="item.status === 'uploading'" class="status-dot uploading"></span>
              <span v-else-if="item.status === 'success'" class="status-dot success">
                <el-icon><Check /></el-icon>
              </span>
            </div>
            <button class="remove-btn" @click.stop="removeFile(item.id)">
              <el-icon><Close /></el-icon>
            </button>
          </div>
        </div>

        <!-- 上传按钮 -->
        <div class="upload-action">
          <el-button
            type="primary"
            size="large"
            :loading="uploadLoading"
            :disabled="uploadedFiles.length === 0"
            @click="uploadFiles"
          >
            <el-icon v-if="!uploadLoading"><Upload /></el-icon>
            {{ uploadLoading ? '上传中...' : '开始上传' }}
          </el-button>
        </div>
      </div>

      <!-- ===================== 右栏：疑难杂症 ===================== -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-icon accent"><el-icon><QuestionFilled /></el-icon></span>
          <h3 class="panel-title">疑难杂症</h3>
          <el-button type="primary" size="small" @click="openDifficultDialog">
            <el-icon><Plus /></el-icon>
            提交问题
          </el-button>
        </div>

        <!-- 问题列表 -->
        <div class="difficult-list">
          <div v-for="item in difficultList" :key="item.id" class="difficult-card">
            <div class="difficult-header">
              <h4 class="difficult-title">{{ item.title }}</h4>
              <span class="category-tag" :class="item.category">{{ item.category }}</span>
            </div>

            <p class="difficult-desc">{{ item.description }}</p>

            <!-- 解决方案（管理端可见） -->
            <div v-if="item.solution" class="solution-box">
              <div class="solution-label">
                <el-icon><Check /></el-icon>
                解决方案
              </div>
              <p class="solution-text">{{ item.solution }}</p>
            </div>

            <div class="difficult-footer">
              <span class="submit-time">提交于 {{ item.submitTime }}</span>
              <div class="difficult-actions">
                <el-button size="small" text type="primary" @click="editDifficult(item)">
                  <el-icon><Document /></el-icon>
                  编辑
                </el-button>
                <el-button size="small" text type="danger" @click="deleteDifficult(item.id)">
                  <el-icon><Close /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>

          <div v-if="difficultList.length === 0" class="empty-state">
            <el-icon class="empty-icon"><QuestionFilled /></el-icon>
            <p>暂无疑难问题</p>
            <p class="empty-hint">点击右上角"提交问题"开始</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== 提交问题弹窗 ===================== -->
    <el-dialog
      v-model="difficultDialogVisible"
      :title="isEditMode ? '编辑问题' : '提交疑难问题'"
      width="560px"
      :close-on-click-modal="false"
    >
      <div class="dialog-form">
        <div class="form-item">
          <label>问题标题 <span class="required">*</span></label>
          <el-input
            v-model="difficultForm.title"
            placeholder="简明扼要描述问题"
            maxlength="50"
            show-word-limit
          />
        </div>

        <div class="form-item">
          <label>问题分类 <span class="required">*</span></label>
          <el-select v-model="difficultForm.category" placeholder="请选择分类" style="width:100%">
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </div>

        <div class="form-item">
          <label>问题描述 <span class="required">*</span></label>
          <el-input
            v-model="difficultForm.description"
            type="textarea"
            :rows="5"
            placeholder="详细描述：设备型号、故障现象、已尝试的处理方法等"
            maxlength="500"
            show-word-limit
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="difficultDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="difficultLoading" @click="submitDifficult">
          {{ isEditMode ? '保存修改' : '提交问题' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- ===================== 管理员回复弹窗 ===================== -->
    <el-dialog
      v-model="replyDialogVisible"
      title="填写解决方案并加入知识库"
      width="560px"
      :close-on-click-modal="false"
    >
      <div class="dialog-form">
        <div class="form-item">
          <label>解决方案 <span class="required">*</span></label>
          <el-input
            v-model="replyForm.solution"
            type="textarea"
            :rows="6"
            placeholder="请详细填写解决方法，处理完成后将自动加入知识库"
            maxlength="1000"
            show-word-limit
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">
          提交并加入知识库
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.upload-center {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--plaza-text);
  margin-bottom: 4px;
}
.page-desc {
  font-size: 14px;
  color: var(--plaza-text-muted);
}

/* -------------------- Grid -------------------- */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* -------------------- Panel -------------------- */
.panel {
  background: var(--plaza-bg-card);
  border: 1px solid var(--plaza-border);
  border-radius: 16px;
  padding: 24px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.panel-icon {
  width: 36px;
  height: 36px;
  background: var(--plaza-accent-soft);
  color: var(--plaza-accent);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.panel-icon.accent {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}
.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--plaza-text);
  flex: 1;
}

/* -------------------- Drop Zone -------------------- */
.drop-zone {
  border: 2px dashed var(--plaza-border);
  border-radius: 14px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}
.drop-zone:hover,
.drop-zone.drag-over {
  border-color: var(--plaza-accent);
  background: var(--plaza-accent-soft);
}
.drop-icon {
  width: 52px;
  height: 52px;
  background: var(--plaza-accent-soft);
  color: var(--plaza-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 16px;
}
.drop-text {
  font-size: 14px;
  color: var(--plaza-text-muted);
  margin-bottom: 6px;
}
.drop-text .highlight {
  color: var(--plaza-accent);
  font-weight: 600;
}
.drop-hint {
  font-size: 12px;
  color: var(--plaza-text-muted);
  opacity: 0.7;
}

/* -------------------- File List -------------------- */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  max-height: 260px;
  overflow-y: auto;
}
.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--plaza-bg);
  border-radius: 10px;
}
.file-icon {
  width: 34px;
  height: 34px;
  background: var(--plaza-accent-soft);
  color: var(--plaza-accent);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.file-info {
  flex: 1;
  min-width: 0;
}
.file-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--plaza-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-size {
  font-size: 12px;
  color: var(--plaza-text-muted);
}
.file-status {
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.status-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.status-dot.pending {
  background: rgba(156, 163, 175, 0.2);
}
.status-dot.uploading {
  border: 2px solid var(--plaza-accent);
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}
.status-dot.success {
  background: var(--app-success, #22c55e);
  color: #fff;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.remove-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--plaza-text-muted);
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: all 0.15s;
}
.remove-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--el-color-danger);
}

/* -------------------- Upload Action -------------------- */
.upload-action {
  display: flex;
  justify-content: center;
}

/* -------------------- Difficult List -------------------- */
.difficult-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
}
.difficult-card {
  background: var(--plaza-bg);
  border-radius: 12px;
  padding: 16px;
  transition: border-color 0.2s;
}
.difficult-card:hover {
  border: 1px solid var(--plaza-border);
}
.difficult-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.difficult-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--plaza-text);
  flex: 1;
}
.category-tag {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: var(--plaza-accent-soft);
  color: var(--plaza-accent);
  white-space: nowrap;
}
.difficult-desc {
  font-size: 13px;
  color: var(--plaza-text-muted);
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.solution-box {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}
.solution-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--app-success, #22c55e);
  margin-bottom: 6px;
}
.solution-text {
  font-size: 13px;
  color: var(--plaza-text);
  line-height: 1.5;
}
.difficult-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.submit-time {
  font-size: 12px;
  color: var(--plaza-text-muted);
}
.difficult-actions {
  display: flex;
  gap: 2px;
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--plaza-text-muted);
}
.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.4;
}
.empty-state p {
  font-size: 14px;
  margin-bottom: 4px;
}
.empty-hint {
  font-size: 12px;
  opacity: 0.6;
}

/* -------------------- Dialog Form -------------------- */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.form-item label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--plaza-text);
  margin-bottom: 8px;
}
.required {
  color: var(--el-color-danger);
  margin-left: 2px;
}
</style>