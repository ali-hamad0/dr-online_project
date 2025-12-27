import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";

const API = "http://localhost:5000";

const Dashboard = ({ user }) => {
  const [postText, setPostText] = useState("");
  const [filter, setFilter] = useState("all");

  const [commentInput, setCommentInput] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = !!user && (user.role === "admin" || user.role === "doctor");

  const enrichPost = async (p) => {
    const [likesRes, commentsRes] = await Promise.all([
      fetch(`${API}/api/posts/${p.id}/likes/count`),
      fetch(`${API}/api/posts/${p.id}/comments`),
    ]);

    const likesData = await likesRes.json();
    const commentsData = await commentsRes.json();

    return {
      ...p,
      likesCount: likesData?.count || 0,
      comments: Array.isArray(commentsData) ? commentsData : [],
    };
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/posts`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load posts");

      const full = await Promise.all(data.map(enrichPost));
      setPosts(full);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadPosts();
    // eslint-disable-next-line
  }, [user]);

  if (!user) {
    return (
      <div className="dashboard">
        <header className="dash-header">
          <h1>Discussion Board</h1>
        </header>
        <p>‼️ Please login or register to join the discussion.</p>
      </div>
    );
  }

  const handlePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    try {
      const res = await fetch(`${API}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: user.name,
          role: user.role,
          text: postText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create post");

      setPostText("");
      await loadPosts();
    } catch (e) {
      alert(e.message);
    }
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditText(post.text);
  };

  // ✅ ADMIN/DOCTOR (or author) can SAVE edit → calls backend PUT
  const saveEdit = async () => {
    if (!editText.trim()) return;

    try {
      const res = await fetch(`${API}/api/posts/${editingPostId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role, // ✅ backend requireAdmin uses this
        },
        body: JSON.stringify({ text: editText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Failed to update post");

      setEditingPostId(null);
      setEditText("");
      await loadPosts();
    } catch (e) {
      alert(e.message);
    }
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditText("");
  };

  // ✅ ADMIN/DOCTOR can delete any post (author can also delete if you allow it in UI)
  const deletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      const res = await fetch(`${API}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "x-user-role": user.role, // ✅ backend requireAdmin uses this
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Failed to delete post");

      await loadPosts();
    } catch (e) {
      alert(e.message);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const likeRes = await fetch(`${API}/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: user.name }),
      });

      const likeData = await likeRes.json();
      if (!likeRes.ok) throw new Error(likeData?.error || "Like failed");

      if (likeData.liked === false) {
        await fetch(`${API}/api/posts/${postId}/like/${encodeURIComponent(user.name)}`, {
          method: "DELETE",
        });
      }

      await loadPosts();
    } catch (e) {
      alert(e.message);
    }
  };

  const addComment = async (postId) => {
    const text = commentInput[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`${API}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: user.name, text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add comment");

      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
      await loadPosts();
    } catch (e) {
      alert(e.message);
    }
  };

  const filteredPosts = filter === "all" ? posts : posts.filter((p) => p.role === filter);

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1>Discussion Board</h1>
        <p>
          Welcome <b>{user.name}</b> ({user.role})
        </p>
      </header>

      <form className="new-post-form" onSubmit={handlePost}>
        <textarea
          placeholder={user.role === "doctor" ? "Share medical advice or studies..." : "Ask a question..."}
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
        />
        <button type="submit" className="post-btn">
          Post
        </button>
      </form>

      <div className="filters">
        <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>
          All
        </button>
        <button onClick={() => setFilter("doctor")} className={filter === "doctor" ? "active" : ""}>
          Doctors
        </button>
        <button onClick={() => setFilter("patient")} className={filter === "patient" ? "active" : ""}>
          Patients
        </button>
      </div>

      <div className="posts-section">
        {loading ? <p>Loading posts...</p> : null}

        {!loading && filteredPosts.length === 0 ? (
          <p>No posts yet...</p>
        ) : (
          filteredPosts.map((post) => {
            const canEdit = isAdmin || post.author === user.name; // ✅ admin/doctor OR owner
            const canDelete = isAdmin; // ✅ only admin/doctor (change to "isAdmin || post.author===user.name" if you want)

            return (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <b>{post.author}</b>
                  <span className={`tag ${post.role}`}>{post.role}</span>
                </div>

                {editingPostId === post.id ? (
                  <div className="edit-box">
                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
                    <div className="edit-actions">
                      <button onClick={saveEdit}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="post-text">{post.text}</p>
                )}

                <div className="post-footer">
                  <small>{post.date}</small>
                  <button onClick={() => toggleLike(post.id)}>❤️ {post.likesCount}</button>

                  {canEdit ? (
                    <button onClick={() => startEdit(post)} disabled={editingPostId && editingPostId !== post.id}>
                      Edit
                    </button>
                  ) : null}

                  {canDelete ? (
                    <button onClick={() => deletePost(post.id)} className="danger-btn">
                      Delete
                    </button>
                  ) : null}
                </div>

                <div className="comments">
                  {post.comments.map((c) => (
                    <p key={c.id} className="comment">
                      <b>{c.author}</b>: {c.text}
                    </p>
                  ))}

                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentInput[post.id] || ""}
                    onChange={(e) =>
                      setCommentInput({
                        ...commentInput,
                        [post.id]: e.target.value,
                      })
                    }
                  />
                  <button onClick={() => addComment(post.id)}>Send</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Dashboard;
