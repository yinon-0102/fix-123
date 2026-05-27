/**
 * ASR 语音识别 API
 * POST /weixiu/ai/transcribe (百度语音识别)
 */

export async function uploadAudio(file, filename) {
  const formData = new FormData()
  formData.append('file', file, filename)

  const response = await fetch('/weixiu/ai/transcribe', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('ASR failed')
  }

  const result = await response.json()
  // 后端 Result<String> 格式: { code, message, data }
  // 统一转换为前端期望的格式
  return {
    text: result.data || '',
  }
}

/**
 * @typedef {Object} ASRResponse
 * @property {string} text - 识别文本（与 result.data 等价）
 */