import { ComponentData } from '@/store/editor'
import { textDefaultProps, imageDefaultProps } from '@/defaultProps'
import { v4 as uuidv4 } from 'uuid'

export interface FigmaApiConfig {
  accessToken: string
  baseURL: string
}

export interface FigmaNode {
  id: string
  name: string
  type: string
  absoluteBoundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  fills?: Array<{
    type: string
    color?: {
      r: number
      g: number
      b: number
      a: number
    }
  }>
  characters?: string
  style?: {
    fontSize?: number
    fontFamily?: string
    fontWeight?: number
    textAlignHorizontal?: string
    textAlignVertical?: string
  }
  children?: FigmaNode[]
}

export interface FigmaFileResponse {
  document: FigmaNode
  components: { [key: string]: any }
  schemaVersion: number
  styles: { [key: string]: any }
}

export interface FigmaImportResult {
  success: boolean
  components: ComponentData[]
  error?: string
  originalData?: FigmaFileResponse
}

/**
 * 从Figma URL提取文件ID和节点ID
 */
export function parseFigmaUrl(url: string): { fileId: string; nodeId?: string } | null {
  try {
    // 支持的Figma URL格式:
    // https://www.figma.com/file/[fileId]/[filename]
    // https://www.figma.com/file/[fileId]/[filename]?node-id=[nodeId]
    const urlObj = new URL(url)
    
    if (!urlObj.hostname.includes('figma.com')) {
      return null
    }

    const pathMatch = urlObj.pathname.match(/\/file\/([a-zA-Z0-9]+)/)
    if (!pathMatch) {
      return null
    }

    const fileId = pathMatch[1]
    const nodeId = urlObj.searchParams.get('node-id')

    return {
      fileId,
      nodeId: nodeId || undefined
    }
  } catch (error) {
    console.error('解析Figma URL失败:', error)
    return null
  }
}

/**
 * 从Figma API获取文件数据
 */
export async function fetchFigmaFile(
  fileId: string, 
  config: FigmaApiConfig
): Promise<FigmaFileResponse> {
  try {
    const response = await fetch(`${config.baseURL}/v1/files/${fileId}`, {
      headers: {
        'X-Figma-Token': config.accessToken,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Figma API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取Figma文件失败:', error)
    throw error
  }
}

/**
 * 从Figma API获取特定节点的数据
 */
export async function fetchFigmaNodes(
  fileId: string,
  nodeIds: string[],
  config: FigmaApiConfig
): Promise<{ nodes: { [key: string]: FigmaNode } }> {
  try {
    const idsParam = nodeIds.join(',')
    const response = await fetch(
      `${config.baseURL}/v1/files/${fileId}/nodes?ids=${idsParam}`,
      {
        headers: {
          'X-Figma-Token': config.accessToken,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Figma API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取Figma节点失败:', error)
    throw error
  }
}

/**
 * 将Figma颜色转换为CSS颜色值
 */
function figmaColorToCSS(color: { r: number; g: number; b: number; a: number }): string {
  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)
  const a = color.a

  if (a === 1) {
    return `rgb(${r}, ${g}, ${b})`
  } else {
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }
}

/**
 * 转换Figma文本对齐方式到CSS
 */
function figmaTextAlignToCSS(align?: string): string {
  switch (align) {
    case 'LEFT':
      return 'left'
    case 'CENTER':
      return 'center'
    case 'RIGHT':
      return 'right'
    case 'JUSTIFIED':
      return 'justify'
    default:
      return 'left'
  }
}

/**
 * 递归遍历Figma节点并转换为ShareCraft组件
 */
function convertFigmaNode(
  node: FigmaNode,
  canvasOffset: { x: number; y: number } = { x: 0, y: 0 }
): ComponentData[] {
  const components: ComponentData[] = []

  // 计算相对于画布的位置
  const absoluteX = node.absoluteBoundingBox.x - canvasOffset.x
  const absoluteY = node.absoluteBoundingBox.y - canvasOffset.y

  switch (node.type) {
    case 'TEXT':
      components.push({
        id: uuidv4(),
        name: 'c-text',
        layerName: node.name || '文本',
        props: {
          ...textDefaultProps,
          text: node.characters || '文本内容',
          fontSize: node.style?.fontSize ? `${node.style.fontSize}px` : '14px',
          fontFamily: node.style?.fontFamily || 'Arial, sans-serif',
          fontWeight: node.style?.fontWeight || 400,
          textAlign: figmaTextAlignToCSS(node.style?.textAlignHorizontal),
          color: node.fills?.[0]?.color 
            ? figmaColorToCSS(node.fills[0].color)
            : '#000000',
          left: `${Math.round(absoluteX)}px`,
          top: `${Math.round(absoluteY)}px`,
          width: `${Math.round(node.absoluteBoundingBox.width)}px`,
          height: `${Math.round(node.absoluteBoundingBox.height)}px`,
          position: 'absolute'
        }
      })
      break

    case 'RECTANGLE':
    case 'ELLIPSE':
    case 'POLYGON':
    case 'STAR':
    case 'VECTOR':
      // 如果是形状，转换为文本组件作为占位符
      components.push({
        id: uuidv4(),
        name: 'c-text',
        layerName: node.name || '形状',
        props: {
          ...textDefaultProps,
          text: node.name || '形状',
          backgroundColor: node.fills?.[0]?.color 
            ? figmaColorToCSS(node.fills[0].color)
            : '#f0f0f0',
          borderRadius: node.type === 'ELLIPSE' ? '50%' : '4px',
          textAlign: 'center',
          left: `${Math.round(absoluteX)}px`,
          top: `${Math.round(absoluteY)}px`,
          width: `${Math.round(node.absoluteBoundingBox.width)}px`,
          height: `${Math.round(node.absoluteBoundingBox.height)}px`,
          position: 'absolute'
        }
      })
      break

    case 'GROUP':
    case 'FRAME':
    case 'COMPONENT':
    case 'INSTANCE':
      // 递归处理子元素
      if (node.children) {
        for (const child of node.children) {
          const childComponents = convertFigmaNode(child, canvasOffset)
          components.push(...childComponents)
        }
      }
      break

    default:
      console.warn(`不支持的Figma节点类型: ${node.type}`)
      break
  }

  return components
}

/**
 * 将整个Figma文件转换为ShareCraft组件
 */
export function convertFigmaFileToComponents(figmaData: FigmaFileResponse): ComponentData[] {
  const components: ComponentData[] = []
  
  // 找到画布节点（通常是CANVAS类型）
  function findCanvasNodes(node: FigmaNode): FigmaNode[] {
    if (node.type === 'CANVAS') {
      return [node]
    }
    
    const canvases: FigmaNode[] = []
    if (node.children) {
      for (const child of node.children) {
        canvases.push(...findCanvasNodes(child))
      }
    }
    return canvases
  }

  const canvases = findCanvasNodes(figmaData.document)
  
  for (const canvas of canvases) {
    if (canvas.children) {
      // 获取画布的边界框作为偏移量
      const canvasOffset = {
        x: canvas.absoluteBoundingBox?.x || 0,
        y: canvas.absoluteBoundingBox?.y || 0
      }

      for (const child of canvas.children) {
        const childComponents = convertFigmaNode(child, canvasOffset)
        components.push(...childComponents)
      }
    }
  }

  return components
}

/**
 * 主要的Figma导入函数
 */
export async function importFromFigma(
  figmaUrl: string,
  accessToken: string
): Promise<FigmaImportResult> {
  try {
    // 解析Figma URL
    const urlData = parseFigmaUrl(figmaUrl)
    if (!urlData) {
      return {
        success: false,
        components: [],
        error: '无效的Figma URL格式'
      }
    }

    // 配置API
    const config: FigmaApiConfig = {
      accessToken,
      baseURL: 'https://api.figma.com'
    }

    let figmaData: FigmaFileResponse
    let components: ComponentData[] = []

    if (urlData.nodeId) {
      // 如果指定了节点ID，只获取特定节点
      const nodesData = await fetchFigmaNodes(urlData.fileId, [urlData.nodeId], config)
      const node = nodesData.nodes[urlData.nodeId]
      if (node) {
        components = convertFigmaNode(node)
      }
    } else {
      // 获取整个文件
      figmaData = await fetchFigmaFile(urlData.fileId, config)
      components = convertFigmaFileToComponents(figmaData)
    }

    return {
      success: true,
      components,
      originalData: figmaData!
    }
  } catch (error) {
    console.error('Figma导入失败:', error)
    return {
      success: false,
      components: [],
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}