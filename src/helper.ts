import { message } from 'ant-design-vue/es'
import axios from 'axios'
import { toBlob } from 'html-to-image'
import { RespUploadData } from './respTypes'
import QRCode from 'qrcode'
import { saveAs } from 'file-saver'

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
  const canvasBlob = await toBlob(ele, { width: 375 })
  if (canvasBlob) {
    const data = await uploadFile<RespUploadData>(canvasBlob)
    return data
  }
}

export function generateQRCode(id: string, url: string, width = 100) {
  const ele = document.getElementById(id) as HTMLCanvasElement
  return QRCode.toCanvas(ele, url, { width })
}
export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const objToQueryString = (queryObj: { [key: string]: any }) => {
  return Object.keys(queryObj)
    .map((key) => `${key}=${queryObj[key]}`)
    .join('&')
}

export const downloadFile = (src: string, fileName = 'default.png') => {
  // 创建链接
  const link = document.createElement('a')
  link.download = fileName
  link.rel = 'noopener'
  if (link.origin !== location.origin) {
    axios
      .get(src, { responseType: 'blob' })
      .then((data) => {
        link.href = URL.createObjectURL(data.data)
        setTimeout(() => {
          link.dispatchEvent(new MouseEvent('click'))
        })
        setTimeout(() => {
          URL.revokeObjectURL(link.href)
        }, 10000)
      })
      .catch((e) => {
        console.error(e)
        link.target = '_blank'
        link.href = src
        link.dispatchEvent(new MouseEvent('click'))
      })
  } else {
    // 设置链接属性
    link.href = src
    // 触发事件
    link.dispatchEvent(new MouseEvent('click'))
  }
}

export const downloadImage = (url: string) => {
  const fileName = url.substring(url.lastIndexOf('/') + 1)
  saveAs(url, fileName)
}
