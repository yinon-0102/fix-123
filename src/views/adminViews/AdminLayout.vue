<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  House,
  User,
  Document,
  Setting,
  ArrowDown,
  ChatDotRound,
  OfficeBuilding,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const isCollapsed = ref(true)

const userAvatar = computed(() => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.name ? userInfo.name[0] : 'U'
  } catch {
    return 'U'
  }
})

const userName = computed(() => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.name || '管理员'
  } catch {
    return '管理员'
  }
})

const userType = computed(() => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.type == 1 ? '管理员' : '用户'
  } catch {
    return '管理员'
  }
})

const menuItems = [
  { path: '/admin/dashboard', name: '首页概览', icon: House },
  { path: '/admin/users', name: '用户管理', icon: User },
  { path: '/admin/knowledge', name: '知识库管理', icon: Document },
  { path: '/admin/ai-chat', name: 'AI 对话', icon: ChatDotRound },
  { path: '/admin/business', name: '业务管理', icon: OfficeBuilding },
  { path: '/admin/settings', name: '系统设置', icon: Setting },
]

function goToHome() {
  router.push('/admin/dashboard')
}

function goToLogin() {
  router.push('/login')
}

function isActive(path) {
  if (path === '/admin/business') {
    return route.path.startsWith('/admin/business')
  }
  return route.path === path
}

function handleDropdown(command) {
  if (command === 'logout') {
    goToLogin()
  } else if (command === 'profile') {
    router.push('/admin/profile')
  } else if (command === 'my-info') {
    router.push('/admin/notify')
  }
}
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside
      class="admin-sidebar"
      :class="{ collapsed: isCollapsed }"
      @mouseenter="isCollapsed = false"
      @mouseleave="isCollapsed = true"
    >
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <div class="brand-logo">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
            </svg>
          </div>
          <span class="logo-text" v-show="!isCollapsed">检修系统</span>
        </div>
        <span class="admin-badge" v-show="!isCollapsed">管理员</span>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
          <span class="nav-text" v-show="!isCollapsed">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="admin-main" :class="{ expanded: !isCollapsed }">
      <!-- Top Header -->
      <header class="admin-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleDropdown">
            <div class="user-avatar">{{ userAvatar }}</div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="my-info">通知</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-type">{{ userType }}</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--plaza-bg);
}

/* Sidebar */
.admin-sidebar {
  width: 240px;
  background: var(--plaza-bg-card);
  border-right: 1px solid var(--plaza-border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 101;
}
.admin-sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid var(--plaza-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
}
.logo-icon {
  background: var(--plaza-accent);
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-text {
  color: var(--plaza-text);
  white-space: nowrap;
}

.brand-logo {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--plaza-accent);
  border-radius: 50%;
  flex-shrink: 0;
}

.brand-logo::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: pulse-ring 2s ease-in-out infinite;
}

.brand-logo svg {
  color: #fff;
  width: 18px;
  height: 18px;
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8));
}

@keyframes pulse-ring {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0;
  }
}
.admin-badge {
  background: var(--plaza-accent-soft);
  color: var(--plaza-accent);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 10px;
  width: fit-content;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: var(--plaza-text-muted);
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 15px;
}
.nav-item:hover {
  background: var(--plaza-accent-soft);
  color: var(--plaza-accent);
}
.nav-item.active {
  background: var(--plaza-accent-soft);
  color: var(--plaza-accent);
  font-weight: 600;
}
.nav-icon {
  font-size: 20px;
  flex-shrink: 0;
}
.nav-text {
  white-space: nowrap;
}

/* Main Content */
.admin-main {
  flex: 1;
  margin-left: 72px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.admin-main.expanded {
  margin-left: 240px;
}

/* Header */
.admin-header {
  height: 60px;
  background: #f5f5f5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid var(--plaza-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  font-weight: 700;
}
.header-left :deep(.el-breadcrumb__inner) {
  font-weight: 700 !important;
  font-size: 18px !important;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--plaza-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  margin-left: 120px;
}
.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 48px;
}
.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--plaza-text);
  text-align: center;
  line-height: 1.2;
}
.user-type {
  padding: 2px 12px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid var(--plaza-border);
  font-size: 12px;
  color: var(--plaza-text-muted);
  text-align: center;
  line-height: 1.2;
}

/* Content */
.admin-content {
  flex: 1;
  padding: 32px 24px;
  overflow-y: auto;
  position: relative;
}

/* Responsive */
@media (max-width: 900px) {
  .admin-sidebar {
    width: 72px;
  }
  .sidebar-logo .logo-text,
  .admin-badge,
  .nav-text {
    display: none;
  }
  .admin-main {
    margin-left: 72px;
  }
}
</style>