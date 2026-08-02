import { and, asc, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { db } from '../db/index.js';
import { answers, qaVotes, questions, users } from '../db/schema.js';

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
  db.update(users)
    .set({ score: sql`${users.score} + ${points}` })
    .where(eq(users.id, userId))
    .catch(() => {});
}

export async function qaRoutes(app: FastifyInstance) {
  // GET /api/questions — list with pagination, search, tag filter, status filter, sorting
  app.get('/questions', async request => {
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

    // Fix 30: search/tag/status 全部下推 SQL，分页下沉 limit/offset（原实现全表拉取后 JS 过滤）
    const conditions: any[] = [];
    if (query.status && ['open', 'resolved', 'closed'].includes(query.status)) {
      conditions.push(eq(questions.status, query.status));
    }
    if (query.search) {
      const q = `%${query.search}%`;
      conditions.push(or(ilike(questions.title, q), ilike(questions.content, q)));
    }
    if (query.tag) {
      // tags 为 jsonb 数组，@> 下推（参数绑定，防注入）
      conditions.push(sql`${questions.tags} @> ${JSON.stringify([query.tag])}::jsonb`);
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const orderByExpr =
      query.sort === 'views'
        ? desc(questions.viewCount)
        : query.sort === 'likes'
          ? desc(questions.likeCount)
          : query.sort === 'answers'
            ? desc(questions.answerCount)
            : desc(questions.createdAt);

    const [totalRow, rows] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(questions).where(where),
      db
        .select({
          question: questions,
          author: { id: users.id, username: users.username, avatar: users.avatar },
        })
        .from(questions)
        .leftJoin(users, eq(questions.authorId, users.id))
        .where(where)
        .orderBy(orderByExpr)
        .limit(pageSize)
        .offset(skip),
    ]);

    const total = totalRow?.[0]?.count ?? 0;

    // Answer counts per question — 仅当前页（原实现全表 groupBy）
    const ids = rows.map(r => r.question.id);
    const countRows =
      ids.length > 0
        ? await db
            .select({ questionId: answers.questionId, count: sql<number>`count(*)::int` })
            .from(answers)
            .where(inArray(answers.questionId, ids))
            .groupBy(answers.questionId)
        : [];
    const answerCountMap = new Map(countRows.map(r => [r.questionId, r.count]));

    return {
      data: rows.map(r => ({
        ...r.question,
        author: r.author,
        tags: r.question.tags ?? [],
        answerCount: answerCountMap.get(r.question.id) ?? 0,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // GET /api/questions/:id — detail with answers
  app.get('/questions/:id', async request => {
    const { id } = request.params as { id: string };
    const questionId = parseInt(id, 10);
    if (isNaN(questionId)) {
      throw { statusCode: 400, message: 'Invalid question ID' };
    }

    // Increment view count
    await db
      .update(questions)
      .set({ viewCount: sql`${questions.viewCount} + 1` })
      .where(eq(questions.id, questionId));

    const [row] = await db
      .select({
        question: questions,
        author: { id: users.id, username: users.username, avatar: users.avatar },
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!row) {
      throw { statusCode: 404, message: 'Question not found' };
    }

    const answerRows = await db
      .select({
        answer: answers,
        author: { id: users.id, username: users.username, avatar: users.avatar },
      })
      .from(answers)
      .leftJoin(users, eq(answers.authorId, users.id))
      .where(eq(answers.questionId, questionId))
      .orderBy(desc(answers.isAccepted), desc(answers.likeCount), asc(answers.createdAt));

    return {
      ...row.question,
      author: row.author,
      answers: answerRows.map(r => ({ ...r.answer, author: r.author })),
      tags: row.question.tags ?? [],
    };
  });

  // POST /api/questions — ask a question
  app.post('/questions', { onRequest: [(app as any).authenticate] }, async request => {
    const parsed = createQuestionSchema.safeParse(request.body);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid input' };
    }
    const user = request.user as { id: number };

    const [question] = await db
      .insert(questions)
      .values({
        title: parsed.data.title,
        content: parsed.data.content,
        tags: parsed.data.tags,
        authorId: user.id,
      })
      .returning();

    const [author] = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    // Score: +2 for asking a question
    addScore(user.id, 2);

    return { ...question, author: author ?? null, tags: parsed.data.tags };
  });

  // PUT /api/questions/:id — edit question
  app.put('/questions/:id', { onRequest: [(app as any).authenticate] }, async request => {
    const parsed = updateQuestionSchema.safeParse(request.body);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid input' };
    }
    const { id } = request.params as { id: string };
    const questionId = parseInt(id, 10);
    const user = request.user as { id: number };

    const [existing] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
    if (!existing) throw { statusCode: 404, message: 'Question not found' };
    if (existing.authorId !== user.id) throw { statusCode: 403, message: 'Forbidden' };

    const data: any = { ...parsed.data };
    // tags is a jsonb array in Drizzle — no stringify needed

    const [question] = await db
      .update(questions)
      .set(data)
      .where(eq(questions.id, questionId))
      .returning();

    const [author] = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, question.authorId))
      .limit(1);

    return { ...question, author: author ?? null, tags: question.tags ?? [] };
  });

  // DELETE /api/questions/:id — delete question
  app.delete('/questions/:id', { onRequest: [(app as any).authenticate] }, async request => {
    const { id } = request.params as { id: string };
    const questionId = parseInt(id, 10);
    const user = request.user as { id: number };

    const [existing] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
    if (!existing) throw { statusCode: 404, message: 'Question not found' };
    if (existing.authorId !== user.id) throw { statusCode: 403, message: 'Forbidden' };

    await db.delete(questions).where(eq(questions.id, questionId));
    return { message: 'Question deleted' };
  });

  // POST /api/questions/:id/answers — answer a question
  app.post('/questions/:id/answers', { onRequest: [(app as any).authenticate] }, async request => {
    const parsed = createAnswerSchema.safeParse(request.body);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid input' };
    }
    const { id } = request.params as { id: string };
    const questionId = parseInt(id, 10);
    const user = request.user as { id: number };

    const [question] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
    if (!question) throw { statusCode: 404, message: 'Question not found' };
    if (question.status === 'closed') throw { statusCode: 400, message: 'Question is closed' };

    const [answer] = await db
      .insert(answers)
      .values({
        content: parsed.data.content,
        questionId,
        authorId: user.id,
      })
      .returning();

    const [author] = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    await db
      .update(questions)
      .set({ answerCount: sql`${questions.answerCount} + 1` })
      .where(eq(questions.id, questionId));

    return { ...answer, author: author ?? null };
  });

  // PUT /api/answers/:id — edit answer
  app.put('/answers/:id', { onRequest: [(app as any).authenticate] }, async request => {
    const parsed = updateAnswerSchema.safeParse(request.body);
    if (!parsed.success) {
      throw { statusCode: 400, message: 'Invalid input' };
    }
    const { id } = request.params as { id: string };
    const answerId = parseInt(id, 10);
    const user = request.user as { id: number };

    const [existing] = await db.select().from(answers).where(eq(answers.id, answerId)).limit(1);
    if (!existing) throw { statusCode: 404, message: 'Answer not found' };
    if (existing.authorId !== user.id) throw { statusCode: 403, message: 'Forbidden' };

    const [answer] = await db
      .update(answers)
      .set({ content: parsed.data.content })
      .where(eq(answers.id, answerId))
      .returning();

    const [author] = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, answer.authorId))
      .limit(1);

    return { ...answer, author: author ?? null };
  });

  // POST /api/answers/:id/accept — accept answer (question author only)
  app.post('/answers/:id/accept', { onRequest: [(app as any).authenticate] }, async request => {
    const { id } = request.params as { id: string };
    const answerId = parseInt(id, 10);
    const user = request.user as { id: number };

    const [answer] = await db.select().from(answers).where(eq(answers.id, answerId)).limit(1);
    if (!answer) throw { statusCode: 404, message: 'Answer not found' };

    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, answer.questionId))
      .limit(1);
    if (!question) throw { statusCode: 404, message: 'Question not found' };
    if (question.authorId !== user.id)
      throw { statusCode: 403, message: 'Only the question author can accept an answer' };
    if (question.status === 'closed')
      throw { statusCode: 400, message: 'Question is closed' };

    // Un-accept any previously accepted answer
    await db
      .update(answers)
      .set({ isAccepted: false })
      .where(and(eq(answers.questionId, answer.questionId), eq(answers.isAccepted, true)));

    // Accept this answer
    await db.update(answers).set({ isAccepted: true }).where(eq(answers.id, answerId));

    await db
      .update(questions)
      .set({ status: 'resolved', acceptedAnswerId: answerId })
      .where(eq(questions.id, answer.questionId));

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
    const user = request.user as { id: number };
    const { targetType, targetId, voteType } = parsed.data;

    // Check existing vote
    const [existingVote] = await db
      .select()
      .from(qaVotes)
      .where(
        and(
          eq(qaVotes.targetType, targetType),
          eq(qaVotes.targetId, targetId),
          eq(qaVotes.userId, user.id)
        )
      )
      .limit(1);

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off — remove vote
        await db.delete(qaVotes).where(eq(qaVotes.id, existingVote.id));
        const increment = voteType === 'up' ? -1 : 0; // only track upvotes in likeCount
        if (targetType === 'question') {
          await db
            .update(questions)
            .set({ likeCount: sql`${questions.likeCount} + ${increment}` })
            .where(eq(questions.id, targetId));
        } else {
          await db
            .update(answers)
            .set({ likeCount: sql`${answers.likeCount} + ${increment}` })
            .where(eq(answers.id, targetId));
        }
        return { action: 'removed', voteType };
      } else {
        // Switch vote direction
        await db.update(qaVotes).set({ voteType }).where(eq(qaVotes.id, existingVote.id));
        // Up -> Down: likeCount -1, Down -> Up: likeCount +1
        const increment = voteType === 'up' ? 1 : -1;
        if (targetType === 'question') {
          await db
            .update(questions)
            .set({ likeCount: sql`${questions.likeCount} + ${increment}` })
            .where(eq(questions.id, targetId));
        } else {
          await db
            .update(answers)
            .set({ likeCount: sql`${answers.likeCount} + ${increment}` })
            .where(eq(answers.id, targetId));
        }
        return { action: 'switched', voteType };
      }
    }

    // Create new vote
    await db.insert(qaVotes).values({ targetType, targetId, userId: user.id, voteType });

    if (voteType === 'up') {
      if (targetType === 'question') {
        await db
          .update(questions)
          .set({ likeCount: sql`${questions.likeCount} + 1` })
          .where(eq(questions.id, targetId));
      } else {
        await db
          .update(answers)
          .set({ likeCount: sql`${answers.likeCount} + 1` })
          .where(eq(answers.id, targetId));
      }
      // Score: +1 for liking someone else's content
      addScore(user.id, 1);
    }

    return { action: 'created', voteType };
  });
}
