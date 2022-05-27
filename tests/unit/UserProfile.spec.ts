import { mount, VueWrapper } from '@vue/test-utils'
import { message } from 'ant-design-vue'
import UserProfile from '@/components/UserProfile.vue'
import store from '@/store/index'
let wrapper: VueWrapper<any>
jest.mock('ant-design-vue', () => ({
  message: {
    success: jest.fn(),
  },
}))
jest.mock('vue-router')
const mockComponent = {
  template: '<div><slot></slot></div>',
}
const mockComponent2 = {
  template: '<div><slot></slot><slot name="overlay"></slot></div>',
}
const globalComponents = {
  'a-button': mockComponent,
  'a-dropdown-button': mockComponent2,
  'router-link': mockComponent,
  'a-menu': mockComponent,
  'a-menu-item': mockComponent,
}

describe('UserProfile component', () => {
  beforeAll(() => {
    // config.renderStubDefaultSlot = true
    wrapper = mount(UserProfile, {
      props: {
        user: { isLogin: false },
      },
      global: {
        components: globalComponents,
        provide: {
          store,
        },
      },
    })
  })
  it('should render login button when login is false', async () => {
    console.log(wrapper.html())
    expect(wrapper.get('div').text()).toBe('登录')
    await wrapper.get('div').trigger('click')
    expect(message.success).toHaveBeenCalled()
    expect(store.state.user.userName).toBe('lc')
  })
  it('should render username when login is true', async () => {
    await wrapper.setProps({
      user: { isLogin: true, userName: 'lc' },
    })
    expect(wrapper.get('.user-profile-component').html()).toContain('lc')
    expect(wrapper.find('.user-profile-dropdown').exists()).toBeTruthy()
  })
  afterAll(() => {
    // config.renderStubDefaultSlot = false
  })
})
