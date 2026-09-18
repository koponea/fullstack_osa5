
import { Button, PasswordTextField, UsernameTextField } from './StyledComponents'

const LoginForm = ({
  password,
  username,
  handleLogin,
  handlePassword,
  handleUsername,
  submitLabel = 'log in',
}) => {

  return (
    <>
      < form onSubmit={handleLogin} >
        <div>
          <label>
            <UsernameTextField
              placeholder="give username here"
              data-testid="username-input"
              label="username"
              value={username}
              onChange={handleUsername}
            />
          </label>
          <label>
            <PasswordTextField
              placeholder="give password here"
              data-testid="password-input"
              label="password"
              value={password}
              onChange={handlePassword}
            />
          </label>
        </div>
        <p>
          <Button type="submit" data-testid="submit-login">{submitLabel}
          </Button>
        </p>
      </form >
    </>
  )
}

export default LoginForm
