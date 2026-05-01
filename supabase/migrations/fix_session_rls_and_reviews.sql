-- Allow teachers to also insert sessions (for Campus Feed "Help Out" and matching flows)
-- The original schema only has: auth.uid() = learner_id
-- This adds: OR auth.uid() = teacher_id
ALTER POLICY "Learners can insert sessions." ON public.sessions
USING (true)
WITH CHECK (auth.uid() = learner_id OR auth.uid() = teacher_id);

-- Allow session participants to delete their sessions (for cancellation)
CREATE POLICY "Participants can delete sessions." ON public.sessions
FOR DELETE USING (auth.uid() = teacher_id OR auth.uid() = learner_id);
