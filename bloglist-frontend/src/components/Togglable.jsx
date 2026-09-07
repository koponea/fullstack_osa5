import { useState, useImperativeHandle } from 'react'
import { kebabCase } from 'lodash'

const Togglable = ({
  ref,
  buttonPlacing = 'regular',
  buttonLabel,
  hideLabel = 'cancel',
  children
}) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  useImperativeHandle(ref, () => {
    return { toggleVisibility }
  })

  const testId = kebabCase(buttonLabel)
  const hideTestId = kebabCase(hideLabel)

  const showButton = buttonPlacing === 'regular' ?
    <div style={hideWhenVisible}>
      <button data-testid={testId} onClick={toggleVisibility}>{buttonLabel}</button>
    </div> :
    <button data-testid={testId} style={hideWhenVisible} onClick={toggleVisibility}>{buttonLabel}</button>

  const dataWithHideButton = buttonPlacing === 'regular' ?
    <div style={showWhenVisible}>
      {children}
      <button data-testid={hideTestId} onClick={toggleVisibility}>{hideLabel}</button>
    </div> :
    <>
      <button data-testid={hideTestId} style={showWhenVisible} onClick={toggleVisibility}>{hideLabel}</button>
      <div style={showWhenVisible} >{children}</div>
    </>

  return (
    <>
      {showButton}
      {dataWithHideButton}
    </>
  )
}

export default Togglable