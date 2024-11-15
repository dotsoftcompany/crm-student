import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '@/api/firebase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMainContext } from '@/context/main-context';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';

function Questions({ adminId, groupId, examId }) {
  const { studentData } = useMainContext();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const options = ['A', 'B', 'C', 'D'];

  const { toast } = useToast();

  // Check localStorage for submission status of the current exam
  useEffect(() => {
    const submittedStatus = localStorage.getItem(`exam-${examId}-submitted`);
    setIsSubmitted(submittedStatus === 'true');
  }, [examId]);

  const handleAnswerSelect = (questionIndex, answerOption) => {
    if (!isSubmitted) {
      const updatedAnswers = [...studentAnswers];
      updatedAnswers[questionIndex] = answerOption;
      setStudentAnswers(updatedAnswers);

      // Save the updated answers to localStorage
      localStorage.setItem(
        `exam-${examId}-answers`,
        JSON.stringify(updatedAnswers)
      );
    }
  };

  const handleSaveAnswers = async () => {
    // Check if all questions have been answered
    if (studentAnswers.some((answer) => !answer)) {
      toast({
        variant: 'destructive',
        title: 'Barchasi belgilanmadi!',
        description:
          'Iltimos barcha savollarga javob berganingizga ishonch komil qiling!',
      });
      return;
    }

    try {
      const submittedStudentRef = doc(
        db,
        `users/${adminId}/groups/${groupId}/exams/${examId}/submittedStudents`,
        studentData.id
      );

      await setDoc(submittedStudentRef, {
        id: studentData.id,
        fullName: studentData.fullName,
        answers: studentAnswers,
        timestamp: new Date().getTime(),
      });

      setIsSubmitted(true);
      // Save the submission status to localStorage
      localStorage.setItem(`exam-${examId}-submitted`, 'true');
      toast({
        title: 'Student answers submitted successfully',
      });
    } catch (err) {
      console.error('Error submitting student answers:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const questionsRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/exams/${examId}/questions`
      );

      const questionsQuery = query(questionsRef, orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(questionsQuery);

      const questionsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setQuestions(questionsList);

      const savedAnswers = JSON.parse(
        localStorage.getItem(`exam-${examId}-answers`)
      );
      setStudentAnswers(
        savedAnswers || new Array(questionsList.length).fill('')
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [adminId, groupId, examId]);

  if (loading) {
    return (
      <ul className="w-full">
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={index} className="w-full">
            <div className="flex items-center justify-between my-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="border border-border rounded-md">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center py-2.5 px-4 first:rounded-t-md last:rounded-b-md border-b border-border"
                >
                  <Skeleton className="w-5 h-5 rounded-full mr-4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (error) return <p>Error fetching questions: {error}</p>;

  return (
    <div>
      {!questions.length && (
        <p className="text-center text-muted-foreground my-10">
          Hali savol qo'shilmagan
        </p>
      )}

      <ul className="w-full">
        {questions.map((question, qIndex) => (
          <li key={question.id} className="w-full mb-4">
            <span className="flex my-2">
              <h2 className="text-lg font-semibold">
                {qIndex + 1}. {question.title}
              </h2>
            </span>
            <ul className="border border-border rounded-md">
              {question.answers.map((option, index) => (
                <li
                  key={index}
                  className={`flex items-center py-2.5 px-4 first:rounded-t-md last:rounded-b-md border-b border-border group ${
                    studentAnswers[qIndex] === options[index]
                      ? 'bg-blue-500 text-white'
                      : isSubmitted
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-blue-500'
                  }`}
                  onClick={() => handleAnswerSelect(qIndex, options[index])}
                >
                  <span
                    className={`flex items-center justify-center rounded-full bg-blue-500 text-xs w-5 h-5 ${
                      studentAnswers[qIndex] === options[index]
                        ? 'bg-white text-blue-500'
                        : ''
                    }`}
                  >
                    {options[index]}
                  </span>
                  <span className="text-sm ml-4">{option}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <Button
        onClick={handleSaveAnswers}
        className="mt-4"
        disabled={isSubmitted}
      >
        {isSubmitted ? 'Javoblar yuborilgan' : 'Javoblarni yuborish'}
      </Button>
    </div>
  );
}

export default Questions;
