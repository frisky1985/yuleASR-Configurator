import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const createQuestionSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
});

const updateQuestionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

const createAnswerSchema = z.object({
  content: z.string().min(1),
});

const updateAnswerSchema = z.object({
  content: z.string().min(1),
});

const voteSchema = z.object({
  targetType: z.enum(['question', 'answer']),
  targetId: z.number(),
  voteType: z.enum(['up', 'down']),
});

function addScore(userId: number, points: number) {
  // Fire-and-forget score update
  import('../lib/prisma.js').then(({ prisma }) => {
    prisma.user
      .update({
        where: { id: userId },
        data: { score: { increment: points } },
      })
      .catch(() => {});
  });
}

export async function qaRoutes(app: FastifyInstance) {
  // GET /api/questions — list with pagination, search, tag filter, status filter, sorting
  app.get('/questions', async request => {
    const { prisma } = await import('../lib/prisma.js');
    const query = request.query as {
      page?: string;
      pageSize?: string;
      search?: string;
      tag?: string;
      status?: string;
      sort?: string;
    };

    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize || '20', 10) || 20));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (query.status && ['open', 'resolved', 'closed'].includes(query.status)) {
      where.status = query.status;
    }

    const allQuestions = await prisma.question.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        _count: { select: { answers: true } },
      },
      orderBy:
        query.sort === 'views'
          ? { viewCount: 'desc' }
          : query.sort === 'likes'
            ? { likeCount: 'desc' }
            : query.sort === 'answers'
              ? { answerCount: 'desc' }
              : { createdAt: 'desc' },
    });

    // Apply JS-side filtering for search and tags (SQLite doesn't support array contains)
    let filtered = allQuestions;
    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter(
        (p: any) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
      );
    }
    if (query.tag) {
      filtered = filtered.filter((p: any) => {
        const tags: string[] = JSON.parse(p.tags);
        return tags.includes(query.tag!);
      });
    }

    const total = filtered.length;
    const paged = filtered.slice(skip, skip + pageSize);

    return {
      data: paged.map((p: any) => ({
        ...p,
        tags: JSON.parse(p.tags),
        answerCount: p._count.answers,
        _count: undefined,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // GET /api/questions/:id — detail with answers
  app.get('/questions/:id', async request => {
    const { prisma } = await import('../lib/prisma.js');
    const { id } = request.params as { id: string };
    const questionId = parseInt(id, 10);
    if (isNaN(questionId)) {
      throw { statusCode: 400, message: 'Invalid question ID' };
    }

    // Increment view count
    await prisma.question.update({
      where: { id: questionId },
      data: { viewCount: { increment: 1 } },
    });

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        answers: {
          include: {
            author: { select: { id: true, username: true, avatar: true } },
          },
          orderBy: [{ isAccepted: 'desc' }, { likeCount: 'desc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!question) {
      throw { statusCode: 404, message: 'Question not found' };
    }

    return {
      ...question,
      tags: JSON.parse(question.tags),
    };
  });

  // POST /api/questions — ask a question
  app.post('/questions', { onRequest: [(app as any).authenticate] }, async request => {
    const parsed = createQuestionSchema.safeParse(request.body);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid input' };
    }
    const { prisma } = await import('../lib/prisma.js');
    const user = request.user as { id: number };

    const question = await prisma.question.create({
      data: {
        ...parsed.data,
        tags: JSON.stringify(parsed.data.tags),
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
    });

    // Score: +2 for asking a question
    addScore(user.id, 2);

    return { ...question, tags: parsed.data.tags };
  });

  // PUT /api/questions/:id — edit question
  app.put('/questions/:id', { onRequest: [(app as any).authenticate] }, async request => {
    const parsed = updateQuestionSchema.safeParse(request.body);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid input' };
    }
    const { prisma } = await import('../lib/prisma.js');
    const { id } = request.params as { id: string };
    const questionId = parseInt(id, 10);
    const user = request.user as { id: number };

    const existing = await prisma.question.findUnique({ where: { id: questionId } });
    if (!existing) throw { statusCode: 404, message: 'Question not found' };
    if (existing.authorId !== user.id) throw { statusCode: 403, message: 'Forbidden' };

    const data: any = { ...parsed.data };
    if (data.tags) data.tags = JSON.stringify(data.tags);

    const question = await prisma.question.update({
      where: { id: questionId },
      data,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
    });

    return { ...question, tags: JSON.parse(question.tags) };
  });

  // DELETE /api/questions/:id — delete question
  app.delete('/questions/:id', { onRequest: [(app as any).authenticate] }, async request => {
    const { prisma } = await import('../lib/prisma.js');
    const { id } = request.params as { id: string };
    const questionId = parseInt(id, 10);
    const user = request.user as { id: number };

    const existing = await prisma.question.findUnique({ where: { id: questionId } });
    if (!existing) throw { statusCode: 404, message: 'Question not found' };
    if (existing.authorId !== user.id) throw { statusCode: 403, message: 'Forbidden' };

    await prisma.question.delete({ where: { id: questionId } });
    return { message: 'Question deleted' };
  });

  // POST /api/questions/:id/answers — answer a question
  app.post('/questions/:id/answers', { onRequest: [(app as any).authenticate] }, async request => {
    const parsed = createAnswerSchema.safeParse(request.body);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid input' };
    }
    const { prisma } = await import('../lib/prisma.js');
    const { id } = request.params as { id: string };
    const questionId = parseInt(id, 10);
    const user = request.user as { id: number };

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw { statusCode: 404, message: 'Question not found' };
    if (question.status === 'closed') throw { statusCode: 400, message: 'Question is closed' };

    const answer = await prisma.answer.create({
      data: {
        content: parsed.data.content,
        questionId,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
    });

    await prisma.question.update({
      where: { id: questionId },
      data: { answerCount: { increment: 1 } },
    });

    return answer;
  });

  // PUT /api/answers/:id — edit answer
  app.put('/answers/:id', { onRequest: [(app as any).authenticate] }, async request => {
    const parsed = updateAnswerSchema.safeParse(request.body);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid input' };
    }
    const { prisma } = await import('../lib/prisma.js');
    const { id } = request.params as { id: string };
    const answerId = parseInt(id, 10);
    const user = request.user as { id: number };

    const existing = await prisma.answer.findUnique({ where: { id: answerId } });
    if (!existing) throw { statusCode: 404, message: 'Answer not found' };
    if (existing.authorId !== user.id) throw { statusCode: 403, message: 'Forbidden' };

    const answer = await prisma.answer.update({
      where: { id: answerId },
      data: { content: parsed.data.content },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
    });

    return answer;
  });

  // POST /api/answers/:id/accept — accept answer (question author only)
  app.post('/answers/:id/accept', { onRequest: [(app as any).authenticate] }, async request => {
    const { prisma } = await import('../lib/prisma.js');
    const { id } = request.params as { id: string };
    const answerId = parseInt(id, 10);
    const user = request.user as { id: number };

    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: { question: true },
    });
    if (!answer) throw { statusCode: 404, message: 'Answer not found' };
    if (answer.question.authorId !== user.id)
      throw { statusCode: 403, message: 'Only the question author can accept an answer' };
    if (answer.question.status === 'closed')
      throw { statusCode: 400, message: 'Question is closed' };

    // Un-accept any previously accepted answer
    await prisma.answer.updateMany({
      where: { questionId: answer.questionId, isAccepted: true },
      data: { isAccepted: false },
    });

    // Accept this answer
    await prisma.answer.update({
      where: { id: answerId },
      data: { isAccepted: true },
    });

    await prisma.question.update({
      where: { id: answer.questionId },
      data: { status: 'resolved', acceptedAnswerId: answerId },
    });

    // Score: +15 for having answer accepted
    addScore(answer.authorId, 15);

    return { message: 'Answer accepted' };
  });

  // POST /api/vote — vote on a question or answer
  app.post('/vote', { onRequest: [(app as any).authenticate] }, async request => {
    const parsed = voteSchema.safeParse(request.body);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid input' };
    }
    const { prisma } = await import('../lib/prisma.js');
    const user = request.user as { id: number };
    const { targetType, targetId, voteType } = parsed.data;

    // Check existing vote
    const existingVote = await prisma.qAVote.findUnique({
      where: { targetType_targetId_userId: { targetType, targetId, userId: user.id } },
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off — remove vote
        await prisma.qAVote.delete({ where: { id: existingVote.id } });
        const increment = voteType === 'up' ? -1 : 0; // only track upvotes in likeCount
        if (targetType === 'question') {
          await prisma.question.update({
            where: { id: targetId },
            data: { likeCount: { increment } },
          });
        } else {
          await prisma.answer.update({
            where: { id: targetId },
            data: { likeCount: { increment } },
          });
        }
        return { action: 'removed', voteType };
      } else {
        // Switch vote direction
        await prisma.qAVote.update({
          where: { id: existingVote.id },
          data: { voteType },
        });
        // Up -> Down: likeCount -1, Down -> Up: likeCount +1
        const increment = voteType === 'up' ? 1 : -1;
        if (targetType === 'question') {
          await prisma.question.update({
            where: { id: targetId },
            data: { likeCount: { increment } },
          });
        } else {
          await prisma.answer.update({
            where: { id: targetId },
            data: { likeCount: { increment } },
          });
        }
        return { action: 'switched', voteType };
      }
    }

    // Create new vote
    await prisma.qAVote.create({
      data: { targetType, targetId, userId: user.id, voteType },
    });

    if (voteType === 'up') {
      if (targetType === 'question') {
        await prisma.question.update({
          where: { id: targetId },
          data: { likeCount: { increment: 1 } },
        });
      } else {
        await prisma.answer.update({
          where: { id: targetId },
          data: { likeCount: { increment: 1 } },
        });
      }
      // Score: +1 for liking someone else's content
      addScore(user.id, 1);
    }

    return { action: 'created', voteType };
  });
}
