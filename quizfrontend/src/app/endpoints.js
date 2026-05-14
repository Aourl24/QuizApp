import axios from 'axios'
import Cookies from 'js-cookie'

//const api_host = '127.0.0.1:8000'
const api_host = 'quizzify.pythonanywhere.com'

export const endpoint    = `https://${api_host}/`
export const endpath     = endpoint.trim().replace(/\/$/, '')
export const wsEndpoint  = `ws:/${api_host}/quizroom/`

// Set base URL once — all axios calls use this automatically
axios.defaults.baseURL = endpoint

export const api = [
  { name: 'signup',         url: 'signup/' },
  { name: 'login',          url: 'login/' },
  { name: 'checkuser',      url: 'checkuser/' },
  { name: 'profile',        url: 'userprofile/' },
  { name: 'createquestion', url: 'createquestion/' },
]

/**
 * getAuthHeaders — single place to build auth headers
 * Used by both getData and postData
 */
function getAuthHeaders(extra = {}) {
  const token = Cookies.get('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `JWT ${token}` } : {}),
    ...extra,
  }
}

/**
 * getData — authenticated GET request via api name
 */
export async function getData(name) {
  const path = api.find(x => x.name === name.trim())
  if (!path) throw new Error(`Unknown API name: ${name}`)
  const resp = await axios.get(path.url, { headers: getAuthHeaders() })
  return resp.data
}

/**
 * postData — authenticated POST request via api name
 */
export async function postData(name, data) {
  const path = api.find(x => x.name === name.trim())
  if (!path) throw new Error(`Unknown API name: ${name}`)
  try {
    const resp = await axios.post(path.url, data, { headers: getAuthHeaders() })
    return resp.data
  } catch (error) {
    return error
  }
}

/**
 * apiGet — authenticated GET to any raw URL (not in api list)
 * Use this for endpoints like getgame/5/1/
 */
export async function apiGet(url) {
  const resp = await axios.get(url, { headers: getAuthHeaders() })
  return resp.data
}

/**
 * apiPost — authenticated POST to any raw URL
 * Use this for endpoints like completegame/
 */
export async function apiPost(url, data) {
  const resp = await axios.post(url, data, { headers: getAuthHeaders() })
  return resp.data
}

export function joinPath(e) {
  if (e.startsWith('http')) return e
  return endpath + e
}
