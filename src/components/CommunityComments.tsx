import React, { useState, useEffect } from 'react';
import { Heart, MessageSquarePlus, Trash2, MessageSquare, Trophy, Send } from 'lucide-react';
import {
  type AudioComment as CommentItem,
  fetchComments,
  postComment,
  setCommentLiked,
  deleteComment,
} from '../lib/apiClient';

const sortByLikes = (list: CommentItem[]) =>
  [...list].sort((a, b) => b.likes - a.likes || b.timestamp - a.timestamp);

interface CommunityCommentsProps {
  garbaId: string;
  garbaTitle: string;
}

export const CommunityComments: React.FC<CommunityCommentsProps> = ({
  garbaId,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [userName, setUserName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadComments();
    resetForm();
  }, [garbaId]);

  const resetForm = () => {
    setCommentText('');
    setShowForm(false);
  };

  const loadComments = async () => {
    try {
      setComments(sortByLikes(await fetchComments(garbaId)));
    } catch (err) {
      console.warn('Failed to load community comments:', err);
      setComments([]);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!commentText.trim()) {
      alert('Please enter a comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await postComment(garbaId, {
        authorName: userName.trim() || 'Devotee',
        commentText: commentText.trim(),
      });
      setComments((prev) => sortByLikes([created, ...prev]));
      resetForm();
    } catch (err) {
      alert(`Could not submit comment: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    const target = comments.find((c) => c.id === commentId);
    if (!target) return;
    try {
      const likes = await setCommentLiked(commentId, !target.userLiked);
      setComments((prev) =>
        sortByLikes(prev.map((c) => (c.id === commentId ? { ...c, likes, userLiked: !target.userLiked } : c)))
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Delete your comment?')) {
      try {
        await deleteComment(commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (err) {
        alert(`Could not delete comment: ${(err as Error).message}`);
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto my-10 space-y-8">
      {/* 1. Add Comment Section */}
      <div className="bg-[#500000] border border-[#D4AF37]/50 rounded-2xl p-6 shadow-xl text-center relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif-title text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              DEVOTEE COMMENTS & THOUGHTS
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#3B1111] text-[#D4AF37] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
            {comments.length}
          </span>
        </div>

        {!showForm ? (
          <div className="py-2 space-y-3">
            <p className="text-xs text-[#FFF8ED]/80 font-sans">
              Share your feelings, devotion, or memories associated with this Garba.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#3B1111] font-bold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Add a Comment</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitComment} className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif-title font-bold text-[#D4AF37]">
                WRITE YOUR COMMENT
              </span>
              <button
                type="button"
                onClick={resetForm}
                className="text-[11px] text-[#FFF8ED]/60 hover:text-[#FFF8ED]"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Name (optional)"
                className="w-full bg-[#3B1111] text-[#FFF8ED] placeholder-[#FFF8ED]/40 px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 text-xs outline-none focus:border-[#D4AF37]"
              />
              <textarea
                rows={3}
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts about this Garba..."
                className="w-full bg-[#3B1111] text-[#FFF8ED] placeholder-[#FFF8ED]/40 p-3 rounded-xl border border-[#D4AF37]/40 text-xs outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#3B1111] font-bold text-xs shadow hover:brightness-105 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </form>
        )}
      </div>

      {/* 2. Comments List */}
      <div className="space-y-3">
        {comments.length > 0 ? (
          comments.map((comment, index) => {
            const isTopRanked = index === 0 && comment.likes > 0;

            return (
              <div
                key={comment.id}
                className="bg-[#500000] border border-[#D4AF37]/40 rounded-xl p-4 shadow-md space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#3B1111] border border-[#D4AF37]/60 flex items-center justify-center text-[#D4AF37] font-bold text-xs shadow-inner">
                      {comment.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-xs text-[#FFF8ED]">{comment.userName}</h5>
                        {isTopRanked && (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-[#D4AF37] text-[#3B1111] font-bold px-1.5 py-0.5 rounded">
                            <Trophy className="w-2.5 h-2.5" />
                            Featured Comment
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#FFF8ED]/50 font-mono">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                        comment.userLiked
                          ? 'bg-[#B71C1C] text-[#FFF8ED] border-[#D4AF37]'
                          : 'bg-[#3B1111] text-[#FFF8ED]/70 border-[#D4AF37]/30 hover:border-[#D4AF37]'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${comment.userLiked ? 'fill-current text-[#D4AF37]' : ''}`} />
                      <span>{comment.likes}</span>
                    </button>

                    {comment.isCurrentUser && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 text-red-300 hover:text-red-100"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#FFF8ED]/90 font-sans leading-relaxed pt-1">
                  {comment.commentText}
                </p>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 bg-[#500000]/60 rounded-xl border border-[#D4AF37]/30 text-[#FFF8ED]/60 text-xs">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};
