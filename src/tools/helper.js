const helper = {
  isNested: (object, field) => {
    let value = object[field]
    const nestedField = field.split('.')

    if (nestedField.length > 1) {
      value = object[nestedField[0]][nestedField[1]]
    }

    return value
  }
}

export default helper
