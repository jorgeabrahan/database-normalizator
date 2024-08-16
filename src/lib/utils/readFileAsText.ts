export const readFileAsText = (
  file: File,
  onReadCallback: (fileContent: string) => void,
  onReadErrorCallback: (errorMessage: string) => void = () => {}
) => {
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = (e) => {
    const fileContent = e?.target?.result as string
    if (fileContent == null) {
      onReadErrorCallback('Ocurrio un error al extraer el contenido del archivo')
      return
    }
    onReadCallback(fileContent)
  }
  reader.onerror = () => {
    onReadErrorCallback('Ocurrio un error al leer el archivo')
  }
}
