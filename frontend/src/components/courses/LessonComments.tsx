import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { CornerDownRight, MessageSquare, Send } from 'lucide-react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';

type CommentUser = {
  id: number;
  name: string;
  email: string;
};

export type LessonComment = {
  id: number;
  content: string;
  lessonId: number;
  userId: number;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
};

type CommentNode = LessonComment & {
  replies: CommentNode[];
};

type LessonCommentsProps = {
  lessonId: number;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildTree(comments: LessonComment[]) {
  const nodes = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach((comment) => {
    nodes.set(comment.id, { ...comment, replies: [] });
  });

  comments.forEach((comment) => {
    const node = nodes.get(comment.id);
    if (!node) {
      return;
    }

    if (comment.parentId && nodes.has(comment.parentId)) {
      nodes.get(comment.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

type CommentFormProps = {
  lessonId: number;
  parentId?: number | null;
  placeholder: string;
  buttonLabel: string;
  onSuccess: () => void;
  onCancel?: () => void;
};

function CommentForm({ lessonId, parentId, placeholder, buttonLabel, onSuccess, onCancel }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim() || !token) {
      return;
    }

    setLoading(true);
    try {
      await api.post(`/lessons/${lessonId}/comments`, {
        content: content.trim(),
        parentId: parentId ?? null,
      });
      setContent('');
      onSuccess();
      onCancel?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={parentId ? 3 : 4}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {loading ? 'Enviando...' : buttonLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function CommentItem({
  comment,
  lessonId,
  activeReplyId,
  setActiveReplyId,
  onCreated,
}: {
  comment: CommentNode;
  lessonId: number;
  activeReplyId: number | null;
  setActiveReplyId: (id: number | null) => void;
  onCreated: () => void;
}) {
  const isReplying = activeReplyId === comment.id;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-sm">{comment.user.name}</p>
            <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveReplyId(isReplying ? null : comment.id)}
            className="text-xs font-medium text-primary hover:underline"
          >
            Responder
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>

      {isReplying && (
        <div className="pl-4 sm:pl-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <CornerDownRight className="h-4 w-4" />
            Respuesta
          </div>
          <CommentForm
            lessonId={lessonId}
            parentId={comment.id}
            placeholder="Escribe tu respuesta..."
            buttonLabel="Enviar respuesta"
            onSuccess={onCreated}
            onCancel={() => setActiveReplyId(null)}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="pl-4 sm:pl-6 space-y-3 border-l border-border ml-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              lessonId={lessonId}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
              onCreated={onCreated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LessonComments({ lessonId }: LessonCommentsProps) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setErrorMsg('');

    api
      .get(`/lessons/${lessonId}/comments`)
      .then((response) => {
        if (!cancelled) {
          setComments(response.data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMsg(error.response?.data?.error || 'No se pudieron cargar los comentarios.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lessonId, refreshKey]);

  const commentTree = useMemo(() => buildTree(comments), [comments]);

  const handleCreated = () => {
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-base sm:text-lg font-semibold">Comentarios de la lección</h3>
      </div>

      {token ? (
        <div className="rounded-2xl border border-border bg-secondary/20 p-4 sm:p-5">
          <CommentForm
            lessonId={lessonId}
            placeholder="Escribe un comentario para iniciar la conversación..."
            buttonLabel="Publicar comentario"
            onSuccess={handleCreated}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
          Inicia sesión para comentar y responder.
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando comentarios...</p>
      ) : errorMsg ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMsg}
        </div>
      ) : commentTree.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Todavía no hay comentarios. Sé el primero en escribir.
        </div>
      ) : (
        <div className="space-y-4">
          {commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              lessonId={lessonId}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
              onCreated={handleCreated}
            />
          ))}
        </div>
      )}

      {user && activeReplyId && (
        <button
          type="button"
          onClick={() => setActiveReplyId(null)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Cerrar respuesta activa
        </button>
      )}
    </div>
  );
}
