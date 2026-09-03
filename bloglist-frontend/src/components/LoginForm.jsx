const LoginForm = (props) => {
  const {
    password,
    username,
    handleLogin,
    handlePassword,
    handleUsername,
    submitLabel = 'login',
  } = props

  return (
    < form onSubmit={handleLogin} >
      <div>
        <label>
          username
          <input
            type="text"
            value={username}
            onChange={handleUsername}
          />
        </label>
      </div>
      <div>
        <label>
          password
          <input
            type="password"
            value={password}
            onChange={handlePassword}
          />
        </label>
      </div>
      <button type="submit" data-testid="submit">{submitLabel}
      </button>
    </form >
  )
}

export default LoginForm
