import axios from 'axios'
// import logger from '../../utils/logger'
const baseUrl = '/api/blogs'

let token = null

const setToken = newToken => {
    token = `Bearer ${newToken}`
}

const getAll = () => {
    const request = axios.get(baseUrl)

    return request.then(response => {
        return response.data
    })
}

const create = async newObject => {
    const config = {
        headers: { Authorization: token }
    }
    const response = await axios.post(baseUrl, newObject, config);
    return response.data
}

const update = async (id, newObject) => {
    /*const config = {
        headers: { Authorization: token }
    }*/
    const response = await axios.put(`${baseUrl}/${id}`, newObject);
    return response.data
}

const destroy = async (id) => {
    const config = {
        headers: { Authorization: token }
    }
    const response = await axios.delete(`${baseUrl}/${id}`, config);
    return response.status
}

export default { getAll, create, update, setToken, destroy }