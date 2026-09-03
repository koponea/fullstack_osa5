import { useState, useEffect } from 'react'
import Notification from './components/Notification.jsx'
import Blog from './components/Blog'
import blogService from './services/blogs'
import LoginForm from "./components/LoginForm"
import BlogForm from "./components/BlogForm"
import loginService from "./services/login"
import logger from "../utils/logger"

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [errorMessage, setErrorMessage] = useState(null) // !!??
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [user, setUser] = useState(null)

  const eventHandler = receivedBlogzz => {
    // rekisteroi tapahtumankasittelija get-operaatiolle
    logger.debug('promise fulfilled with', receivedBlogzz)
    setBlogs(receivedBlogzz)
  }

  const notifyUserOfError = msg => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage(null)
    }, 6000);
  }

    const notifyUser = msg => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage(null)
    }, 4000);
  }

  useEffect(() => {
    logger.debug('effectissa, hookissa')
    blogService
      .getAll()
      .then(eventHandler)
      .catch(error =>
        notifyUserOfError(`The blogs fetch not successful, ${error}`)
      )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const addBlog = (event) => {
    event.preventDefault()
    logger.debug('button clicked, target:', event.target)
    const blogObject = {
      title, author, url, user: user.id
    }
    blogService
      .create(blogObject)
      .then(receivedBlog => {
        logger.debug(receivedBlog)
        notifyUser(`a new blog ${title} by ${author} added`)
        setBlogs(blogs.concat(receivedBlog))
        setUrl('')
        setAuthor('')
        setTitle('')
      })
      .catch(error =>
        notifyUserOfError(
          `The blog could be not be created, ${error}`
        )
      )
  }

  const handleUsername = (event) => {
    logger.debug('username:', event.target.value)
    setUsername(event.target.value)
  }
  const handlePassword = (event) => {
    logger.debug('password:', event.target.value)
    setPassword(event.target.value)
  }


  const handleLogin = async event => {
    event.preventDefault()
    logger.debug('logging in with', username, password)

    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedBlogAppUser', JSON.stringify(user)
      )
      // consoliin   window.localStorage
      logger.debug('logging in user', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      notifyUserOfError('wrong username or password')
    }
  }

  const handleLogout = async event => {
    event.preventDefault()
    logger.debug('logging out with', username)

    try {
      window.localStorage.removeItem('loggedBlogAppUser')
      blogService.setToken(null)
      setUser(null)
      setUsername('')
      setPassword('')
    } catch (error) {
      notifyUserOfError(`problem on removing credentials, ${error}`)
    }
  }

  return (
    <div>
      {!user && (<div>
        <h2>log into application</h2>
        <Notification message={errorMessage} />

        <LoginForm
          password={password}
          username={username}
          handleLogin={handleLogin}
          handlePassword={handlePassword}
          handleUsername={handleUsername}
        />
      </div>)
      }

      {user && (
        <div>
          <h2>blogs</h2>
          <Notification message={errorMessage} />
          <Notification message={notificationMessage} notificationClass='notification' />

          <p>{user.name} logged in</p>
          <h2>create new</h2>
          <BlogForm
            url={url}
            author={author}
            title={title}
            setTitle={setTitle}
            setAuthor={setAuthor}
            setUrl={setUrl}
            addBlog={addBlog}
          />
        </div>
      )}

      {user && (
        <div>
          {blogs.map(blog =>
            <Blog key={blog.id} blog={blog} />
          )}
        </div>
      )}

      {user && (
        <p>
          <button onClick={handleLogout} data-testid="logout">Logout</button>
        </p>
      )}
    </div>
  )
}

export default App