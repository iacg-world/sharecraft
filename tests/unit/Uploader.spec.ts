import { shallowMount, VueWrapper, mount } from '@vue/test-utils'
import Uploader from '@/components/CUploader.vue'
import axios from 'axios'
import flushPromises from 'flush-promises'
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
let wrapper: VueWrapper<any>
const testFile = new File(['xyz'], 'test.png', { type: 'image/png' })
const mockComponent = {
  template: '<div><slot></slot></div>',
}
const mockComponents = {
  DeleteOutlined: mockComponent,
  LoadingOutlined: mockComponent,
  FileOutlined: mockComponent,
}
const setInputValue = (input: HTMLInputElement) => {
  const files = [testFile] as any
  Object.defineProperty(input, 'files', {
    value: files,
    writable: false,
  })
}

describe('Uploader Component', () => {
  beforeAll(() => {
    wrapper = shallowMount(Uploader, {
      props: {
        action: 'test.url',
      },
      global: {
        stubs: mockComponents,
      },
    })
  })
  it('上传默认状态', () => {
    expect(wrapper.find('button').exists()).toBeTruthy()
    expect(wrapper.get('button').text()).toBe('点击上传')
    expect(wrapper.get('input').isVisible()).toBeFalsy()
  })
  it('上传默成功流程', async () => {
    // change e.target.files
    // create a file
    mockedAxios.post.mockResolvedValueOnce({ status: 'success' })
    const fileInput = wrapper.get('input').element as HTMLInputElement
    setInputValue(fileInput)
    await wrapper.get('input').trigger('change')
    expect(mockedAxios.post).toHaveBeenCalledTimes(1)
    expect(wrapper.get('button').text()).toBe('正在上传')
    // button 为 disabled
    console.log(wrapper.get('button').attributes())
    expect(wrapper.get('button').attributes()).toHaveProperty('disabled')
    // 列表长度修改，并且有正确的 class
    expect(wrapper.findAll('li').length).toBe(1)
    const firstItem = wrapper.get('li:first-child')
    expect(firstItem.classes()).toContain('upload-loading')
    await flushPromises()
    expect(wrapper.get('button').text()).toBe('点击上传')
    // 有正确的 class，并且文件名称相对应
    expect(firstItem.classes()).toContain('upload-success')
    expect(firstItem.get('.filename').text()).toBe(testFile.name)
  })
  it('上传默失败', async () => {
    mockedAxios.post.mockRejectedValueOnce({ error: 'error' })
    await wrapper.get('input').trigger('change')
    expect(mockedAxios.post).toHaveBeenCalledTimes(2)
    expect(wrapper.get('button').text()).toBe('正在上传')
    await flushPromises()
    expect(wrapper.get('button').text()).toBe('点击上传')
    // 列表长度增加，并且列表的最后一项有正确的 class 名
    expect(wrapper.findAll('li').length).toBe(2)
    const lastItem = wrapper.get('li:last-child')
    expect(lastItem.classes()).toContain('upload-error')
    // 点击列表中右侧的 button，可以删除这一项
    await lastItem.get('.delete-icon').trigger('click')
    expect(wrapper.findAll('li').length).toBe(1)
  })
  it('uploader组件插槽正常', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { url: 'dummy.url' } })
    mockedAxios.post.mockResolvedValueOnce({ data: { url: 'xyz.url' } })
    const wrapper = mount(Uploader, {
      props: {
        action: 'test.url',
      },
      slots: {
        default: '<button>Custom button</button>',
        loading: '<div class="loading">custom loading</div>',
        uploaded: `<template #uploaded="{ uploadedData }">
          <div class="custom-loaded">{{uploadedData.url}}</div>
        </template>`,
      },
      global: {
        stubs: mockComponents,
      },
    })
    expect(wrapper.get('button').text()).toBe('Custom button')
    const fileInput = wrapper.get('input').element as HTMLInputElement
    setInputValue(fileInput)
    await wrapper.get('input').trigger('change')
    expect(wrapper.get('.loading').text()).toBe('custom loading')
    await flushPromises()
    expect(wrapper.get('.custom-loaded').text()).toBe('dummy.url')
    await wrapper.get('input').trigger('change')
    expect(wrapper.get('.loading').text()).toBe('custom loading')
    await flushPromises()
    expect(wrapper.get('.custom-loaded').text()).toBe('xyz.url')
  })
})
