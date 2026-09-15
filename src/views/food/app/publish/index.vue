<template>
  <div class="app-page">
    <div class="page-title">
      <span>{{ isEdit ? '编辑美食' : '发布美食' }}</span>
      <span v-if="isEdit" class="page-title__sub">编号 {{ editId }}</span>
    </div>

    <div class="form-card" v-loading="loadingDetail">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="给你的美食起个名字" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" clearable style="width: 100%">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="简介" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            maxlength="200"
            show-word-limit
            placeholder="一句话介绍这道美食"
          />
        </el-form-item>

        <el-form-item label="封面图片">
          <el-upload
            class="cover-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            name="file"
            :show-file-list="false"
            accept="image/*"
            :before-upload="beforeUpload"
            :on-success="onUploadSuccess"
            :on-error="onUploadError"
          >
            <img v-if="coverPreview" :src="coverPreview" class="cover-preview" />
            <div v-else class="cover-placeholder">
              <el-icon><Plus /></el-icon>
              <span>上传封面</span>
            </div>
          </el-upload>
          <div v-if="isEdit" class="cover-tip">不重新上传则保留原封面（含系统自动生成的封面）</div>
        </el-form-item>

        <el-form-item label="详细内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            maxlength="2000"
            show-word-limit
            placeholder="食材、步骤、小贴士..."
          />
        </el-form-item>

        <el-button type="primary" class="submit-btn" :loading="submitting" @click="submit">
          {{ isEdit ? '保存修改' : '发布' }}
        </el-button>
        <el-button v-if="isEdit" class="cancel-btn" @click="goBack">取消</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup name="AppPublish">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { listAppCategories, publishFood, getMine, updateMine } from '@/api/food/app'
import { getToken } from '@/utils/auth'
import { resolveImage } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const categories = ref([])
const submitting = ref(false)
const loadingDetail = ref(false)
const uploadedImage = ref('')

// 带 id 进入即为「编辑模式」
const editId = computed(() => route.query.id || '')
const isEdit = computed(() => !!editId.value)

const form = reactive({
  title: '',
  categoryId: null,
  description: '',
  content: ''
})

const rules = {
  title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请填写详细内容', trigger: 'blur' }]
}

const uploadUrl = computed(() => (import.meta.env.VITE_APP_BASE_API || '') + '/common/upload')
const uploadHeaders = computed(() => ({ Authorization: 'Bearer ' + getToken() }))
const coverPreview = computed(() => resolveImage(uploadedImage.value))

function loadCategories() {
  listAppCategories().then(res => {
    categories.value = res.data || []
  })
}

function beforeUpload(file) {
  const isImage = file.type.indexOf('image/') === 0
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (file.size / 1024 / 1024 > 10) {
    ElMessage.error('图片大小不能超过 10MB')
    return false
  }
  return true
}

function onUploadSuccess(res) {
  if (res && res.code === 200) {
    uploadedImage.value = res.fileName
    ElMessage.success('封面上传成功')
  } else {
    ElMessage.error((res && res.msg) || '上传失败')
  }
}

function onUploadError() {
  ElMessage.error('封面上传失败，请重试')
}

function submit() {
  formRef.value.validate(valid => {
    if (!valid) {
      return
    }
    submitting.value = true
    const payload = {
      title: form.title,
      categoryId: form.categoryId,
      description: form.description,
      content: form.content,
      image: uploadedImage.value
    }
    // 编辑模式：调用修改接口；发布模式：调用新增接口
    const action = isEdit.value
      ? updateMine(editId.value, payload)
      : publishFood(payload)
    action.then(() => {
      ElMessage.success(isEdit.value ? '修改成功' : '发布成功')
      router.push('/app/mine')
    }).finally(() => {
      submitting.value = false
    })
  })
}

// 编辑模式：回显原有内容
function loadDetail(id) {
  loadingDetail.value = true
  getMine(id).then(res => {
    const data = res.data || {}
    form.title = data.title || ''
    form.categoryId = data.categoryId || null
    form.description = data.description || ''
    form.content = data.content || ''
    uploadedImage.value = data.image || ''
  }).catch(() => {
    ElMessage.error('内容加载失败，请返回重试')
  }).finally(() => {
    loadingDetail.value = false
  })
}

function goBack() {
  router.push('/app/mine')
}

onMounted(() => {
  loadCategories()
  if (isEdit.value) {
    loadDetail(editId.value)
  }
})

// 在「编辑 A」和「编辑 B」之间切换时复用同一组件，需要重新加载
watch(
  () => route.query.id,
  (id) => {
    if (id) {
      loadDetail(id)
    }
  }
)
</script>

<style scoped lang="scss">
.app-page {
  padding: 8px 12px 12px;

  .page-title {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    padding: 4px 2px 10px;

    &__sub {
      font-size: 12px;
      font-weight: 400;
      color: #a8abb2;
    }
  }

  .cover-tip {
    margin-top: 6px;
    font-size: 12px;
    color: #a8abb2;
    line-height: 16px;
  }

  .cancel-btn {
    width: 100%;
    margin: 10px 0 12px 0;
    border-radius: 20px;
  }

  .form-card {
    background: #fff;
    border-radius: 10px;
    padding: 14px 14px 6px;

    .cover-uploader {
      :deep(.el-upload) {
        width: 110px;
        height: 110px;
        border: 1px dashed #dcdfe6;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 0.2s;

        &:hover {
          border-color: #ff7a45;
        }
      }

      .cover-preview {
        width: 110px;
        height: 110px;
        object-fit: cover;
        display: block;
      }

      .cover-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        color: #909399;
        font-size: 12px;

        .el-icon {
          font-size: 22px;
        }
      }
    }

    .submit-btn {
      width: 100%;
      margin-bottom: 12px;
      border-radius: 20px;
      background: linear-gradient(135deg, #ff9a44, #ff7a45);
      border: none;
    }
  }
}
</style>
