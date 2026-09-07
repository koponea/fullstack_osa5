const LoginForm = ({
  password,
  username,
  handleLogin,
  handlePassword,
  handleUsername,
  submitLabel = 'log in',
}) => {

  return (
    <div>
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
        <button type="submit" data-testid="submit-login">{submitLabel}
        </button>
      </form >
    </div>

  )
}

export default LoginForm
