import { useState, useImperativeHandle } from 'react'

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

  const showButton = buttonPlacing === 'regular' ?
    <div style={hideWhenVisible}>
      <button onClick={toggleVisibility}>{buttonLabel}</button>
    </div> :
    <button style={hideWhenVisible} onClick={toggleVisibility}>{buttonLabel}</button>

  const dataWithHideButton = buttonPlacing === 'regular' ?
    <div style={showWhenVisible}>
      {children}
      <button onClick={toggleVisibility}>{hideLabel}</button>
    </div> :
    <>
      <button style={showWhenVisible} onClick={toggleVisibility}>{hideLabel}</button>
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