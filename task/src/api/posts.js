const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const getToken = () => localStorage.getItem('miniblog-token');

const authHeaders = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const parseRes = async (r) => {
  const contentType = r.headers.get('content-type') || '';
  const text = await r.text();
  if (contentType.includes('application/json')) {
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return { message: 'Invalid response from server' };
    }
  }
  if (r.ok) {
    return { message: 'Server returned non-JSON. Check REACT_APP_API_URL (e.g. http://localhost:5000) and that the backend is running.' };
  }
  return { message: r.status === 404 ? 'Not found. Is the backend running on ' + API + '?' : 'Server error (' + r.status + ')' };
};

export const getPosts = (page = 1, search = '', mine = false) => {
  const params = new URLSearchParams({ page });
  if (search) params.set('search', search);
  if (mine) params.set('mine', '1');
  const opts = { headers: mine ? authHeaders() : {} };
  return fetch(`${API}/api/posts?${params}`, opts).then(async (r) => {
    const data = await parseRes(r);
    if (!r.ok && data.message) return data;
    return data;
  });
};

export const createPost = (data, imageFile = null) => {
  if (imageFile) {
    const fd = new FormData();
    fd.append('title', data.title);
    fd.append('content', data.content || '');
    fd.append('tags', JSON.stringify(data.tags || []));
    fd.append('image', imageFile);
    return fetch(`${API}/api/posts`, {
      method: 'POST',
      headers: authHeaders(),
      body: fd
    }).then((r) => parseRes(r));
  }
  return fetch(`${API}/api/posts`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, tags: data.tags || [] })
  }).then((r) => parseRes(r));
};

export const updatePost = (id, data, imageFile = null) => {
  if (!id) return Promise.resolve({ message: 'Post ID missing' });
  if (imageFile) {
    const fd = new FormData();
    fd.append('title', data.title);
    fd.append('content', data.content || '');
    fd.append('tags', JSON.stringify(data.tags || []));
    fd.append('image', imageFile);
    return fetch(`${API}/api/posts/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: fd
    }).then((r) => parseRes(r));
  }
  return fetch(`${API}/api/posts/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, tags: data.tags || [] })
  }).then((r) => parseRes(r));
};

export const deletePost = (id) =>
  fetch(`${API}/api/posts/${id}`, { method: 'DELETE', headers: authHeaders() }).then((r) => parseRes(r));

export const toggleLike = (id) =>
  fetch(`${API}/api/posts/${id}/like`, { method: 'POST', headers: authHeaders() }).then((r) => parseRes(r));

export const addComment = (postId, text) =>
  fetch(`${API}/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  }).then((r) => parseRes(r));
