import NewsletterSubscriber from '../models/NewsletterSubscriber';

export async function subscribe(email: string, source?: string): Promise<{ isNew: boolean }> {
  const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
  
  if (existing) {
    // If previously unsubscribed, reactivate
    if (!existing.isActive) {
      existing.isActive = true;
      existing.source = source || existing.source;
      await existing.save();
      return { isNew: false };
    }
    return { isNew: false };
  }

  await NewsletterSubscriber.create({
    email: email.toLowerCase(),
    source,
    isActive: true,
  });

  return { isNew: true };
}

export async function unsubscribe(email: string): Promise<boolean> {
  const result = await NewsletterSubscriber.updateOne(
    { email: email.toLowerCase() },
    { $set: { isActive: false } }
  );
  return result.modifiedCount > 0;
}

export async function getSubscriberCount(): Promise<number> {
  return NewsletterSubscriber.countDocuments({ isActive: true });
}
