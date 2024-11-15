import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Eye, Loader, Search } from 'lucide-react';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

import { useMainContext } from '@/context/main-context';
import { db } from '@/api/firebase';

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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import StudentsDataTable from '@/components/students/data-table';
import GroupHeader from '@/components/groups/header';
import BreadcrumbComponent from '@/components/breadcrumb';
import EditDialog from '@/components/dialogs/edit-dialog';
import StudentEdit from '@/components/students/edit';
import AddAbsenteeDialog from '@/components/dialogs/add-absentee';
import ListAbsenteeDialog from '@/components/dialogs/list-absentee';
import DeleteAlert from '@/components/dialogs/delete-alert';
import AddExamDialog from '@/components/dialogs/add-exam';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import Evaluation from '@/components/groups/evaluation/evaluation';
import Tasks from '@/components/groups/tasks/tasks';

const Group = () => {
  const { groupId } = useParams();

  const { groups, courses, adminId, groupStudents, setGroupStudents } =
    useMainContext();
  const group = groups.find((g) => g.id === groupId);
  const { toast } = useToast();

  const [openStudentEditDialog, setOpenStudentEditDialog] = useState(false);
  const [openStudentDeleteDialog, setOpenStudentDeleteDialog] = useState(false);
  const [openAddAbsenteeDialog, setOpenAddAbsenteeDialog] = useState(false);
  const [showAbsenteeStudentsDialog, setShowAbsenteeStudentsDialog] =
    useState(false);
  const [openAddExam, setOpenAddExam] = useState(false);
  const [openAddEvaluation, setOpenAddEvaluation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [disabled, setDisabled] = useState({});

  const [filteredExams, setFilteredExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debounceRef = useRef(null);

  const fetchGroupStudents = useCallback(async () => {
    setLoadingStudents(true);

    try {
      const groupRef = doc(db, `users/${adminId}/groups`, groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const studentIds = groupData.students || [];

        if (studentIds.length > 0) {
          const studentsRef = collection(db, `students`);
          const q = query(studentsRef, where('__name__', 'in', studentIds));

          const querySnapshot = await getDocs(q);
          const fetchedStudents = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setGroupStudents(fetchedStudents);
        } else {
          setGroupStudents([]);
        }
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
    } finally {
      setLoadingStudents(false);
    }
  }, [adminId, groupId]);

  useEffect(() => {
    if (groupId) {
      fetchGroupStudents();
    }
  }, [groupId, fetchGroupStudents]);

  const [exams, setExams] = useState([]);

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
      setLoading(false);
    }
  };
  const toggleIsShow = useCallback(
    async (examId, currentIsShow) => {
      setDisabled((prev) => ({ ...prev, [examId]: true }));
      try {
        const examDocRef = doc(
          db,
          `users/${adminId}/groups/${groupId}/exams`,
          examId
        );
        await updateDoc(examDocRef, { isShow: !currentIsShow });
        setExams((prevExams) =>
          prevExams.map((exam) =>
            exam.id === examId ? { ...exam, isShow: !currentIsShow } : exam
          )
        );
        toast({
          title: `${
            currentIsShow
              ? "Imtihon o'quvchilardan berkitildi"
              : "Imtihon o'quvchilarga ko'rinmoqda"
          }`,
        });
      } catch (err) {
        console.error("Error updating 'isShow':", err);
      } finally {
        setDisabled((prev) => ({ ...prev, [examId]: false }));
      }
    },
    [adminId, groupId]
  );

  useEffect(() => {
    fetchExams();
  }, [adminId, groupId]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const filtered = exams.filter(
        (exam) =>
          exam.isShow &&
          (!searchTerm ||
            exam.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      setFilteredExams(filtered);
    }, 300);

    return () => {
      clearTimeout(debounceRef.current);
    };
  }, [searchTerm, exams]);

  if (!group) {
    return (
      <div className="px-4 lg:px-8 mx-auto py-4">
        <h2 className="text-2xl font-bold tracking-tight">404 error</h2>
        <p className="text-muted-foreground">
          Siz qidirayotgan guruh topilmadi!
        </p>
      </div>
    );
  }
  return (
    <div className="px-4 lg:px-8 mt-4">
      <BreadcrumbComponent
        title="Guruhlar ro'yxati"
        titleLink="/groups"
        subtitle={`${
          courses.filter((item) => item.id === group.courseId)[0]?.courseTitle
        } #${group.groupNumber}`}
      />
      <GroupHeader group={group} />

      <EditDialog
        open={openStudentEditDialog}
        setOpen={setOpenStudentEditDialog}
      >
        <StudentEdit />
      </EditDialog>

      <DeleteAlert
        open={openStudentDeleteDialog}
        setOpen={setOpenStudentDeleteDialog}
      />

      <AddAbsenteeDialog
        open={openAddAbsenteeDialog}
        setOpen={setOpenAddAbsenteeDialog}
      />

      <ListAbsenteeDialog
        open={showAbsenteeStudentsDialog}
        setOpen={setShowAbsenteeStudentsDialog}
      />

      <AddExamDialog
        open={openAddExam}
        setOpen={setOpenAddExam}
        groupId={groupId}
        fetchExams={fetchExams}
      />

      <Tabs defaultValue="students" className="mt-4">
        <TabsList>
          <TabsTrigger value="students">O'quvchilar ro'yxati</TabsTrigger>
          <TabsTrigger className="hidden" value="attendance_check">
            Yo'qlamalar
          </TabsTrigger>
          <TabsTrigger value="tasks">Vazifalar</TabsTrigger>
          <TabsTrigger value="evaluation">Baholash</TabsTrigger>
          <TabsTrigger value="exams">Imtihonlar</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <StudentsDataTable data={groupStudents} loading={loadingStudents} />
        </TabsContent>
        <TabsContent value="attendance_check">
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <Input placeholder="Enter date" className="max-w-md" />
              <Button
                onClick={() => setOpenAddAbsenteeDialog(true)}
                variant="secondary"
                className="dark:bg-white dark:text-black"
              >
                Yo'qlama qilsh
              </Button>
            </div>

            <Table className="rounded-b-md">
              <TableCaption className="hidden">
                A list of absent students for the selected date.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-72 rounded-tl-md">Sana</TableHead>
                  <TableHead>Nechtadan</TableHead>
                  <TableHead>Foizda (%)</TableHead>
                  <TableHead className="text-right rounded-tr-md"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Sample data */}
                <TableRow>
                  <TableCell className="font-medium">12.11.2024</TableCell>
                  <TableCell>9/10</TableCell>
                  <TableCell>90%</TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => setShowAbsenteeStudentsDialog(true)}
                      variant="link"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Eye className="w-5 h-5" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <small>Batafsil</small>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium rounded-bl-lg">
                    23.12.2023
                  </TableCell>
                  <TableCell>8/10</TableCell>
                  <TableCell>80%</TableCell>
                  <TableCell className="text-right rounded-br-lg">
                    <Button
                      onClick={() => setShowAbsenteeStudentsDialog(true)}
                      variant="link"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Eye className="w-5 h-5" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <small>Batafsil</small>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Button>
                  </TableCell>
                  https://chatgpt.com/c/672f877d-77e0-8001-aa7f-a3d17d7006cd{' '}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="tasks">
          <Tasks groupId={groupId} adminId={adminId} />
        </TabsContent>
        <TabsContent value="evaluation">
          <Evaluation
            groupId={groupId}
            students={groupStudents}
            groupStudents={groupStudents}
          />
        </TabsContent>
        <TabsContent value="exams">
          <div className="space-y-2 pt-2">
            <div className="flex items-center">
              <div className="relative">
                <Input
                  className="peer pe-9 ps-9 w-full lg:w-96"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Imtihonni qidirish..."
                  type="search"
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <Search size={16} strokeWidth={2} />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table className="min-w-[50rem] w-full">
                <TableCaption className="hidden">
                  A list of absent students for the selected date.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-72 rounded-tl-md">Title</TableHead>
                    <TableHead>Start date</TableHead>
                    <TableHead>End date</TableHead>
                    <TableHead>Place</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="rounded-tr-md text-center">
                      View
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow>
                      <Link to={`/groups/${groupId}/exam/${exam.id}`}>
                        <TableCell className="w-72">{exam?.title}</TableCell>
                      </Link>
                      <TableCell className="whitespace-nowrap">{exam?.start}</TableCell>
                      <TableCell className="whitespace-nowrap">{exam?.end}</TableCell>
                      <TableCell>{exam?.type}</TableCell>
                      <TableCell>{exam?.status}</TableCell>
                      <TableCell className="text-center">
                        <Link to={`/groups/${groupId}/exam/${exam.id}`}>
                          <Button
                            onClick={() => setShowAbsenteeStudentsDialog(true)}
                            variant="link"
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Eye className="w-5 h-5" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <small>Batafsil</small>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Group;
