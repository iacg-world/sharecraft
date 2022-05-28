import { shallowMount, VueWrapper } from '@vue/test-utils'
import Uploader from '@/components/CUploader.vue'
import axios from 'axios'
import flushPromises from 'flush-promises'
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
let wrapper: VueWrapper<any>
const testFile = new File(['xyz'], 'test.png', { type: 'image/png' })

describe('Uploader Component', () => {
  beforeAll(() => {
    wrapper = shallowMount(Uploader, {
      props: {
        action: 'test.url',
      },
    })
  })
  it('上传默认状态', () => {
    expect(wrapper.find('button').exists()).toBeTruthy()
    expect(wrapper.get('button span').text()).toBe('点击上传')
    expect(wrapper.get('input').isVisible()).toBeFalsy()
  })
  it('上传默成功流程', async () => {
    // change e.target.files
    // create a file
    mockedAxios.post.mockResolvedValueOnce({ status: 'success' })
    const fileInput = wrapper.get('input').element as HTMLInputElement
    const files = [testFile] as any
    Object.defineProperty(fileInput, 'files', {
      value: files,
      writable: false,
    })
    await wrapper.get('input').trigger('change')
    expect(mockedAxios.post).toHaveBeenCalledTimes(1)
    expect(wrapper.get('button span').text()).toBe('正在上传')
    await flushPromises()
    expect(wrapper.get('button span').text()).toBe('上传成功')
    // fileInput.files = files
  })
  it('上传默失败', async () => {
    mockedAxios.post.mockRejectedValueOnce({ error: 'error' })
    await wrapper.get('input').trigger('change')
    expect(mockedAxios.post).toHaveBeenCalledTimes(2)
    expect(wrapper.get('button span').text()).toBe('正在上传')
    await flushPromises()
    expect(wrapper.get('button span').text()).toBe('上传失败')
  })
})
