import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body, query } = req;
  const userId = query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const noteRef = db.collection('users').doc(userId);

  switch (method) {
    case 'GET':
      try {
        const doc = await noteRef.get();
        if (!doc.exists) {
          return res.status(404).json({ error: 'Note not found' });
        }
        return res.status(200).json({ note: doc.data()?.note });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch note' });
      }

    case 'POST':
      try {
        await noteRef.set({ note: body.note }, { merge: true });
        return res.status(200).json({ message: 'Note updated successfully' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update note' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}