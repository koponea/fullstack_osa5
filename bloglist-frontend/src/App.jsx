import { useState, useEffect, useRef } from 'react'
import Notification from './components/Notification.jsx'
import Blog from './components/Blog'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import LoginForm from "./components/LoginForm"
import BlogForm from "./components/BlogForm"
import loginService from "./services/login"
import logger from "../utils/logger"
import { omit } from 'lodash'

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
  const [loginVisible, setLoginVisible] = useState(false)

  const eventHandler = receivedBlogzz => {
    // rekisteroi tapahtumankasittelija get-operaatiolle
    receivedBlogzz.forEach(el => el.creator =  el.user ? el.user.name : '')
    receivedBlogzz = receivedBlogzz.sort((a,b) => b.likes - a.likes);
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

  const blogFormRef = useRef()
  const blogRef = useRef()

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
    blogFormRef.current.toggleVisibility() // a bitof hacky to  call...
    blogService
      .create(blogObject)
      .then(receivedBlog => {
        logger.debug(receivedBlog)
        notifyUser(`a new blog ${title} by ${author} added`)
        setBlogs(blogs.concat(receivedBlog).sort((a,b) => b.likes - a.likes))
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

  const handleOnLike = (event) => {
    blogService
      .update(event.id,
        { ...omit(event, ['creator']), likes: event.likes + 1 })
      .then(updated => {
            // the blogs will change orders. should sort,
            // use splitting according to find and findindex
            // and concat if wanted add-order. Though Rest.
            setBlogs(
              blogs
                .filter(b => b.id !== updated.id)
                .concat({...updated, creator: event.creator})
                .sort((a,b) => b.likes - a.likes)
            )
            notifyUser(`the blog ${event.title} got a like`)
          })
      .catch(error => +
        notifyUserOfError(
          `The blog could be not be liked, ${error}`
        )
      )
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

  //const loginForm = () => {
  const hideWhenVisible = { display: loginVisible ? 'none' : '' }
  const showWhenVisible = { display: loginVisible ? '' : 'none' }
  return (
    <div>
      {!user && (<div>
        <h2>log into application</h2>
        <Notification message={errorMessage} />

        <div style={hideWhenVisible}>
          <button onClick={() => setLoginVisible(true)}>log in</button>
        </div>

        <div style={showWhenVisible}>
          <LoginForm
            password={password}
            username={username}
            handleLogin={handleLogin}
            handlePassword={handlePassword}
            handleUsername={handleUsername}
          />
          <button onClick={() => setLoginVisible(false)}>cancel</button>
        </div>

      </div>)
      }

      {user && (
        <div>
          <h2>blogs</h2>
          <Notification message={errorMessage} />
          <Notification message={notificationMessage} notificationClass='notification' />
          <div>{user.name} logged in
              <button onClick={handleLogout} data-testid="logout">logout</button>
          </div>
          <Togglable buttonLabel='create new blog' ref={blogFormRef}>
            <BlogForm
              url={url}
              author={author}
              title={title}
              setTitle={setTitle}
              setAuthor={setAuthor}
              setUrl={setUrl}
              addBlog={addBlog}
            />
          </Togglable>
        </div>
      )}

      {user && (
        <div>
          {blogs.map(blog =>
            <Blog
              key={blog.id}
              blog={blog}
              blogRef={blogRef}
              onLikeClick={()=> handleOnLike(blog)} />
          )}
        </div>
      )}
    </div>
  )
  //}
}

export default App