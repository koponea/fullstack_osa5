//import { useState, useEffect, useRef } from 'react'
import { useState, useEffect } from 'react'
import Notification from './components/Notification.jsx'
import Blog from './components/Blog'
//import Togglable from './components/Togglable'
import blogService from './services/blogs'
import LoginForm from './components/LoginForm'
//import BlogForm from './components/BlogForm'

import loginService from './services/login'
import logger from '../utils/logger'
import { omit } from 'lodash'
//import { omit, toString } from 'lodash'
import { useNavigate } from 'react-router-dom'

import {
  Routes, Route, NavLink, Link,
  useMatch
} from 'react-router-dom'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [errorMessage, setErrorMessage] = useState(null) // !!??
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  //const [url, setUrl] = useState('')
  //const [title, setTitle] = useState('')
  //const [author, setAuthor] = useState('')
  const [user, setUser] = useState(null)
  //const [loginVisible, setLoginVisible] = useState(false)

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

  //const blogFormRef = useRef()
  //const blogRef = useRef()

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

  /*
  const addBlog = async (event) => {
    event.preventDefault()
    console.log('creator:', user.name)
    const blogObject = {
      title, author, url, user: user.id
    }
    blogFormRef.current.toggleVisibility() // a bitof hacky to call...
    const receivedBlog = await blogService.create(blogObject)
    try {
      logger.debug(receivedBlog)
      notifyUser(`a new blog ${title} by ${author} added`)
      receivedBlog.creator = user.name
      receivedBlog.creatorUname = user.username
      setBlogs(blogs.concat(receivedBlog).sort((a, b) => b.likes - a.likes))
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
    */

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
      navigate('/')
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
      navigate('/')
      setUser(null)
      setUsername('')
      setPassword('')
    } catch (error) {
      notifyUserOfError(`problem on removing credentials, ${error}`)
    }
  }

  const handleDelete = async (blog) => {
    console.log('delete clicked on', blog.id)
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author} ?`)) {

      try {
        const status = await blogService.destroy(blog.id)
        console.log('Delete blog promise fulfilled', blog.title, status)
        if ([200, 204, 404].includes(status)) {
          console.log('Remove from fe', blog.id)
          navigate('/')
          setBlogs(blogs.filter(b => b.id !== blog.id))
          notifyUser(`Deleted ${blog.title}`)
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
    } else {
      console.log(`id ${blog.id}: ${blog.title} delete canceled`)
      notifyUser(`Delete of ${blog.title} canceled`)
    }
  }

  /*
  const blogForm = () => (
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
  )*/

  //const hideWhenVisible = { display: loginVisible ? 'none' : '' }
  //const showWhenVisible = { display: loginVisible ? '' : 'none' }

  const login = () => (
    <div>
      {/*<div style={showWhenVisible}>
        <LoginForm
          password={password}
          username={username}
          handleLogin={handleLogin}
          handlePassword={({ target }) => setPassword(target.value)}
          handleUsername={({ target }) => setUsername(target.value)}
        />
        <button onClick={() => setLoginVisible(false)}>cancel</button>
      </div>*/}
      {<div>
        <h2>log into application</h2>
        <LoginForm
          password={password}
          username={username}
          handleLogin={handleLogin}
          handlePassword={({ target }) => setPassword(target.value)}
          handleUsername={({ target }) => setUsername(target.value)}
        />
      </div>}
    </div>
  )

  const blogsListing = (blogs) => (
    <div>
      <h2>blogs</h2>
      {blogs.map((blog) =>
        <li key={blog.id}>
          <Link to={`/blogs/${blog.id}`}>
            {blog.title} by {blog.author}
          </Link>
        </li>
        /*<Blog
          key={blog.id}
          blog={blog}
          blogRef={blogRef}
          onLike={() => handleLike(blog)}
          onDelete={() => handleDelete(blog)}
          showDeleteButton={{ display: user && user.username === blog.creatorUname ? '' : 'none' }}
          showLikeButton={{ display: user ? '' : 'none' }}
        />*/
      )}
    </div>
  )

  // kun url vaihtuu addressbarissa (App renders), jos url muotoa:
  const match = useMatch('/blogs/:id')
  const blog = match
    ? blogs.find(note => note.id === match.params.id)
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

      <nav>
        <NavLink style={padding} to="/">blogs</NavLink>
        <NavLink style={padding} to="/login">{
          (!user)
            ? 'login'
            : (<button onClick={handleLogout} data-testid="logout">logout</button>)
        }
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={blogsListing(blogs)} />
        <Route path="/login" element={!user && login()} />
        <Route path="/blogs/:id" element={
          <Blog blog={blog}
            onLike={() => handleLike(blog)}
            onDelete={() => handleDelete(blog)}
            showDeleteButton={{ display: (blog && user) && (user.username === blog.creatorUname) ? '' : 'none' }}
            showLikeButton={{ display: user ? '' : 'none' }}
          />
        } />
      </Routes>

      {/*!user && (
        <div>
          <h2>log into application</h2>
          {<div style={hideWhenVisible}>
            <button onClick={() => setLoginVisible(true)}>log in</button>
          </div>
          loginForm()}

        </div>)
      */}

      {/*user && (
        <div>
          {<h2>blogs</h2>}

          {<div>{user.name} logged in}
          {(<button onClick={handleLogout} data-testid="logout">logout</button>)}
          {</div>}
          {//blogForm()
          }
        </div>
      )*/}
    </div>
  )
  //}
}

export default App