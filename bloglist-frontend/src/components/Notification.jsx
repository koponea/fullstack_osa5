const Notification = ({ message, notificationClass = 'error' }) => {
  const notificationStyle = {
    color: notificationClass === 'error' ? 'red' : 'green',
    fontSize: '20px', // or 'small'
    background: 'lightgrey',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px'
  }
  if (message === null) {
    return null
  }

  return (
    <div style={notificationStyle} className={notificationClass} data-testid={notificationClass}>
      {message}
    </div>
  )
}

export default Notification