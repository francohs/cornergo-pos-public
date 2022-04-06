const pages = import.meta.glob('../pages/**/*.vue')

const loadRoutes = () => {
  const routes = []

  for (const path in pages) {
    const filePathArr = /(\w*)\/(\w+)\.vue/.exec(path)

    if (filePathArr) {
      const folderName = filePathArr[1]
      const fileName = filePathArr[2]

      if (folderName == 'components') continue
      if (fileName.slice(0, 1) == '_') continue

      let routeName = fileName
      if (fileName == 'docs' || fileName == 'index') routeName = folderName
      else if (fileName == 'doc') routeName = `${folderName}/:id`
      else if (fileName == 'create') routeName = `${folderName}/create`

      routes.push({
        path: routeName,
        name: routeName,
        component: pages[path]
      })
    }
  }

  return routes
}

export default loadRoutes
