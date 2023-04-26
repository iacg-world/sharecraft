import { message } from 'ant-design-vue'
import axios from 'axios'
import html2canvas from 'html2canvas'
import { RespUploadData } from './respTypes'
import QRCode from 'qrcode'
interface CheckCondition {
  format?: string[]
  // 使用多少 M 为单位
  size?: number
}
type ErrorType = 'size' | 'format' | null
/* 上传前检测 */
export function beforeUploadCheck(file: File, condition: CheckCondition) {
  const { format, size } = condition
  const isValidFormat = format ? format.includes(file.type) : true
  const isValidSize = size ? file.size / 1024 / 1024 / 1024 < size : true
  let error: ErrorType = null
  if (!isValidFormat) {
    error = 'format'
  }
  if (!isValidSize) {
    error = 'size'
  }
  return {
    passed: isValidFormat && isValidSize,
    error,
  }
}

/* 图片上传检测 */
export const commonUploadCheck = (file: File) => {
  const result = beforeUploadCheck(file, {
    format: ['image/jpeg', 'image/png'],
    size: 10,
  })
  const { passed, error } = result
  if (error === 'format') {
    message.error('上传图片只能是 JPG/PNG 格式!')
  }
  if (error === 'size') {
    message.error('上传图片大小不能超过 10Mb')
  }
  return passed
}

export const getImageDimensions = (url: string | File) => {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image()

    img.src = typeof url === 'string' ? url : URL.createObjectURL(url)
    img.addEventListener('load', () => {
      const { naturalWidth: width, naturalHeight: height } = img
      resolve({ width, height })
    })
    img.addEventListener('error', () => {
      reject(new Error('There was some problem with the image.'))
    })
  })
}

/**
 * 获取父元素
 * @param element
 * @param className
 * @returns
 */
export const getParentElement = (element: HTMLElement, className: string) => {
  while (element) {
    if (element.classList && element.classList.contains(className)) {
      return element
    } else {
      element = element.parentNode as HTMLElement
    }
  }
  return null
}

export const insertAt = (arr: any[], index: number, newItem: any) => {
  return [...arr.slice(0, index), newItem, ...arr.slice(index)]
}

export const debounce = (callback: (...args: any) => void, timeout = 500) => {
  let timer = 0
  return (...args: any) => {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      timer = 0
      callback(...args)
    }, timeout)
  }
}

export function isMobile(mobile: string) {
  return /^1[3-9]\d{9}$/.test(mobile)
}

export async function uploadFile<R = any>(
  file: Blob,
  url = '/utils/upload-img',
  fileName = 'screenshot.png'
) {
  const newFile = file instanceof File ? file : new File([file], fileName)
  const formData = new FormData()
  formData.append(newFile.name, newFile)
  const { data } = await axios.post<R>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}
function getCanvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    })
  })
}
export async function takeScreenshotAndUpload(ele: HTMLElement) {
  const canvas = await html2canvas(ele, { width: 375, useCORS: true, scale: 1 })
  const canvasBlob = await getCanvasBlob(canvas)
  if (canvasBlob) {
    const data = await uploadFile<RespUploadData>(canvasBlob)
    return data
  }
}

export function generateQRCode(id: string, url: string) {
  const ele = document.getElementById(id) as HTMLCanvasElement
  console.log(ele)
  return QRCode.toCanvas(ele, url, { width: 100 })
}
export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
