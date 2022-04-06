import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  const components = import.meta.globEager('../components/**/*.vue')
  const getComponentName = new RegExp(/[\w-]+?(?=\.)/)

  for (const path in components) {
    const componentName = getComponentName.exec(path)
    app.component(componentName[0], components[path].default)
  }
})
