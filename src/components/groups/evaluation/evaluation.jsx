import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParams } from 'react-router-dom';
import { useMainContext } from '@/context/main-context';
import { useEffect, useRef, useState } from 'react';
import AddEvaluation from '@/components/dialogs/add-evaluation';
import { X } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/api/firebase';
import { format } from 'date-fns';
import DeleteAlert from '@/components/dialogs/delete-alert';
import EditDialog from '@/components/dialogs/edit-dialog';
import EditEvaluation from './edit';

function Evaluation({ groupId, students }) {
  const { adminId, studentId } = useMainContext();
  const [openAddEvaluation, setOpenAddEvaluation] = useState(false);
  const [loading, setLoading] = useState(true);

  const [id, setId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const student = students.find((s) => s.id === studentId);
  // const studentEvaluations= evaluations.filter
  console.log(evaluations);

  const convertTimestampToDate = (timestamp) => {
    return new Date(timestamp.seconds * 1000);
  };

  // Step 1: Filter evaluations for the specific studentId
  const studentEvaluations = evaluations.filter((item) => {
    const hasStudent = item.students.some(
      (student) => student.id === studentId
    );
    console.log('Checking item:', item);
    console.log('Student found:', hasStudent);
    return hasStudent;
  });

  // Step 2: Check if we have any evaluations for the student
  if (studentEvaluations.length === 0) {
    console.warn('No evaluations found for studentId:', studentId);
  }

  // Step 3: Sort the filtered evaluations by timestamp
  const sortedEvaluations = studentEvaluations.sort((a, b) => {
    return a.timestamp.seconds - b.timestamp.seconds;
  });

  // Step 4: Filter evaluations by selected date (if provided)
  const filteredEvaluations = sortedEvaluations.filter((evaluation) => {
    if (!selectedDate) return true;

    const evaluationDate = convertTimestampToDate(evaluation.timestamp);
    const isSameDate =
      evaluationDate.toLocaleDateString('en-GB') ===
      selectedDate.toLocaleDateString('en-GB');

    console.log('Evaluation Date:', evaluationDate);
    console.log('Selected Date:', selectedDate);
    console.log('Is same date:', isSameDate);

    return isSameDate;
  });

  // Optional: Log the final filtered evaluations
  console.log('Filtered Evaluations:', filteredEvaluations);

  const clearDate = () => setSelectedDate(null);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const evaluationsRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/evaluations`
      );
      const querySnapshot = await getDocs(evaluationsRef);

      const evaluationsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEvaluations(evaluationsList);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [adminId, groupId]);

  return (
    <>
      <AddEvaluation
        open={openAddEvaluation}
        setOpen={setOpenAddEvaluation}
        groupId={groupId}
        groupStudents={students}
        fetch={fetchEvaluations}
      />

      <EditDialog open={openEdit} setOpen={setOpenEdit}>
        <EditEvaluation
          id={id}
          evaluations={evaluations}
          groupId={groupId}
          setOpen={setOpenEdit}
          fetch={fetchEvaluations}
        />
      </EditDialog>

      <DeleteAlert
        id={id}
        collection={`users/${adminId}/groups/${groupId}/evaluations`}
        open={openDelete}
        setOpen={setOpenDelete}
        fetch={fetchEvaluations}
      />

      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between gap-2">
          <div className="relative">
            <ReactDatePicker
              placeholderText="Select date"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd.MM.yyyy"
              className="w-fit lg:w-80 py-2 px-3 border rounded-md bg-background"
            />
            {selectedDate && (
              <X
                onClick={clearDate}
                className="absolute top-1/2 -translate-y-1/2 right-2 lg:right-3 h-4 w-4 cursor-pointer"
              />
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg">
          <div className="inline-flex border border-border rounded-lg min-w-fit">
            <div className="flex-shrink-0 w-44 md:w-52 !sticky left-0 bg-muted/50 z-10 shadow">
              <div className="font-medium text-sm p-4 border-b border-border">
                O'quvchi ismi
              </div>
              <div className="p-4 text-sm border-b  border-border whitespace-nowrap truncate bg-muted/50">
                {student?.fullName}
              </div>
            </div>

            <div className="flex overflow-x-auto rounded-r-lg">
              {filteredEvaluations.map((evaluation) => {
                function formatDate(timestamp) {
                  const { seconds, nanoseconds } = timestamp;
                  const date = new Date(seconds * 1000 + nanoseconds / 1000000);
                  return format(date, 'dd.MM.yy');
                }
                const studentScore =
                  evaluation.students.find((s) => s.id === studentId)?.score ||
                  '-';

                return (
                  <div key={evaluation.id} className="flex-shrink-0 group">
                    <div className="relative p-3.5 border-l border-border border-b bg-muted/50">
                      <span className="text-xs text-muted-foreground font-medium">
                        {formatDate(evaluation.timestamp)}
                      </span>
                    </div>

                    <div
                      className={`flex items-center text-sm justify-center p-4 border-l border-b  border-border font-bold`}
                    >
                      {studentScore}
                    </div>
                  </div>
                );
              })}
              {filteredEvaluations.length === 0 && (
                <div className="flex-shrink-0 group flex items-center justify-center w-full px-3">
                  <p className="text-muted-foreground text-sm whitespace-nowrap">
                    Ma'lumot topilmadi.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Evaluation;
