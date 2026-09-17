import { useState, useEffect } from 'react'
import Notification from './components/Notification.jsx'
import Blog from './components/Blog'
import Login from './components/Login'
import BlogForm from './components/BlogForm'
import BlogList from './components/BlogList'

import blogService from './services/blogs'
import loginService from './services/login'
import logger from '../utils/logger'
import { omit } from 'lodash'

import { Routes, Route, NavLink, useMatch, useNavigate,
} from 'react-router-dom'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [user, setUser] = useState(null)

  const navigate = useNavigate()

  const eventHandler = receivedBlogzz => {
    // rekisteroi tapahtumankasittelija get-operaatiolle
    receivedBlogzz.forEach(el => {
      console.log(user)
      console.log(el.user.id, el.user.name)
      el.creator = el.user ? el.user.name : ''
      el.creatorUname = el.user ? el.user.username : ''
    })
    receivedBlogzz = receivedBlogzz.sort((a, b) => b.likes - a.likes)
    setBlogs(receivedBlogzz)
  }

  const notifyUserOfError = msg => {
    setErrorMessage(msg)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  const notifyUser = msg => {
    setNotificationMessage(msg)
    setTimeout(() => {
      setNotificationMessage(null)
    }, 5000)
  }

  useEffect(() => {
    logger.debug('effectissa, hookissa')
    blogService
      .getAll()
      .then(eventHandler)
      .catch(error =>
        notifyUserOfError(`The blogs fetch not successful, ${error}`)
      )
  }, []) // no dep array? must hace this, otherwise starts rolling eventhandler

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const addBlog = async (event) => {
    event.preventDefault()
    console.log('creator:', user.name)
    const blogObject = {
      title, author, url, user: user.id
    }
    //blogFormRef.current.toggleVisibility() // a bitof hacky to call...
    const receivedBlog = await blogService.create(blogObject)

    try {
      logger.debug(receivedBlog)
      notifyUser(`a new blog ${title} by ${author} added`)
      receivedBlog.creator = user.name
      receivedBlog.creatorUname = user.username

      setBlogs(blogs.concat(receivedBlog).sort((a, b) => b.likes - a.likes))
      navigate('/')
      setUrl('')
      setAuthor('')
      setTitle('')
    }
    catch (error) {
      notifyUserOfError(
        `the blog could be not be created, ${error}`
      )
    }
  }

  const handleLike = (event) => {
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
            .concat({ ...updated, creator: event.creator, creatorUname: event.user.creatorUname })
            .sort((a, b) => b.likes - a.likes)
        )
        notifyUser(`the blog ${event.title} got a like`)
      })
      .catch(error =>
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
      navigate('/')
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

      navigate('/')
      setUser(null)
      setUsername('')
      setPassword('')
    } catch (error) {
      notifyUserOfError(`problem on removing credentials, ${error}`)
    }
  }

  const handleDelete = async blog => {
    console.log('delete clicked on', blog.id)
    try {
      const status = await blogService.destroy(blog.id)
      if ([200, 204, 404].includes(status)) {
        setBlogs(blogs.filter(b => b.id !== blog.id))
        notifyUser(`Deleted ${blog.title}`)
        navigate('/') // linkasee siis aina takaisin listasivulle
      }
    } catch (error) {
      if (error.status === 404) {
        navigate('/')
        notifyUser('already deleted')
      }
      else if (error.status === 403)
        notifyUserOfError('delete not authorized')
      else
        notifyUserOfError(`could not delete entry, ${error}`)
    }
  }

  const blogForm = () => (
    <>
      <BlogForm
        url={url}
        author={author}
        title={title}
        setTitle={setTitle}
        setAuthor={setAuthor}
        setUrl={setUrl}
        addBlog={addBlog}
      />
    </>
  )

  // kun url vaihtuu addressbarissa (App renders), jos url muotoa:
  const match = useMatch('/blogs/:id')
  const blog = match
    ? blogs.find(blog => blog.id === match.params.id)
    : null

  // NavLink works with the isActive, Link not
  const padding = ({ isActive }) => ({
    padding: 5,
    border: isActive ? '4px solid green' : '4px solid transparent',
  })

  return (
    <div>
      <Notification message={errorMessage} />
      <Notification message={notificationMessage} notificationClass='notification' />

      <nav data-testid='navigation-bar'>
        <NavLink data-testid='nav-blogs' style={padding} to="/">blogs</NavLink>
        {user && (<NavLink data-testid='nav-create' style={padding} to="/create">new blog</NavLink>)}
        <NavLink data-testid='nav-login' style={padding} to="/login">{
          (!user)
            ? 'login'
            : (<button onClick={handleLogout} data-testid="nav-logout-button">logout</button>)
        }
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<BlogList blogs={blogs} />} />
        <Route path="/create" element={user && blogForm()} />
        <Route path="/login" element={!user && <Login
          username={username}
          password={password}
          handleLogin={handleLogin}
          handleUsername={({ target }) => setUsername(target.value)}
          handlePassword={({ target }) => setPassword(target.value)}
        />
        } />
        <Route path="/blogs/:id" element={
          <Blog blog={blog}
            onLike={() => handleLike(blog)}
            onDelete={handleDelete}
            showDeleteButton={{ display: (blog && user) && (user.username === blog.creatorUname) ? '' : 'none' }}
            showLikeButton={{ display: user ? '' : 'none' }}
            notifyUser={notifyUser}
          />
        } />

      </Routes>
    </div>
  )
}

export default App