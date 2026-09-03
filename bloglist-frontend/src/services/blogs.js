import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null

const setToken = newToken => {
  token = `Bearer ${newToken}`
}

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}


const create = async newObject => {
    const config = {
        headers: { Authorization: token }
    }
    const response = await axios.post(baseUrl, newObject, config);
    return response.data
    // kun non-async::: 
    // const request = axios.....
    // return request.then(response => response.data);
}

const update = (id, newObject) => {
    /*const config = {
        headers: { Authorization: token }
    }*/
    //const request = axios.put(`${baseUrl}/${id}`, newObject, config);
    const request = axios.put(`${baseUrl}/${id}`, newObject);
    return request.then(response => response.data);
}


export default { getAll, create, update, setToken }