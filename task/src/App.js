import { useState, useEffect, Fragment } from 'react';
import { getPosts, createPost, updatePost, deletePost, toggleLike, addComment } from './api/posts';
import { login, register, getUser, setAuth, clearAuth } from './api/auth';
import { useTheme } from './context/ThemeContext';
import './App.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const emptyForm = { title: '', content: '', username: '', tags: '' };

function App() {
  const { dark, toggle } = useTheme();
  const [user, setUser] = useState(getUser());
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [authTab, setAuthTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });
  const [authSuccess, setAuthSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [commentText, setCommentText] = useState({});

  const totalPages = Math.ceil(total / 5) || 1;

  const loadPosts = async (p = page, s = search) => {
    setLoading(true);
    setError('');
    try {
      const data = await getPosts(p, s, !!user);
      if (data.message && !data.posts) {
        setError(data.message);
        setPosts([]);
        setTotal(0);
      } else {
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) loadPosts(page, search); }, [page, search, user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setAuthSuccess('');
    try {
      if (authTab === 'login') {
        const email = (loginForm.email || '').trim();
        const pwd = loginForm.password || '';
        if (!email || !pwd) {
          setError('Email and password required');
          return;
        }
        const res = await login(email, pwd);
        if (res.message) {
          setError(res.message);
          return;
        }
        setAuth(res.token, res.user);
        setUser(res.user);
        setLoginForm({ email: '', password: '' });
      } else {
        const res = await register(registerForm.username, registerForm.email, registerForm.password);
        if (res.message) {
          setError(res.message);
          return;
        }
        setAuthSuccess('Registration successful. Please log in.');
        setAuthTab('login');
        setLoginForm({ email: '', password: '' });
        setRegisterForm({ username: '', email: '', password: '' });
      }
    } catch (e) {
      setError('Auth failed');
    }
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setPosts([]);
    setTotal(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      setError('Title required');
      return;
    }
    setError('');
    try {
      const tags = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      let res;
      if (editingId) {
        res = await updatePost(editingId, { ...form, tags }, imageFile);
      } else {
        res = await createPost({ ...form, tags }, imageFile);
      }
      if (res && res.message && !res._id) {
        setError(res.message);
        return;
      }
      if (editingId) setEditingId(null);
      setForm(emptyForm);
      setImageFile(null);
      loadPosts(page, search);
    } catch (e) {
      setError(e.message || (editingId ? 'Failed to update' : 'Failed to create post'));
    }
  };

  const handleUpdate = (post) => {
    setForm({
      title: post.title || '',
      content: post.content || '',
      username: '',
      tags: post.tags?.length ? post.tags.join(', ') : ''
    });
    setImageFile(null);
    setEditingId(post._id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      setError(e.message || 'Failed to delete');
    }
  };

  const handleLike = async (id) => {
    if (!user) return;
    try {
      const updated = await toggleLike(id);
      setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, likes: updated.likes || p.likes } : p)));
    } catch (e) {
      setError('Failed to like');
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!user || !text) return;
    try {
      const updated = await addComment(postId, text);
      setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
      setCommentText((c) => ({ ...c, [postId]: '' }));
    } catch (e) {
      setError('Failed to add comment');
    }
  };

  const isAuthor = (post) => user && post.author && String(post.author._id || post.author) === String(user._id);
  const isLiked = (post) => user && post.likes?.some((u) => (u._id || u) === user._id);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mini Blog</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button type="button" className="theme-toggle" onClick={toggle} title={dark ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          {user && (
            <span className="auth-badge">
              {user.username}
              <button type="button" onClick={handleLogout}>Logout</button>
            </span>
          )}
        </div>
      </header>

      <main className="container">
        {!user ? (
          <div className="auth-form">
            <div className="auth-tabs">
              <button
                type="button"
                className={authTab === 'login' ? 'active' : ''}
                onClick={() => { setAuthTab('login'); setError(''); setAuthSuccess(''); }}
              >
                Login
              </button>
              <button
                type="button"
                className={authTab === 'register' ? 'active' : ''}
                onClick={() => { setAuthTab('register'); setError(''); setAuthSuccess(''); }}
              >
                Register
              </button>
            </div>
            {authSuccess && <p className="auth-success">{authSuccess}</p>}
            <form onSubmit={handleAuth}>
              {authTab === 'register' && (
                <input
                  placeholder="Username"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, username: e.target.value }))}
                  autoComplete="username"
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={authTab === 'login' ? loginForm.email : registerForm.email}
                onChange={(e) =>
                  authTab === 'login'
                    ? setLoginForm((f) => ({ ...f, email: e.target.value }))
                    : setRegisterForm((f) => ({ ...f, email: e.target.value }))
                }
                autoComplete="email"
                required
              />
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={authTab === 'login' ? loginForm.password : registerForm.password}
                  onChange={(e) =>
                    authTab === 'login'
                      ? setLoginForm((f) => ({ ...f, password: e.target.value }))
                      : setRegisterForm((f) => ({ ...f, password: e.target.value }))
                  }
                  autoComplete={authTab === 'login' ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              <button type="submit">{authTab === 'login' ? 'Login' : 'Register'}</button>
            </form>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="form">
              {editingId && (
                <p className="form-edit-msg">Editing post. <button type="button" onClick={handleCancelEdit} className="link-btn">Cancel</button></p>
              )}
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <textarea
                placeholder="Content"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
              <input
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              />
              <div className="file-wrap">
                {editingId && (() => {
                  const editingPost = posts.find((p) => p._id === editingId);
                  return editingPost?.image ? (
                    <div className="current-img-wrap">
                      <span className="current-img-label">Current image</span>
                      <img
                        src={editingPost.image.startsWith('http') ? editingPost.image : `${API}${editingPost.image}`}
                        alt="Current"
                        className="img-preview current-post-img"
                      />
                    </div>
                  ) : null;
                })()}
                <label className="file-label">
                  <span className="file-btn">{editingId ? 'Change image (optional)' : 'Choose image (optional)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="file-input"
                  />
                </label>
                {imageFile && (
                  <div className="img-preview-wrap">
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="img-preview"
                    />
                    <span className="file-name">{imageFile.name}</span>
                  </div>
                )}
              </div>
              <button type="submit">{editingId ? 'Update Post' : 'Create Post'}</button>
            </form>
          </>
        )}

        {user && (
          <div className="toolbar">
            <input
              placeholder="Search your posts (title, tags)"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        )}

        {error && <p className="error">{error}</p>}
        {loading && <p>Loading...</p>}

        {user ? (
          <>
            <div className="posts-table-wrap">
              {!loading && posts.length === 0 && <p>No posts yet. Create one above.</p>}
              {posts.length > 0 && (
                <table className="posts-table">
                  <thead>
                    <tr>
                      <th>Sr No</th>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Content</th>
                      <th>Tags</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((p, i) => (
                      <Fragment key={p._id}>
                        <tr>
                          <td>{(page - 1) * 5 + i + 1}</td>
                          <td className="cell-image">
                            {p.image ? (
                              <img
                                src={p.image.startsWith('http') ? p.image : `${API}${p.image}`}
                                alt="Post"
                                className="table-thumb"
                              />
                            ) : (
                              '–'
                            )}
                          </td>
                          <td>{p.title}</td>
                          <td className="cell-content">{p.content}</td>
                          <td>{p.tags?.length ? p.tags.join(', ') : '–'}</td>
                          <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="cell-actions">
                            {isAuthor(p) ? (
                              <>
                                <button type="button" onClick={() => handleUpdate(p)} className="update-btn">Update</button>
                                <button onClick={() => handleDelete(p._id)} className="delete">Delete</button>
                              </>
                            ) : (
                              <span className="text-muted">–</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="7" className="post-details-cell">
                            <div className="post-like-comments">
                              <button
                                type="button"
                                className={`like-btn ${isLiked(p) ? 'liked' : ''}`}
                                onClick={() => handleLike(p._id)}
                                disabled={!user}
                              >
                                ♥ Like {p.likes?.length || 0}
                              </button>
                              <div className="comments-block">
                                <h4 className="comments-heading">Comments ({p.comments?.length || 0})</h4>
                                {p.comments?.length > 0 && (
                                  <ul className="comments-list">
                                    {p.comments.map((c) => (
                                      <li key={c._id} className="comment-item">
                                        <strong>{c.author?.username || 'User'}</strong>
                                        <span className="comment-meta"> · {new Date(c.createdAt).toLocaleString()}</span>
                                        <span className="comment-text"> {c.text}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                {user && (
                                  <div className="comment-form">
                                    <input
                                      placeholder="Add a comment..."
                                      value={commentText[p._id] || ''}
                                      onChange={(e) => setCommentText((prev) => ({ ...prev, [p._id]: e.target.value }))}
                                    />
                                    <button type="button" onClick={() => handleComment(p._id)}>Post</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {(totalPages > 1 || total > 0) && (
          <div className="pagination">
            <span className="pagination-range">
              Showing {(page - 1) * 5 + 1}-{Math.min(page * 5, total)} of {total}
            </span>
            <button disabled={page <= 1} onClick={() => setPage((x) => x - 1)}>Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((x) => x + 1)}>Next</button>
          </div>
            )}
          </>
        ) : (
          <p className="posts-login-msg">Login to view and manage your posts.</p>
        )}
      </main>
    </div>
  );
}

export default App;
