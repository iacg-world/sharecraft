import store from '@/store/index'
import { testData } from '@/store/templates'
import { testComponents, ComponentData } from '@/store/editor'
import { clone, last } from 'lodash-es'
const cloneComponents = clone(testComponents)
describe('test vuex store', () => {
  it('should have three modules', () => {
    expect(store.state).toHaveProperty('user')
    expect(store.state).toHaveProperty('templates')
    expect(store.state).toHaveProperty('editor')
  })
  describe('test user module', () => {
    it('test login mutation', () => {
      store.commit('login')
      expect(store.state.user.isLogin).toBeTruthy()
    })
    it('test logout mutation', () => {
      store.commit('logout')
      expect(store.state.user.isLogin).toBeFalsy()
    })
  })
  describe('test templates module', () => {
    it('should have default templates', () => {
      expect(store.state.templates.data).toHaveLength(testData.length)
    })
    it('should get the correct template by Id', () => {
      const selectTemplate = store.getters.getTemplateById(1)
      expect(selectTemplate.title).toBe('iacg落地页海报')
    })
  })
  describe('test editor module', () => {
    it('should have default components', () => {
      expect(store.state.editor.components).toHaveLength(cloneComponents.length)
    })
    describe('激活画布组件编辑：', () => {
      it('dblclick component should find correct componentId', () => {
        store.commit('setActive', cloneComponents[0].id)
        expect(store.state.editor.currentElementId).toBe(cloneComponents[0].id)
        const currentElement = store.getters.getCurrentElement
        expect(currentElement.id).toBe(cloneComponents[0].id)
      })

      it('激活画布组件编辑：dblclick component should change editStatus and clear component click event timeout', () => {
        const editStatus = store.state.editor.isEditing
        store.commit('setEditStatus', editStatus)
        expect(store.state.editor.isEditing).toBe(!editStatus)
        expect(store.state.editor.clickTimeout).toBe(0)
      })
    })

    describe('component event: ', () => {
      it('component add should works fine', () => {
        const payload: ComponentData = {
          name: 'c-text',
          id: '1234',
          props: {
            text: 'text1',
          },
        }
        store.commit('addComponent', payload)
        expect(store.state.editor.components).toHaveLength(
          cloneComponents.length + 1
        )
        const lastItem = last(store.state.editor.components)
        expect(lastItem?.props.text).toBe('text1')
      })
      it('component update should works fine', () => {
        const newProps = {
          key: 'text',
          value: 'update',
        }
        store.commit('updateComponent', newProps)
        const currentElement: ComponentData = store.getters.getCurrentElement
        expect(currentElement.props.text).toBe('update')
      })
      it('component remove should works fine', () => {
        const targetId = cloneComponents[0].id
        store.commit('removeComponent', targetId)
        const afterComponents = store.state.editor.components.filter((item) => {
          if (item.id !== targetId) {
            return item
          }
        })
        expect(store.state.editor.components).toEqual(afterComponents)
      })
    })
  })
})
