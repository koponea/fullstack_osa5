import LoginForm from './LoginForm'

const Login = ({
  username,
  password,
  handleLogin,
  handleUsername,
  handlePassword,
}) => {

  const loginForm = () => (
    <LoginForm
      password={password}
      username={username}
      handleLogin={handleLogin}
      handlePassword={handlePassword}
      handleUsername={handleUsername}
    />
  )

  return (
    <>
      <div>
        <h2>log into application</h2>
        {loginForm()}
      </div>
    </>
  )
  //}
}

export default Login