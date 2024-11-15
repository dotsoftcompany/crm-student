import { db } from '@/api/firebase';
import BreadcrumbComponent from '@/components/breadcrumb';
import AddQuestion from '@/components/groups/exam/add-question';
import ExamHeader from '@/components/groups/exam/exam-header';
import Questions from '@/components/groups/exam/questions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useMainContext } from '@/context/main-context';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { Eye, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const GroupExam = () => {
  const { adminId } = useMainContext();

  const { groupId, examId } = useParams();

  const { groups, courses } = useMainContext();
  const group = groups.find((g) => g.id === groupId);

  const [exams, setExams] = useState([]);
  const [groupStudents, setGroupStudents] = useState([]);
  const [submittedStudents, setSubmittedStudents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  const exam = exams.find((ex) => ex.id === examId);

  const fetchExams = async () => {
    try {
      const examsRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/exams`
      );
      const querySnapshot = await getDocs(examsRef);

      const examsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setExams(examsList);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchGroupStudents = async () => {
    setLoading(true);

    try {
      const groupRef = doc(db, `users/${adminId}/groups`, groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const studentIds = groupData.students || [];
        console.log('Student IDs:', studentIds);

        if (studentIds.length > 0) {
          const studentsRef = collection(db, `students`);
          const q = query(
            studentsRef,
            where('__name__', 'in', studentIds.slice(0, 10))
          ); // Only the first 10 IDs

          const querySnapshot = await getDocs(q);
          const fetchedStudents = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setGroupStudents(fetchedStudents);
        } else {
          setGroupStudents([]);
        }
      } else {
        console.log('Group not found.');
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedStudents = async () => {
    try {
      const submittedStudentsRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/exams/${examId}/submittedStudents`
      );
      const querySnapshot = await getDocs(submittedStudentsRef);

      const submittedStudentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSubmittedStudents(submittedStudentsList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupStudents();
    fetchExams();
    fetchSubmittedStudents();
  }, [adminId, groupId]);

  function formatDate(timestamp) {
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  }

  if (!group) {
    return (
      <div className="px-4 lg:px-8 mx-auto py-4">
        <h2 className="text-2xl font-bold tracking-tight">Yuklanmoqda</h2>
        <p className="text-muted-foreground">
          Siz qidirayotgan guruh topilmadi!
        </p>
      </div>
    );
  }

  const mergedStudents = groupStudents.map((groupStudent) => {
    const submittedStudent = submittedStudents.find(
      (subStudent) => subStudent.id === groupStudent.id
    );

    return submittedStudent || groupStudent;
  });

  return (
    <div className="px-4 lg:px-8 mt-4">
      <BreadcrumbComponent
        title="Guruhlar ro'yxati"
        titleLink="/groups"
        subtitle={`${
          courses.filter((item) => item.id === group.courseId)[0].courseTitle
        } #${group.groupNumber}`}
        subtitleLink={`/groups/${groupId}`}
        subtitle2={`${exam?.title} (exam)`}
      />
      <ExamHeader exam={exam} loading={loading} />

      <Tabs defaultValue="questions" className="py-4">
        <TabsList>
          <TabsTrigger value="questions">Savollar</TabsTrigger>
          <TabsTrigger value="results">Natijalar</TabsTrigger>
        </TabsList>
        <TabsContent value="questions">
          <Questions adminId={adminId} groupId={groupId} examId={examId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupExam;
