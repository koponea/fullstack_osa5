import { Alert } from '@mui/material'

const Notification = ({ message, notificationClass = 'error' }) => {
  const notificationStyle = {
    /*
    color: notificationClass === 'error' ? 'red' : 'green',
    fontSize: '20px', // or 'small'
    background: 'lightgrey',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px'
    */
    marginTop: 10,
    marginBottom: 10
  }
  if (message === null) {
    return null
  }

  return (
    <Alert
      style={notificationStyle}
      className={notificationClass}
      data-testid={notificationClass}
      severity={notificationClass}>
      {message}
    </Alert>
  )
}

export default Notification